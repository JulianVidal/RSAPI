const express =  require('express')
const fs = require('fs')
const dts = require('./data/data.json')
const scrape = require('./SearchAll.js')
const { states } = require('./states.json')
const cors = require('cors')

const app = express()

app.get('/api', (req, res) => {
  res.json(dts)
})

app.get('/data', async (req, res) => {
  const data = await scrape(states)
  fs.writeFileSync('./data.json', JSON.stringify(data, null, 2))
  console.log(data)
  res.json(data)
  // res.json(dts)
})

app.use(express.json({ extended: true}))
app.use(cors())

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
      console.log(repeated,  'Email already used')
      if (repeated === undefined) {
        console.log('Succesful singup')
        users.push(user)
        const json = JSON.stringify(users)
        fs.writeFile('./data/users.json', json, error => {if (error) throw error})
        res.sendStatus(200)
      } else {
        console.log('Unsuccesful signup')
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
      console.log(repeated, 'User found')
      if (repeated !== undefined) {
        console.log('Succesful log in')
        res.status(200).send(repeated)
      } else {
        console.log('Unsuccesful log in')
        res.status(406).send({message:'Account does not exist'})
      }

    }
  } )
})

app.post('/likes', (req, res) => {
  const user = req.body
  console.log(user)
  
  fs.readFile('./data/users.json', 'utf8', (err, data) => {
    if (err) {
      return true
    } else {
      const users = JSON.parse(data)
      console.log(users)
      const repeatedIndex = users.findIndex(u => u.email === user.email)
      console.log(repeatedIndex,  'User index found')
      if (repeatedIndex !== -1) {
        console.log(users[repeatedIndex].properties.length < user.properties.length ? 'Succesful like' : 'Successful unlike')
        users[repeatedIndex] = user
        const json = JSON.stringify(users)
        fs.writeFile('./data/users.json', json, error => {if (error) throw error})
        res.sendStatus(200)
      } else {
        console.log('Unsuccesful like')
        res.status(406).send({message:'Account does not exist'})
      }

    }
  } )
})

app.listen(5000)
