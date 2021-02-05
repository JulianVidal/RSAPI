const puppeteer = require('puppeteer-extra')
const stealthPlugin = require('puppeteer-extra-plugin-stealth')
const userAgent = require('user-agents')



module.exports = async function scrape (queries) {
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

  const list = {}
  for (let i = 0; i < queries.length; i++) {
    const search = queries[i].name;

  if (i === 0) {
    await page.waitForSelector('#search-box-input', {timeout: 0})
    await page.type('#search-box-input', search, {delay: 100})
    await page.click('#search-icon')
    await new Promise(resolve => setTimeout(resolve, 150));
    await page.click('.listing-interstitial-buttons > li:nth-child(3) > button')
    await new Promise(resolve => setTimeout(resolve, 500));
  } else {
    await new Promise(resolve => setTimeout(resolve, 500));

    const length = await page.evaluate(() => {return document.querySelector('input[type=text]').value.length})

    console.log('focus')
    await page.focus('input[type=text]')
    let i = 0
    console.log('backspace')
    while (i <= length) {await page.keyboard.press('Backspace'); i++}
    console.log('type: ' + search)
    await page.type('input[type=text]', search, {delay: 100})
    await page.keyboard.press('Enter')
    // console.log('click')
    // await page.click('div.searchBtnContainer > button')


    await page.waitForNavigation({waitUntil: 'networkidle2'})
    await page.waitForSelector('#grid-search-results > ul', {timeout: 0})

  }

  await page.evaluate( async () => {
    let distance = 0
    while (distance < document.body.scrollHeight) {
      await new Promise(resolve => setTimeout(resolve, 400));
      window.scrollBy(0, window.innerHeight)
      distance += window.innerHeight
    }
    })

  const properties = await page.evaluate( () => {
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
      const image = property.querySelector('a > img').src

      let beds, baths, sqft

      if (property.querySelector('.list-card-details').childNodes[2]) {
        console.log('1')
        beds = property.querySelector('.list-card-details').childNodes[0].innerText
        baths = property.querySelector('.list-card-details').childNodes[1].innerText
        sqft = property.querySelector('.list-card-details').childNodes[2].innerText
      } else {
        console.log('2')
        sqft = property.querySelector('.list-card-details').childNodes[0].innerText
      }
      
      properties.push({adress, link, price, beds, baths, sqft, image})
    }

    return properties
  })

  list[search] = properties

  await page.evaluate( async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      window.scrollBy(0, -document.body.scrollHeight)
    })
  }

  await browser.close()

  console.log(list)

  return list
}
