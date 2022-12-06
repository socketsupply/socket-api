import runtime from '@socketsupply/io/runtime.js';

runtime.send({ event: 'second window loaded', window: 0 })

window.addEventListener('character', e => {
  runtime.send({ event: 'message from second window', value: e.detail, window: 0 })
});
