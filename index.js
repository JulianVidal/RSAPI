const puppeteer = require('puppeteer')
const express =  require('express')

const app = express()

async function scrape() {
  const browser = await puppeteer.launch({headless: false})

  const search = 'Seattle'

  const page = await browser.newPage()
  await page.goto('https://www.zillow.com/homes/for_sale/' + search, {
    waitUntil: 'domcontentloaded'
  })

  // Types search
  const list = await page.evaluate( () => {
    const properties = []

    const propertiesList = document.querySelector('#grid-search-results > ul')
    const porperty = propertiesList.childNodes[1]

    for (let i = 0; i < propertiesList.childNodes.length; i++) {
      const property = propertiesList.childNodes[i];

      const adress = porperty.querySelector('address').innerText
      const link = porperty.querySelector('a').href
      const price = porperty.querySelector('.list-card-price').innerText
      const beds = porperty.querySelector('.list-card-details').childNodes[0].innerText
      const baths = porperty.querySelector('.list-card-details').childNodes[1].innerText
      const sqft = porperty.querySelector('.list-card-details').childNodes[2].innerText
      const image = porperty.querySelector('img').src
      
      properties.push({adress, link, price, beds, baths, sqft, image})
    }

    return properties
  })

  await browser.close()

  console.log(list)

  return list
}

app.get('/api', async (req, res) => {
  const data = await scrape()
  // console.log(data)
  res.json(data)
  
})

app.listen(5000)

console.log('Listening at port 5000')
