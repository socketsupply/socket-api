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
