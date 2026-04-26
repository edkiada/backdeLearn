const bcrypt = require('bcrypt')
const User = require('../models/user')
const mongoose = require('mongoose')
const helper = require('../utils/test_helper')
const supertest = require('supertest')
const app = require('../app')
const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({
      username: 'root',
      name: 'root',
      passwordHash,
    })
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const userAtStart = await helper.usersInDB()

    const newUser = {
      username: 'kiamia',
      name: 'mask inore',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const userAtEnd = await helper.usersInDB()
    assert.strictEqual(userAtStart.length + 1, userAtEnd.length)

    const usernames = userAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode with mwssage if username already token', async () => {
    const userAtStart = await helper.usersInDB()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const userAtEnd = await helper.usersInDB()
    assert(result.body.error.includes('expected `username` to be unique'))
    assert.strictEqual(userAtEnd.length, userAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})