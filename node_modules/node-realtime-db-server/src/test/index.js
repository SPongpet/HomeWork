import { Server } from 'http'
import 'babel-polyfill'
import express from 'express'
import rtdb from '../'
import { setTimeout } from 'timers';
import operations from '../operations'

const app = express()
const http = Server(app)

const { db } = rtdb(http, {}, {
  initalData: {
    a: 1,
    b: 'zz',
  },
})

app.get('/', function (req, res) {
  res.send('<h1>Hello world</h1>')
});


http.listen(3000, function () {
  console.log('listening on *:3000')
});


setTimeout(async () => {
  console.log(`'a'=${await db.get('a')}`)
  await db.set('c.d.e', 5)
  console.log(`'c.d'=${JSON.stringify(await db.get('c.d'))}`)
  await db.set('b', 2, operations.incr)
  console.log(`'b'=${JSON.stringify(await db.get('b'))}(should be 'zz')`)
  await db.set('b', 2, operations.decr)
  console.log(`'b'=${JSON.stringify(await db.get('b'))}(should be 'zz')`)
  await db.set('a', 2, operations.incr)
  console.log(`'a'=${JSON.stringify(await db.get('a'))}(should be 3)`)
  await db.set('a', 5, operations.decr)
  console.log(`'a'=${JSON.stringify(await db.get('a'))}(should be -2)`)

  await db.set('a', 5, operations.push)
  console.log(`'a'=${JSON.stringify(await db.get('a'))}(should be -2)`)
  await db.set('a', 5, operations.unshift)
  console.log(`'a'=${JSON.stringify(await db.get('a'))}(should be -2)`)
  await db.set('a', [1, 2], operations.splice)
  console.log(`'a'=${JSON.stringify(await db.get('a'))}(should be -2)`)


  await db.set('x', 5, operations.push)
  console.log(`'x'=${JSON.stringify(await db.get('x'))}(should be [5])`)
  await db.set('y', 5, operations.unshift)
  console.log(`'y'=${JSON.stringify(await db.get('y'))}(should be [5])`)
  await db.set('z', [0, 0, 5, 6, 7, 8], operations.splice)
  console.log(`'z'=${JSON.stringify(await db.get('z'))}(should be [5,6,7,8])`)
  
  console.log(`'z1'=${JSON.stringify(await db.get('z1'))}(should be undefined)`)
  await db.set('z1', [0, 0, [5, 6]], operations.splice)
  console.log(`'z1'=${JSON.stringify(await db.get('z1'))}(should be [[5,6]])`)


  await db.set('x', 6, operations.push)
  console.log(`'x'=${JSON.stringify(await db.get('x'))}(should be [5,6])`)
  await db.set('y', 6, operations.unshift)
  console.log(`'y'=${JSON.stringify(await db.get('y'))}(should be [6,5])`)
  await db.set('z', [1, 2, 9, 10, 11], operations.splice)
  console.log(`'z'=${JSON.stringify(await db.get('z'))}(should be [5,9,10,11,8])`)

}, 1000)