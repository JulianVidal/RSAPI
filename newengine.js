const puppeteer = require('puppeteer-extra')
const stealthPlugin = require('puppeteer-extra-plugin-stealth')
const userAgent = require('user-agents')
const fetch = require('node-fetch')

exports.onload = async () => {
  await puppeteer.use(stealthPlugin())

  const browser = await puppeteer.launch({headless: false})

  page = await browser.newPage()
  await page.setViewport({
    width: 640,
    height: 480
  })
  await page.setUserAgent(userAgent.toString())
  
  await page.goto('https://www.zillow.com/', {
    waitUntil: 'networkidle0'
  })

  await page.waitForSelector('#search-box-input', {timeout: 0})
    await page.type('#search-box-input', 'washington', {delay: 100})
    await page.click('#search-icon')
    await new Promise(resolve => setTimeout(resolve, 150));
    await page.click('.listing-interstitial-buttons > li:nth-child(3) > button')
    await new Promise(resolve => setTimeout(resolve, 500));
}

exports.searchZillow = async function  (search) {
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

  await page.waitForNavigation({waitUntil: 'networkidle2'})
  await page.waitForSelector('#grid-search-results > ul', {timeout: 0})

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
  
    await page.evaluate( async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
        window.scrollBy(0, -document.body.scrollHeight)
      })

      return properties

//   var myHeaders = new fetch.Headers();
// myHeaders.append("Cookie", "search=6|1615102916556%7Cregion%3Dphoenix%26rect%3D33.920569%252C-111.926046%252C33.290259%252C-112.324055%26pt%3Dpmf%252Cpf%26fs%3D1%26fr%3D0%26rs%3D0%26ah%3D0%09%0940326%09%09%09%09%09%09; zgsession=1|1adca8fe-7e5d-452a-a9c1-d59fc1ff852a; zguid=23|%24b877ca32-a7ab-4088-b1cc-9897461ddc85; AWSALB=zEj5JzgwFXGj1iktlERZ7mjNGv1Qclnysox519a+iPWAlUzNH8amYShFsuPwCT1q13N5xUGybXUh30Fozql1kCLnzOPr19BtZl0XMSHH9DI+nNBg79o5UgGM9OvT; AWSALBCORS=zEj5JzgwFXGj1iktlERZ7mjNGv1Qclnysox519a+iPWAlUzNH8amYShFsuPwCT1q13N5xUGybXUh30Fozql1kCLnzOPr19BtZl0XMSHH9DI+nNBg79o5UgGM9OvT; JSESSIONID=64979608BF9B588FC2B1108B4E22D122");

// var requestOptions = {
//   method: 'GET',
//   headers: myHeaders,
//   redirect: 'follow'
// };
// let a
// await fetch("https://www.zillow.com/homes/for_sale/phoenix", requestOptions)
//   .then(response => response.text())
//   .then(result => a = result)
//   .catch(error => console.log('error', error));


//   return a  
}

