/**
 * @module Buffer
 *
 * @see {@link https://nodejs.org/api/buffer.html#buffer_class_buffer}
 */

import buffer from 'buffer'
export const Buffer = buffer.Buffer ?? buffer
export * from 'buffer'
export default Buffer
