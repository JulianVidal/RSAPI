const puppeteer = require('puppeteer-extra')
const stealthPlugin = require('puppeteer-extra-plugin-stealth')
const userAgent = require('user-agents')
const express =  require('express')
const states = require('./states.json')


const app = express()


async function scrape(search) {
  await puppeteer.use(stealthPlugin())

  const browser = await puppeteer.launch({headless: false})

  const page = await browser.newPage()
  await page.setViewport({
    width: 640,
    height: 480
  })
  await page.setUserAgent(userAgent.toString())
  
  await page.goto('https://www.zillow.com/', {
    waitUntil: 'networkidle0'
  })

  await page.type('#search-box-input', search || 'Seattle', {delay: 100})
  await page.click('#search-icon')
  await new Promise(resolve => setTimeout(resolve, 200));
  await page.click('.listing-interstitial-buttons > li:nth-child(3) > button')

  await new Promise(resolve => setTimeout(resolve, 500));
  await page.evaluate( async () => {
    let distance = 0
    while (distance < document.body.scrollHeight) {
      await new Promise(resolve => setTimeout(resolve, 250));
      window.scrollBy(0, window.innerHeight)
      distance += window.innerHeight
    }
    })

  const list = await page.evaluate( () => {
    const properties = []

    const propertiesList = document.querySelector('#grid-search-results > ul')

    for (let i = 0; i < propertiesList.childNodes.length; i++) {
      const property = propertiesList.childNodes[i];
      console.log(i, property)
      if (i === 2) continue
      console.log(i, property)
      const adress = property.querySelector('address').innerText
      const link = property.querySelector('a').href
      const price = property.querySelector('.list-card-price').innerText
      const image = property.querySelector('img').src

      let beds, baths, sqft

      if (property.querySelector('.list-card-details').childNodes[1]) {
        beds = property.querySelector('.list-card-details').childNodes[0].innerText
        baths = property.querySelector('.list-card-details').childNodes[1].innerText
        sqft = property.querySelector('.list-card-details').childNodes[2].innerText
      } else {
        sqft = property.querySelector('.list-card-details').childNodes[0].innerText
      }
      
      properties.push({adress, link, price, beds, baths, sqft, image})
    }

    return properties
  })

  await browser.close()

  console.log(list)

  return list
}

app.get('/api', async (req, res) => {
  const search = req.query.location
  const data = await scrape(search)
  console.log(data)
  res.json(data)
})

app.get('/', async (req, res) => {  
  
  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    console.log(state)
  }

  res.json(states)
})

app.listen(5000)

console.log('Listening at port 5000')
