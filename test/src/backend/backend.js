import system from '@socketsupply/ssc-node';

(async () => {
  await system.send({
    window: 0,
    event: 'backend:ready'
  })
  await system.send({
    window: 0,
    event: 'character',
    value: { character: { firstname: 'Morty', secondname: 'Smith' }}
  })
})()
