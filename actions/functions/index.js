'use strict';

// Import the Dialogflow module and response creation dependencies from the 
// Actions on Google client library.
const {
  Permission,
    dialogflow,
    Suggestions,
  } = require('actions-on-google');

const axios = require('axios');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

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
      conv.ask(`Ok, no worries. What did you have to eat today?`);
      conv.ask(new Suggestions('I ate 1 banana', 'I drank 250 mL of milk'));
    } else {
      conv.data.userName = conv.user.name.display.split(' ')[0];
      conv.ask(`Thanks, ${conv.data.userName}. What did you have to eat today?`);
      conv.ask(new Suggestions('I ate 1 banana', 'I drank 250 mL of milk'));
    }
  });

app.intent('food eaten', (conv) => {
  return axios({method: 'POST', url: 'https://trackapi.nutritionix.com/v2/natural/nutrients',
    headers: {
      'x-app-id' : "ac141a81",
      'x-app-key' : "b2bb976cbf044a6f0a10a817debb5243",
    },
  data: {
    "query": conv.arguments.raw.list[0].textValue,
    "locale": "en_US"
  }})
  .then((res) => {
    conv.ask(JSON.stringify(res.data.foods[0]));
    return;
  }).catch((error) => {
    return;
  })
})

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
