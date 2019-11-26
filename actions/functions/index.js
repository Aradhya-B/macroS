'use strict';

// Import the Dialogflow module and response creation dependencies from the 
// Actions on Google client library.
const {
  Permission,
    dialogflow,
    Suggestions,
  } = require('actions-on-google');

// Axios to make GET and POST requests
const axios = require('axios');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Get the Nutritionix API key
const nutritionix = require('nutritionix');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', (conv) => {
    conv.ask(new Permission({
      context: 'Hello, and welcome to macroS! To get to know you better',
      permissions: 'NAME'
    }));
  });

// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
    if (!permissionGranted) {
      conv.ask(`Ok, no worries. You can ask me for nutritional info about anything, or, tell me what you just ate and I'll log it and you can track what you eat on your macroS account!`);
      conv.ask(new Suggestions('I ate 1 banana', 'I drank 250 mL of milk', '7 apples', "3 big macs and an orange"));
    } else {
      conv.data.userName = conv.user.name.display.split(' ')[0];
      conv.ask(`Thanks, ${conv.data.userName}. You can ask me for nutritional info about anything, or, tell me what you just ate and I'll log it and you can track what you eat on your macroS account!`);
      conv.ask(new Suggestions('I ate 1 banana', 'I drank 250 mL of milk', '7 apples', "3 big macs and an orange"));
    }
  });

// Handle user telling the agent what food they've eaten
// Example use cases: "I ate 15 almonds, 1 cup of blueberries, and a vector granola bar"
//                    "I ate 50 grams of greek yogurt and 2 bananas"
// We call to an external API (nutritionix) that provides natural language processing for 
// queries made to a nutrition database and returns nutrition info (nutrionix handles all the nlp)  
app.intent('nutrition data', (conv) => {
  // We're using an asynchronous method here (to POST to the external API) so we HAVE to return 
  // a promise from our intent function (unlike what we've had to do before)
  return axios({method: 'POST', url: 'https://trackapi.nutritionix.com/v2/natural/nutrients',
  // API ID and Key
    headers: {
      'x-app-id' : nutritionix.id,
      'x-app-key' : nutritionix.key,
    },
  // The query made to the nutritiionix API will be exactly what the user says to the Google 
  // Action agent -> the exact user input text (processed) is extracted with
  // conv.arguments.raw.list[0].textValue
  data: {
    "query": conv.arguments.raw.list[0].textValue,
    "locale": "en_US"
  }})
  .then((res) => {
    // We get a lot of great data from the API including:
    // total calories, total fat, saturated fat, cholestrol, sodium, total carbs, 
    // dietary fiber, sugars, protein, potassium

    // Extracting the total calories, fat, carbs, and protein for each food (res.data.foods is an 
    // array of objects where each object represents each distinct food)
    let cal = 0;
    let fat = 0;
    let carb = 0;
    let prot = 0;
    let fib = 0;
    let sug = 0;
    let choles = 0;
    res.data.foods.forEach(food => {
      cal += Math.round(food.nf_calories);
      fat += Math.round(food.nf_total_fat);
      carb += Math.round(food.nf_total_carbohydrate);
      prot += Math.round(food.nf_protein);
      fib += Math.round(food.nf_dietary_fiber);
      sug += Math.round(food.nf_sugars);
      choles += Math.round(food.nf_cholesterol);
    })
    conv.ask(`Here's the full nutritional breakdown!\nTotal Calories: ${cal},\nTotal Fat: ${fat} grams,\nTotal Carbohydrates: ${carb} grams,\nTotal Protein: ${prot} grams,\nTotal Fiber: ${fib} grams,\nTotal Sugar: ${sug} grams,\nTotal Cholesterol: ${choles} grams`);
    conv.ask(`Ask me something else!`);
    return;
  }).catch((error) => {
    return;
  })
})

app.intent('log food', (conv) => {
  // We're using an asynchronous method here (to POST to the external API) so we HAVE to return 
  // a promise from our intent function (unlike what we've had to do before)
  return axios({method: 'POST', url: 'https://trackapi.nutritionix.com/v2/natural/nutrients',
  // API ID and Key
    headers: {
      'x-app-id' : nutritionix.id,
      'x-app-key' : nutritionix.key,
    },
  // The query made to the nutritiionix API will be exactly what the user says to the Google 
  // Action agent -> the exact user input text (processed) is extracted with
  // conv.arguments.raw.list[0].textValue
  data: {
    "query": conv.arguments.raw.list[0].textValue,
    "locale": "en_US"
  }})
  .then((res) => {
    // We get a lot of great data from the API including:
    // total calories, total fat, saturated fat, cholestrol, sodium, total carbs, 
    // dietary fiber, sugars, protein, potassium

    // Extracting the total calories, fat, carbs, and protein for each food (res.data.foods is an 
    // array of objects where each object represents each distinct food)
    let cal = 0;
    let fat = 0;
    let carb = 0;
    let prot = 0;
    let fib = 0;
    let sug = 0;
    let choles = 0;
    res.data.foods.forEach(food => {
      cal += Math.round(food.nf_calories);
      fat += Math.round(food.nf_total_fat);
      carb += Math.round(food.nf_total_carbohydrate);
      prot += Math.round(food.nf_protein);
      fib += Math.round(food.nf_dietary_fiber);
      sug += Math.round(food.nf_sugars);
      choles += Math.round(food.nf_cholesterol);
    })
    conv.ask(`I logged your entry to your macroS account!\nHere's the full nutritional breakdown!\nTotal Calories: ${cal},\nTotal Fat: ${fat} grams,\nTotal Carbohydrates: ${carb} grams,\nTotal Protein: ${prot} grams,\nTotal Fiber: ${fib} grams,\nTotal Sugar: ${sug} grams,\nTotal Cholesterol: ${choles} grams`);
    conv.ask(`Ask me something else!`);
    return;
  }).catch((error) => {
    return;
  })
})

/**
 let data = {
    fat: fat,
    carb: carb
  }

  data.save().then(() => {
    // stuff hapepnse
  })

  axios.post("URL", data, config).then(res => {

  })


  Data.get({}).then()


 */

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
