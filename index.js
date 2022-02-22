const cheerio = require('cheerio')
const request = require('request')

async function getLinkList (data, callback) {
  const pageList = []
  const url = data._website[0]
  request(url, function(error, response, body) {
    if (error) { return  console.error('There was an error!', error) }
    const $ = cheerio.load(body)
    let key = 0
    const links = [...$('a[href]:not(a[href^="#"])')
      .map((i, e) => e.attribs["href"])]
      .map(e => e.startsWith("http") ? e : url + e)
    links.map(link => {
      request(link, function (error, response) {
        if (error) { return  console.error('There was an error in loop!', error) }
        key++
        pageList.push({
          _website: key === 1 ? [url] : [],
          _link: [link],
          _statusCode: [response.statusCode]
        })
        if (links.length - 1 === key) {
          callback(pageList)
        }
      })
    })
  })
}

(async () => {
  try {
    const inputData = [
      {_website:['https://google.com']}
    ]
    await Promise.all(inputData.map(async item => {
      await getLinkList(item, (data) => {
        console.log('list', data)
        console.log('item: ', item)
      })
    }))

  } catch (e) { console.error(e) }
})()
