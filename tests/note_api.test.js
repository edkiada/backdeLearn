const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
const Note = require('../models/note')
const helper = require('../utils/test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Note.deleteMany({})
  const noteObjects = helper.initialNotes
    .map(note => new Note(note))
  const promiseArray = noteObjects.map(note => note.save())
  await Promise.all(promiseArray)
})


test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('content-Type', /application\/json/)
})

test('there are two notes', async () => {
  const res = await api.get('/api/notes')
  assert.strictEqual(res.body.length, helper.initialNotes.length)
})

test('the first note is about HTTP methods', async () => {
  const res = await api.get('/api/notes')

  const contents = res.body.map(e => e.content)
  assert(contents.includes('HTML is easy'))
})

test('a valid note can be added', async () => {
  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret'})

  const token = loginResponse.body.token
  
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  }
  await api
    .post('/api/notes')
    .set('Authorization', `Bearer ${token}`)
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  const notesAtEnd = await helper.notesInDB()
  const contents = notesAtEnd.map(e => e.content)
  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)
  assert(contents.includes('async/await simplifies making async calls'))
})

test('note without content is not add', async () => {
  const newNote = {
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400)

  const notesAtEnd = await helper.notesInDB()
  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
}) 

test('a specific note can be viewed', async () => {
  const notesAtStart = await helper.notesInDB()

  const noteToView = notesAtStart[0]
  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  assert.deepStrictEqual(noteToView, resultNote.body)
})

test('a note can be deleted', async () => {
  const notesAtStart = await helper.notesInDB()
  const noteToDelete = notesAtStart[0]

  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204)
  const notesAtEnd = await helper.notesInDB()
  const contents = notesAtEnd.map(e => e.content)
  assert(!contents.includes(noteToDelete.content))
  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
})

after(async () => {
  await mongoose.connection.close()
})