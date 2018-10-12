# Bot Builder for Node.js
[Bot Builder for Node.js](http://docs.botframework.com/builder/node/overview/) is a powerful framework for constructing bots that can handle both freeform interactions and more guided ones where the possibilities are explicitly shown to the user. It is easy to use and models frameworks like Express & Restify to provide developers with a familiar way to write Bots.

- [Installing](#installing)
- [Basic Use](#build-a-bot)
- [Learn More](#learn-more)
- [Sample Apps](https://github.com/Microsoft/BotBuilder-Samples)
- [Documentation](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Class Reference](https://docs.microsoft.com/en-us/javascript/api/botbuilder/)
- [GitHub Repo](https://github.com/Microsoft/botbuilder-js)
- [Report Issues](https://github.com/Microsoft/botbuilder-js/issues)

## Installing
To add the latest version of this package to your bot:

```bash
npm install --save botbuilder
```

#### Use the Daily Build

To get access to the daily builds of this library, configure npm to use the MyGet feed before installing.

```bash
npm config set registry https://botbuilder.myget.org/F/botbuilder-v4-js-daily/npm/
```

To reset the registry in order to get the latest published version, run:
```bash
npm config set registry https://registry.npmjs.org/
```

## What's included?

Bot Builder has everything you need to run a bot on almost any bot platform like the [Microsoft Bot Framework](http://botframework.com), [Skype](http://skype.com), and [Slack](http://slack.com). The core library will get your bot online and chatting.
Then, extend and connect your Bot Builder app with these plugins:

| Plugin | Description
|--- |---
| [botbuilder-dialogs](https://github.com/microsoft/botbuilder-js/tree/master/libraries/botbuilder-dialogs/README.md) | Powerful dialog system with dialogs that are isolated and composable, and built-in prompts for simple things like Yes/No, strings, numbers, enumerations.
| [botbuilder-ai](https://github.com/microsoft/botbuilder-js/tree/master/libraries/botbuilder-dialogs/README.md) | Utilize powerful AI frameworks like [LUIS](https://www.luis.ai) and [QnA Maker](https://www.qnamaker.ai).
| [botbuilder-azure](https://github.com/microsoft/botbuilder-js/tree/master/libraries/botbuilder-azure/README.md) | Incorporate Azure services like Cosmos DB and Blob Storage into your bot.

## Build a bot
[Read the quickstart guide](https://docs.microsoft.com/en-us/azure/bot-service/javascript/bot-builder-javascript-quickstart?view=azure-bot-service-4.0) 
that will walk you through setting up your Bot Builder app so that you've got a well structured project and
all of the tools necessary to develop and extend your bot.
 
### Start from scratch
Create a folder for your bot, cd into it, and run npm init.

```
npm init
```
    
Get the BotBuilder and Restify modules using npm.

```
npm install --save botbuilder
npm install --save restify
```
    
Create a file named bot.js and get your bot online with a few lines of code.
 
```javascript
const restify = require('restify');
const botbuilder = require('botbuilder');

// Create bot adapter, which defines how the bot sends and receives messages.
var adapter = new botbuilder.BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Create HTTP server.
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
});

// Listen for incoming requests at /api/messages.
server.post('/api/messages', (req, res) => {
    // Use the adapter to process the incoming web request into a TurnContext object.
    adapter.processActivity(req, res, async (turnContext) => {
        // Do something with this incoming activity!
        if (turnContext.activity.type === 'message') {            
            // Get the user's text
            const utterance = turnContext.activity.text;

            // send a reply
            await turnContext.sendActivity(`I heard you say ${ utterance }`);
        }
    });
});
```

## Test your bot
Use the [Bot Framework Emulator](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-debug-emulator?view=azure-bot-service-4.0) to test your bot on localhost. 

Install the emulator from [here](https://aka.ms/botframework-emulator) and then start your bot in a console window.
    
Start the emulator and say "hello" to your bot.

## Publish your bot
Deploy your bot to the cloud and then [register it](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-quickstart?view=azure-bot-service-4.0) with the Azure Bot Service.

## Learn More
Learn how to build great bots.

* [Core Concepts Guide](http://docs.botframework.com/builder/node/guides/core-concepts/)
* [Bot Builder for Node.js Reference](https://docs.microsoft.com/en-us/javascript/api/botbuilder/)
