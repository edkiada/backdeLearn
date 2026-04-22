const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
const url = process.env.MONGODB_URI

mongoose.connect(url) 
  .then(result => {
    console.log('connected to DB')
  })
  .catch(error => {
    console.log('error connected', error.message)
  })

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean
})

module.exports = mongoose.model('Note', noteSchema)