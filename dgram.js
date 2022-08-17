/**
 * @module Dgram
 *
 * This module provides an implementation of UDP datagram sockets. It does
 * not (yet) provide any of the multicast methods or properties.
 */

import { Buffer } from 'buffer'

import { EventEmitter } from './events.js'
import { isIPv4 } from './net.js'
import * as dns from './dns.js'
import * as ipc from './ipc.js'
import { rand64, isArrayBufferView } from './util.js'

const BIND_STATE_UNBOUND = 0
const BIND_STATE_BINDING = 1
const BIND_STATE_BOUND = 2

const CONNECT_STATE_DISCONNECTED = 0
const CONNECT_STATE_CONNECTING = 1
const CONNECT_STATE_CONNECTED = 2

const fixBufferList = list => {
  const newlist = new Array(list.length)

  for (let i = 0, l = list.length; i < l; i++) {
    const buf = list[i]

    if (typeof buf === 'string') {
      newlist[i] = Buffer.from(buf)
    } else if (!isArrayBufferView(buf)) {
      return null
    } else {
      newlist[i] = Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength)
    }
  }

  return newlist
}

/*
 * New instances of dgram.Socket are created using dgram.createSocket().
 * The new keyword is not to be used to create dgram.Socket instances.
 */
export class Socket extends EventEmitter {
  constructor (options, callback) {
    super()

    this.id = rand64()

    const validTypeString = typeof options === 'string' && ['udp4', 'udp6'].includes(options)
    const validTypeObject = typeof options === 'object' && options !== null && ['udp4', 'udp6'].includes(options.type)

    if (!validTypeString && !validTypeObject) {
      const err = new TypeError('Bad socket type specified. Valid types are: udp4, udp6')
      err.code = 'ERR_SOCKET_BAD_TYPE'
      throw err
    }

    if (typeof options === 'string') {
      options = { type: options }
    }

    this.type = options.type

    this.state = {
      recvBufferSize: options.recvBufferSize,
      sendBufferSize: options.sendBufferSize,
      _bindState: BIND_STATE_UNBOUND,
      _connectState: CONNECT_STATE_DISCONNECTED,
      reuseAddr: options.reuseAddr,
      ipv6Only: options.ipv6Only
    }

    if (callback) {
      this.on('message', callback)
    }

    options.signal?.addEventListener('abort', () => this.close())
  }

  async _recvStart () {
    return await ipc.write('udpReadStart', { id: this.id })
  }

  /**
   * Listen for datagram messages on a named port and optional address
   * If address is not specified, the operating system will attempt to
   * listen on all addresses. Once binding is complete, a 'listening'
   * event is emitted and the optional callback function is called.
   *
   * If binding fails, an 'error' event is emitted.
   *
   * @param {number} port - The port to to listen for messages on
   * @param {string} address - The address to bind to (0.0.0.0)
   * @param {function} callback - With no parameters. Called when binding is complete.
   */
  bind (arg1, arg2, cb) {
    let options = {}

    if (typeof arg2 === 'function') {
      cb = arg2
      options.address = undefined
    }

    if (typeof arg1 === 'number') {
      options.port = arg1
      options.address = arg2
    } else if (typeof arg1 === 'object') {
      options = { ...arg1 }
    } else {
      throw new Error('invalid arguments')
    }

    function removeListeners () {
      this.removeListener('close', removeListeners)
      this.removeListener('error', removeListeners)
    }

    function onListening () {
      Function.prototype.call(removeListeners, this)
      if (cb) Function.prototype.call(cb, this)
    }

    this.on('error', removeListeners)
    this.once('listening', onListening)

    if (!options.address) {
      if (this.type === 'udp4') {
        options.address = '0.0.0.0'
      } else {
        options.address = '::'
      }
    } else if (!isIPv4(options.address)) {
      // fire off a dns lookup, listening or error will be emitted in response
      ipc.write('dnsLookup', {
        hostname: options.address,
        id: this.id,
        seq: -1
      })
    }

    const { err: errBind, data } = ipc.sendSync('udpBind', {
      id: this.id,
      address: options.address,
      port: options.port || 0,
      reuseAddr: options.reuseAddr ? "true" : "false",
      ipv6Only: options.ipv6Only ? "true" : "false"
    })

    if (errBind) {
      this.emit('error', errBind)
      return { err: errBind }
    }

    this.state._bindState = BIND_STATE_BOUND
    setTimeout(() => this.emit('listening'), 1)

    this._address = options.address
    this._port = options.port
    this._family = isIPv4(options.address) ? 'IPv4' : 'IPv6'

    const listener = e => {
      const { data: buffer, params } = e.detail
      const { err, data } = params

      if (err && err.id === this.id) {
        return this.emit('error', err)
      }

      if (!data || BigInt(data.id) !== this.id) return

      if (data.source === 'dnsLookup') {
        this._address = data.params.ip
        return this.emit('listening')
      }

      if (data.source === 'udpReadStart') {
        this.emit('message', buffer, {
          address: params.data.ip,
          port: params.data.port,
          family: isIPv4(params.data.ip)
        })
      }

      if (data.EOF) {
        window.removeListener('data', listener)
      }
    }

    // subscribe this socket to the firehose
    window.addEventListener('data', listener)

    this._recvStart()

    if (cb) cb(null)
    return this
  }

  /**
   * Associates the dgram.Socket to a remote address and port. Every message sent
   * by this handle is automatically sent to that destination. Also, the socket
   * will only receive messages from that remote peer. Trying to call connect()
   * on an already connected socket will result in an ERR_SOCKET_DGRAM_IS_CONNECTED
   * exception. If address is not provided, '127.0.0.1' (for udp4 sockets) or '::1'
   * (for udp6 sockets) will be used by default. Once the connection is complete,
   * a 'connect' event is emitted and the optional callback function is called.
   * In case of failure, the callback is called or, failing this, an 'error' event
   * is emitted.
   *
   * @param {number} port - Port the client should connect to.
   * @param {string?} host - Host the client should connect to.
   * @param {function?} connectListener - Common parameter of socket.connect() methods. Will be added as a listener for the 'connect' event once.
   */
  async connect (arg1, arg2, cb) {
    if (this.connectedState === CONNECT_STATE_CONNECTED) {
      const err = new Error('already connected')
      if (cb) return cb(err)
      return { err }
    }

    const port = arg1
    let address = arg2

    if (typeof arg2 === 'function') {
      cb = arg2
      address = undefined
    }

    const {
      err: errBind
    } = this.bind({ port: 0 }, null)

    if (errBind) {
      if (cb) return cb(errBind)
      return { err: errBind }
    }

    let dataLookup

    if (address && !isIPv4(address)) {
      const { err, data } = await window._ipc.send('dnsLookup', { hostname: address })

      if (err) {
        this.emit('error', err)
        return { err }
      }

      address = data.ip
    }

    if (!address) address = this.type === 'udp4'
      ? '127.0.0.1'
      : '::1'

    const opts = {
      id: this.id,
      address: dataLookup?.ip || address,
      port: port || 0
    }

    const {
      err: errConnect,
      data: dataConnect
    } = await ipc.send('udpConnect', opts)

    if (errConnect) {
      this.emit('error', errConnect)
      return { err: errConnect }
    }

    this.state._connectState = CONNECT_STATE_CONNECTED

    // TODO udpConnect could return the peer data instead of putting it
    // into a different call and we could shave off a bit of time here.
    const { err: errPeerData, data: dataPeerData } = ipc.sendSync('udpGetPeerName', {
      id: this.id
    })

    if (errPeerData) {
      this.emit('error', errPeerData)
      return { err: errPeerData }
    }

    this._remoteAddress = dataPeerData.ip
    this._remotePort = dataPeerData.port
    this._remoteFamily = dataPeerData.family

    if (cb) cb(null)
    return {}
  }

  async disconnect () {
    const { err: errConnect } = await ipc.send('udpDisconnect', {
      ip: this._remoteAddress,
      port: this._remotePort || 0
    })

    if (errConnect) {
      this.emit('error', errConnect)
      return { err: errConnect }
    }

    if (this.connectedState === 2) {
      this.emit('close')
    }

    return {}
  }

  /*
   * Broadcasts a datagram on the socket. For connectionless sockets, the
   * destination port and address must be specified. Connected sockets, on the
   * other hand, will use their associated remote endpoint, so the port and
   * address arguments must not be set.
   *
   * The msg argument contains the message to be sent. Depending on its type,
   * different behavior can apply. If msg is a Buffer, any TypedArray or a
   * DataView, the offset and length specify the offset within the Buffer where
   * the message begins and the number of bytes in the message, respectively.
   * If msg is a String, then it is automatically converted to a Buffer with
   * 'utf8' encoding. With messages that contain multi-byte characters, offset
   * and length will be calculated with respect to byte length and not the
   * character position. If msg is an array, offset and length must not be
   * specified.
   *
   * The address argument is a string. If the value of address is a host name,
   * DNS will be used to resolve the address of the host. If address is not
   * provided or otherwise nullish, '127.0.0.1' (for udp4 sockets) or '::1'
   * (for udp6 sockets) will be used by default.
   *
   * If the socket has not been previously bound with a call to bind, the socket
   * is assigned a random port number and is bound to the "all interfaces"
   * address ('0.0.0.0' for udp4 sockets, '::0' for udp6 sockets.)
   *
   * An optional callback function may be specified to as a way of reporting DNS
   * errors or for determining when it is safe to reuse the buf object. DNS
   * lookups delay the time to send for at least one tick of the Node.js event
   * loop.
   *
   * The only way to know for sure that the datagram has been sent is by using a
   * callback. If an error occurs and a callback is given, the error will be
   * passed as the first argument to the callback. If a callback is not given,
   * the error is emitted as an 'error' event on the socket object.
   *
   * Offset and length are optional but both must be set if either are used.
   * They are supported only when the first argument is a Buffer, a TypedArray,
   * or a DataView.
   *
   * @param {ArrayBuffer} buffer - An array buffer of data to send
   *
   */
  async send (buffer, ...args) {
    let offset, length, port, address, cb
    const connected = this.state._connectState === CONNECT_STATE_CONNECTED

    if (typeof buffer === 'string') {
      buffer = Buffer.from(buffer)
    }

    const index = args.findIndex(arg => typeof arg === 'function')
    if (index > -1) cb = args.pop()

    if (typeof args[2] === 'number') {
      [offset, length, port, address] = args.slice(0, index)

      if (connected && (port || address)) {
        throw new Error('Already connected')
      }

      buffer = Buffer.from(buffer.buffer, buffer.byteOffset + offset, length)
    } else {
      [port, address] = args
    }

    let list

    if (!Array.isArray(buffer)) {
      if (typeof buffer === 'string') {
        list = [Buffer.from(buffer)]
      } else if (!isArrayBufferView(buffer)) {
        // throw new Error('Invalid buffer')
        list = Buffer.from(buffer)
      } else {
        list = [buffer]
      }
    } else if (!(list = fixBufferList(buffer))) {
      throw new Error('Invalid buffer')
    }

    /* if (this.state._bindState === BIND_STATE_UNBOUND) {
      const { err: errBind } = this.bind({ port: 0 }, null)

      if (errBind) {
        if (cb) return cb(errBind)
        return { err: errBind }
      }
    } */

    if (list.length === 0) {
      list.push(Buffer.alloc(0))
    }

    if (!connected && !isIPv4(address)) {
      throw new Error('Currently dns lookup on send is not supported')
    }

    if (this.state._bindState === BIND_STATE_BOUND) {
      if (!address) address = this._remoteAddress
      if (!port) port = this._remotePort
    }

    if (port && !address) address = '0.0.0.0'

    const opts = {
      id: this.id || rand64(),
      address,
      port
    }

    const { err: errSend } = await ipc.write('udpSend', opts, list)

    if (errSend) {
      if (cb) return cb(errSend)
      return { err: errSend }
    }

    if (cb) cb(null)
    return {}
  }

  /**
   * Close the underlying socket and stop listening for data on it. If a
   * callback is provided, it is added as a listener for the 'close' event.
   *
   * @param {function} callback - Called when the connection is completed or on error.
   *
   */
  close (cb) {
    if (typeof cb === 'function') {
      this.once('close', cb)
    }

    const { err } = ipc.sendSync('udpClose', {
      id: this.id
    })

    if (err && err.code === 'ERR_SOCKET_DGRAM_NOT_RUNNING') {
      const e = new Error('Not running')
      e.code = err.code
      throw e
    }

    if (err && cb) return cb(err)
    if (err) return { err }

    this.emit('close')
    return
  }

  /**
   *
   * Returns an object containing the address information for a socket. For
   * UDP sockets, this object will contain address, family, and port properties.
   *
   * This method throws EBADF if called on an unbound socket.
   * @returns {Object} socketInfo - Information about the local socket
   * @returns {string} socketInfo.address - The IP address of the socket
   * @returns {string} socketInfo.port - The port of the socket
   * @returns {string} socketInfo.family - The IP family of the socket
   */
  address () {
    if (this.state._bindState === BIND_STATE_UNBOUND) {
      const err = new Error('getsockname EBADF')
      err.code = 'EBADF'
      // err.errno: UV_EBADF, // TODO: import the uv constants
      err.syscall = 'getsockname'
      throw err
    }
    return {
      address: this._address,
      port: this._port,
      family: this._family
    }
  }

  /**
   * Returns an object containing the address, family, and port of the remote
   * endpoint. This method throws an ERR_SOCKET_DGRAM_NOT_CONNECTED exception
   * if the socket is not connected.
   *
   * @returns {Object} socketInfo - Information about the remote socket
   * @returns {string} socketInfo.address - The IP address of the socket
   * @returns {string} socketInfo.port - The port of the socket
   * @returns {string} socketInfo.family - The IP family of the socket
   */
  remoteAddress () {
    if (this.state._connectState === CONNECT_STATE_DISCONNECTED) {
      const err = new Error('Not connected')
      err.code = 'ERR_SOCKET_DGRAM_NOT_CONNECTED'
      // err.errno: UV_ENOTCONN, // TODO: import the uv constants
      err.syscall = 'getpeername'
      throw err
    }
    return {
      address: this._remoteAddress,
      port: this._remotePort,
      family: this._remoteFamily
    }
  }

  //
  // Sets the SO_RCVBUF socket option. Sets the maximum socket receive buffer in
  // bytes.
  //
  setRecvBufferSize (size) {
    this.state.recvBufferSize = size
  }

  //
  // Sets the SO_SNDBUF socket option. Sets the maximum socket send buffer in
  // bytes.
  //
  setSendBufferSize (size) {
    this.state.sendBufferSize = size
  }

  getRecvBufferSize () {
    return this.state.recvBufferSize
  }

  getSendBufferSize () {
    return this.state.sendBufferSize
  }

  //
  // For now we aren't going to implement any of the multicast options,
  // mainly because 1. we don't need it in hyper and 2. if a user wants
  // to deploy their app to the app store, they will need to request the
  // multicast entitlement from apple. If someone really wants this they
  // can implement it.
  //
  setBroadcast () {
    throw new Error('not implemented')
  }

  setTTL () {
    throw new Error('not implemented')
  }

  setMulticastTTL () {
    throw new Error('not implemented')
  }

  setMulticastLoopback () {
    throw new Error('not implemented')
  }

  setMulticastMembership () {
    throw new Error('not implemented')
  }

  setMulticastInterface () {
    throw new Error('not implemented')
  }

  addMembership () {
    throw new Error('not implemented')
  }

  dropMembership () {
    throw new Error('not implemented')
  }

  addSourceSpecificMembership () {
    throw new Error('not implemented')
  }

  dropSourceSpecificMembership () {
    throw new Error('not implemented')
  }

  ref () {
    return this
  }

  unref () {
    return this
  }
}

export const createSocket = (options, callback) => new Socket(options, callback)
