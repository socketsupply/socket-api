/**
 * @module Network
 *
 * The network module allows you to create basic, reliable swarms
 * where messages can be broadcast or sent to a specific peer.
 *
 * ```js
 * import io from '@socketsupply/io'
 * const network = new io.Network()
 * const swarm = network.createSwarm('my-swarm')
 *
 * swarm.on('peer', peer => {
 *   peer.send('hello')
 *   peer.on('message', d => {
 *     document.body.textContent += d.toString()
 *   })
 * })
 * ```
 *
 */
import { EventEmitter } from './events.js'
import { Buffer } from './buffer.js'
import dgram from './dgram.js'
import os from './os.js'

import Swarms from '@socketsupply/introducer/swarms.js'
import ReliableSwarm from '@socketsupply/introducer/swarm/reliable.js'
import swarmDefaultConfig from '@socketsupply/introducer/lib/default-config.js'
import Wrap from '@socketsupply/introducer/wrap.js'

const wrap = Wrap(dgram, os, Buffer)

class Peer extends EventEmitter {
  id = null;
  swarm = null;
  type = 'reliable';

  send (buf) {
    if (this.type === 'reliable') {
      return this.swarm.update(buf, Date.now())
    }

    throw new Error('swarm type unknown, unable to send')
  }
}

/**
 * Creates an instance of the `Network` object. The network may contain
 * one or more swarms. A swarm is a group of peers that are interested
 * in a particular topic.
 *
 * @param {object} config - A configuration object
 * @param {number} config.keepAlive - The interval of the ping in milliseconds
 * @param {number} config.port - The UDP port that will be bound
 * @param {number} config.spinPort - The UDP port that is used to detect static nat
 * @param {object} config.introducer1 - If you have no state, you may need to be introduced to other peers.
 * @param {object} config.introducer1.id - The id of the peer
 * @param {object} config.introducer1.port - The UDP port of the peer
 * @param {object} config.introducer1.address - The 'IPv4' or 'IPv6' port of the peer
 * @param {object} config.introducer2 - If you have no state, you may need to be introduced to other peers.
 * @param {object} config.introducer2.id - The id of the peer
 * @param {object} config.introducer2.port - The UDP port of the peer
 * @param {object} config.introducer2.address - The IPv4|IPv6 port of the peer
 *
 */
export class Network extends EventEmitter {
  constructor (opts = {}) {
    super()

    this.peers = {}

    if (!opts.id) {
      throw new Error('.id required in constructor')
    }

    this.opts = { ...swarmDefaultConfig, ...opts }

    this.swarms = new Swarms(this.opts)
    this.swarms.on('error', err => {
      this.emit('error', err)
    })

    this.swarms.on('ping', (...args) => this.emit('diag', 'ping', ...args))
    this.swarms.on('pong', (...args) => this.emit('diag', 'pong', ...args))
    this.swarms.on('nat', (...args) => this.emit('diag', 'nat', ...args))
    this.swarms.on('local', (...args) => this.emit('diag', 'local', ...args))
    this.swarms.on('join', (...args) => this.emit('diag', 'join', ...args))
    this.swarms.on('init', (...args) => this.emit('diag', 'init', ...args))
    this.swarms.on('bind', (...args) => this.emit('diag', 'bind', ...args))
    this.swarms.on('listening', (...args) => this.emit('diag', 'listening', ...args))
    // this.swarms.on('send', (...args) => this.emit('diag', 'send', ...args))
    this.swarms.on('recv', (...args) => this.emit('diag', 'recv', ...args))
    this.swarms.on('dead', (...args) => this.emit('diag', 'dead', ...args))
    this.swarms.on('alive', (...args) => this.emit('diag', 'alive', ...args))
    this.swarms.on('error', (...args) => this.emit('diag', 'error', ...args))

    wrap(this.swarms, [this.opts.port, this.opts.spinPort])
  }

  /**
   * Create a swarm on the network
   *
   * @param {string} id - a 32 byte buffer that uniquely identifies the swarm
   * @param {string} [type] - the type of the swarm ('reliable' | undefined)
   * @returns {EventEmitter} - an event emitter that provides events from the swarm
   */
  createSwarm (id, type = 'reliable') {
    const swarm = new EventEmitter()

    if (type === 'reliable') {
      swarm.model = this.swarms.createModel(id, new ReliableSwarm())
    }

    if (!swarm.model) {
      throw new Error('the type of swarm specified is not supported')
    }

    swarm.model.on_peer = p => {
      const peer = this.peers[p.id] = new Peer()
      peer.id = p.id
      peer.swarm = this.swarm
      peer.type = type
      swarm.emit('peer', peer)
    }

    swarm.model.on_disconnect = peer => {
      if (!this.peers[peer.id]) return

      this.peers[peer.id].emit('disconnect', peer)
      delete this.peers[peer.id]
    }

    swarm.model.on_change = (msg, data) => {
      if (!this.peers[msg.id]) return

      this.peers[msg.id].emit('message', msg)
    }

    return swarm
  }
}
