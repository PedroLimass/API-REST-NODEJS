import fastify from 'fastify'
import { knex } from './database.js'
// import { randomUUID } from 'crypto'

const app = fastify()

app.get('/hello', async () => {
  const transactions = await knex('transactions')
    .where('amount', 1000)
    .select('*')

  return transactions
  // const transactions = await knex('transactions')
  //   .insert({
  //     id: randomUUID(),
  //     title: 'New Transaction',
  //     amount: 1000,
  //   })
  //   .returning('*')
  // return transactions
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
