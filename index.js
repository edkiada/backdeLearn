require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express();
const Note = require('./models/note')

let persons = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('dist'))

const errorHandler = (error, req, res, next) => {
  console.log(error)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

app.get('/info', (req, res) => {
  const date = new Date();
  const count = persons.length;
  const responseHtml = `
    <p>Phonebook has info for ${count} people</p>
    <p>${date}</p>
  `;
  res.send(responseHtml);
});

app.post('/api/notes', (req, res, next) => {

  const body = req.body
  if (!body.content) {
    return res.status(400).json({
      error: 'content missing'
    })
  }
  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save()
    .then(savedNote => {
    res.json(savedNote)
  })
    .catch(error => next(error))
})

app.get('/', (req, res) => {
  res.json(persons)
})

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/notes', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes)
  })
})

app.get('/api/notes/:id', (req, res, next) => {
  const id = req.params.id
  Note.findById(id)
    .then(note => {
      if(note) {
        res.json(note)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error)) 
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  persons = persons.filter(note => note.id !== id)
  console.log('delete complete')
  res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})