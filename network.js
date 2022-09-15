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

import Swarms from '@socketsupply/introducer/swarms.js'
import ReliableSwarm from '@socketsupply/introducer/swarm/reliable.js'
import swarmDefaultConfig from '@socketsupply/introducer/lib/default-config.js'
import Wrap from '@socketsupply/introducer/wrap.js'

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

    this.swarms = new Swarms(config)
    wrap(this.swarms, [this.config.port, this.config.spinPort])
  }

  /**
   * Create a swarm on the network
   *
   * @param {string} id - a 32 byte buffer that uniquely identifies the swarm
   * @param {string} [type] - the type of the swarm ('reliable' | undefined)
   * @returns Swarm - a swarm that is partitioned (a member of this.swarms.handlers)
   */
  createSwarm (id, type = 'reliable') {
    const swarm = new EventEmitter()
    let model

    if (type === 'reliable') {
      model = this.swarms.createModel(id, new ReliableSwarm())
    }

    if (!model) {
      throw new Error('the type of swarm specified is not supported')
    }

    model.on('peer', p => {
      const peer = this.peers[p.id] = new Peer()
      peer.id = p.id
      peer.swarm = this.swarm
      peer.type = type
      swarm.emit('peer', peer)
    })

    model.on_disconnect = peer => {
      if (!this.peers[peer.id]) return

      this.peers[peer.id].emit('disconnect', peer)
      delete this.peers[peer.id]
    }

    model.on_change = (msg, data) => {
      if (!this.peers[msg.id]) return

      this.peers[msg.id].emit('message', msg)
    }

    model.on('ping', (...args) => swarm.emit('ping', ...args))
    model.on('pong', (...args) => swarm.emit('pong', ...args))
    model.on('nat', (...args) => swarm.emit('nat', ...args))
    model.on('local', (...args) => swarm.emit('local', ...args))
    model.on('join', (...args) => swarm.emit('join', ...args))
    model.on('init', (...args) => swarm.emit('init', ...args))
    model.on('bind', (...args) => swarm.emit('bind', ...args))
    model.on('listening', (...args) => swarm.emit('listening', ...args))
    model.on('send', (...args) => swarm.emit('-> send', ...args))
    model.on('recv', (...args) => swarm.emit('recv', ...args))
    model.on('dead', (...args) => swarm.emit('dead', ...args))
    model.on('alive', (...args) => swarm.emit('alive', ...args))
    model.on('error', (...args) => swarm.emit('error', ...args))

    return swarm
  }
}
