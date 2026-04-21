const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://yyh901277111DB:${password}@cluster0.svq5vsd.mongodb.net/?appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Note = mongoose.model('Note', noteSchema)

if (process.argv.length === 5) {
  const name = process.argv[3]
  const phone = process.argv[4]

  const note = new Note({
    name: name,
    number: phone,
  })

  note.save().then(result => {
    console.log(`added ${name} number ${phone} to phonebook`)
    mongoose.connection.close()
  })
} else {
  Note.find({}).then(result => {
    console.log('phonebook:\n')
    result.forEach(note => {
      console.log(`${note.name} ${note.number}\n`)
    })
    mongoose.connection.close()
  })
}

