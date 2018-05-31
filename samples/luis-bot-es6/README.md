This sample shows how to integrate LUIS to a bot created using botbuilder-js and botbuilder-ai. 

## To try this sample
- Clone the repository
```bash
git clone https://github.com/Microsoft/botbuilder-js.git
```
### [Required] Getting set up with LUIS.ai model
- Navigate to [LUIS](http://luis.ai)
- Sign in
- Click on My apps
- "Import new App"
- Choose file -> select [LUIS-Reminders.json](LUIS-Reminders.json)
- Update [appsettings.json](appsettings.json) with your Luis-ModelId, Luis-SubscriptionId and Luis-Url. You can find this information under "Publish" tab for your LUIS application at [luis.ai](https://luis.ai). E.g. For https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/XXXXXXXXXXXXX?subscription-key=YYYYYYYYYYYY&verbose=true&timezoneOffset=0&q= 
    - Luis-ModelId = XXXXXXXXXXXXX
    - Luis-SubscriptionId = YYYYYYYYYYYY
    - Luis-Url = https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/

### Visual Studio Code
- open `samples\luis-bot-es6` folder
- Bring up a terminal, navigate to `samples\luis-bot-es6` folder
- type `npm install` to install the sample's dependencies
- type `npm start` to run the bot

## Testing the bot using Bot Framework Emulator
[Microsoft Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework emulator from [here](https://github.com/Microsoft/BotFramework-Emulator/releases)

### Connect to bot using Bot Framework Emulator **V4**
- Launch Bot Framework Emulator
- File -> Open bot and navigate to `samples\luis-bot-es6` folder
- Select `luis-bot-es6.bot` file

### Connect to bot using Bot Framework Emulator **V3**
- Launch Bot Framework Emulator
- Paste this URL in the emulator window - http://localhost:3978/api/messages

# LUIS
Language Understanding service (LUIS) allows your application to understand what a person wants in their own words. LUIS uses machine learning to allow developers to build applications that can receive user input in natural language and extract meaning from it.

# Further reading

- [Azure Bot Service Introduction](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Bot State](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-storage-concept?view=azure-bot-service-4.0)
- [LUIS documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/LUIS/)
