const axios = require('axios')


axios({method: 'POST', url: 'https://trackapi.nutritionix.com/v2/natural/nutrients', 
headers: {
    'x-app-id' : "ac141a81", 
    'x-app-key' : "b2bb976cbf044a6f0a10a817debb5243",
    },
data: {
    "query":"banana",
"locale": "en_US"
    }})

.then((res) => {
    console.log(res.data.foods[0])
    return;
})
  .catch((error) => {
    console.error(error)
  })

  console.log('hi')
  