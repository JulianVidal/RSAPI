const express =  require('express')
const fs = require('fs')
const cors = require('cors')

const app = express()

app.use(express.json({ extended: true}))
app.use(cors())

app.get('/post', (req, res) => {
  res.send('Hello!')
})

app.post('/signup', (req, res) => {
  const user = req.body
  console.log(req.body)

  fs.readFile('./data/users.json', 'utf8', (err, data) => {
    if (err) {
      return true
    } else {
      const users = JSON.parse(data)
      console.log(users)
      const repeated = users.find(u => u.email === user.email)
      console.log(repeated, ' repeated')
      if (repeated === undefined) {
        console.log('1', 'singup')
        users.push(user)
        const json = JSON.stringify(users)
        fs.writeFile('./data/users.json', json, error => {if (error) throw error})
        res.sendStatus(200)
      } else {
        console.log('2', 'signup')
        res.status(406).send({message:'Account already exists'})
      }

    }
  } )
})

app.post('/login', (req, res) => {
  const user = req.body
  console.log(req.body)

  fs.readFile('./data/users.json', 'utf8', (err, data) => {
    if (err) {
      return true
    } else {
      const users = JSON.parse(data)

      const repeated = users.find(u => u.email === user.email)
      console.log(repeated, ' repeated')
      if (repeated !== undefined) {
        console.log('1', 'Login')
        res.sendStatus(200)
      } else {
        console.log('2', 'login')
        res.status(406).send({message:'Account Does Not Exist'})
      }

    }
  } )
})


app.listen(5000)
