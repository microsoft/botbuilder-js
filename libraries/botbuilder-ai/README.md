# Bot Builder AI

Cognitive services extensions for Microsoft BotBuilder.  

- [Installing](#installing)
- [Basic Use](#use)
- [Documentation](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Class Reference](https://docs.microsoft.com/en-us/javascript/api/botbuilder-ai/)
- [GitHub Repo](https://github.com/Microsoft/botbuilder-js)
- [Report Issues](https://github.com/Microsoft/botbuilder-js/issues)

## Installing
To add the latest version of this package to your bot:

```bash
npm install --save botbuilder-ai
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

This module contains interfaces for using [Microsoft LUIS](https://www.luis.ai) and [Microsoft QnA Maker](https://www.qnamaker.ai) in your Botbuilder application.

## Use


First, import the nessary functionality into your app.
```javascript
const { LuisRecognizer, QnAMaker } = require('botbuilder-ai');
```

Configure and instantiate a LuisRecognizer. You will need to acquire values for appId, subscriptionKey and region from the LUIS website.
```javascript
// Map the contents to the required format for `LuisRecognizer`.
const luisApplication = {
    applicationId: process.env.appId,
    endpointKey: process.env.subscriptionKey,
    azureRegion: process.env.region
}

// Create configuration for LuisRecognizer's runtime behavior.
const luisPredictionOptions = {
    includeAllIntents: true,
    log: true,
    staging: false
}

const luisRecognizer = new LuisRecognizer(luisApplication, luisPredictionOptions, true);
```

Now, call LUIS into action once you've got a TurnContext object:
```javascript
// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (turnContext) => {
        const results = await luisRecognizer.recognize(turnContext);

        // Since the LuisRecognizer was configured to include the raw results, get the `topScoringIntent` as specified by LUIS.
        const topIntent = results.luisResult.topScoringIntent;

        // Now, use topIntent to decide what action to take.
        switch (topIntent) {
            case '<some intent>':
            // ... 
            break;
        }

    });
});
```

## Examples

See this module in action in these example apps:

* [QnA Maker](https://github.com/Microsoft/BotBuilder-Samples/tree/main/samples/javascript_nodejs/11.qnamaker)
* [LUIS](https://github.com/Microsoft/BotBuilder-Samples/tree/main/samples/javascript_nodejs/12.nlp-with-luis)
* [Using LUIS and QnA Maker together with Dispatch](https://github.com/Microsoft/BotBuilder-Samples/tree/main/samples/javascript_nodejs/14.nlp-with-dispatch)
