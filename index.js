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
      const adress = property.querySelector('address').innerText
      const link = property.querySelector('a').href
      const price = property.querySelector('.list-card-price').innerText
      const beds = property.querySelector('.list-card-details').childNodes[0].innerText
      const baths = property.querySelector('.list-card-details').childNodes[1].innerText
      const sqft = property.querySelector('.list-card-details').childNodes[2].innerText
      const image = property.querySelector('img').src
      
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
