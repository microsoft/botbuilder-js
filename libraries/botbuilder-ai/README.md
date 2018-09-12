Cognitive services extensions for Microsoft BotBuilder.  

- [Installing](#installing)
- [Documentation](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [GitHub Repo](https://github.com/Microsoft/botbuilder-js)
- [Report Issues](https://github.com/Microsoft/botbuilder-js/issues)

## Installing
To add the preview version of this package to your bot be sure include the @preview tag:

```bash
npm install --save botbuilder-ai@preview
```

While this package is in preview it's possible for updates to include build breaks. To avoid having any updates break your bot it's recommended that you update the dependency table of your bots `package.json` file to lock down the specific version of the package you're using:

```JSON
{
    "dependencies": {
        "botbuilder": "4.0.0-preview1.2",
        "botbuilder-ai": "4.0.0-preview1.2"
    }
}
```

## What's included?

This module contains interfaces for using [Microsoft LUIS](https://luis.ai) and [Microsoft QnA Maker](https://qnamaker.ai) in your Botbuilder application.

## Use


First, import the nessary functionality into your app.
```
const { LuisRecognizer, QnAMaker } = require('botbuilder-ai');
```

Configure and instantiate a LuisRecognizer. You will need to acquire values for appId, subscriptionKey and region from the LUIS website.
```
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
```
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

* [QnA Maker](https://github.com/Microsoft/BotBuilder-Samples/tree/master/javascript_nodejs/11.qnamaker)
* [LUIS](https://github.com/Microsoft/BotBuilder-Samples/tree/master/javascript_nodejs/12.nlp-with-luis)
* [Using LUIS and QnA Maker together with Dispatch](https://github.com/Microsoft/BotBuilder-Samples/tree/master/javascript_nodejs/14.nlp-with-dispatch)