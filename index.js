const express =  require('express')
const fs = require('fs')
const dts = require('./data/data.json')
const scrape = require('./SearchAll.js')
// import scrape from './SearchAll.js'
const { states } = require('./states.json')

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

app.listen(5000)
