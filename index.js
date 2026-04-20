const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express();

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
//app.use(express.static('dist'))
app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())

app.get('/info', (req, res) => {
  const date = new Date();
  const count = persons.length;
  const responseHtml = `
    <p>Phonebook has info for ${count} people</p>
    <p>${date}</p>
  `;
  res.send(responseHtml);
});

app.post('/api/persons', (req, res) => {

  const body = req.body
  if (!body.content && !body.name) {
    return res.status(400).json({
      error: 'content missing'
    })
  }

  const isUnique = persons.some(p => p.name === body.name)
  if (isUnique) {
    return res.status(402).json({
      error: 'name must be unique'
    })
  }

  const person = {
    content: body.content,
    name: body.name,
    id: String(Math.floor(Math.random() * 1000001))
  }

  persons = persons.concat(person)
  res.json(persons)
})

app.get('/', (req, res) => {
  res.send('<h1>Hello! 伺服器運作中</h1>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const person = persons.find(n => id === n.id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  persons = persons.filter(note => note.id !== id)
  console.log('delete complete')
  res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT);