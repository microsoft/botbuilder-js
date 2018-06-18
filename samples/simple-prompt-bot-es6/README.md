This sample shows how to use prompts to get (and validate) information.

To prompt a user for input, you can use any prompt provided by botbuilder. In this sample we use a TextPrompt and a NumberPrompt that recognizes integer numbers.

## To try this sample
- Clone the repository
```bash
git clone https://github.com/Microsoft/botbuilder-js.git
```

### Visual studio code
- open the `samples\simple-prompt-bot-es6` folder
- Bring up a terminal, navigate to `samples\simple-prompt-bot-es6` folder
- type `npm install` to install the sample's dependencies
- type `npm start` to run the bot

## Testing the bot using Bot Framework Emulator
[Microsoft Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework emulator from [here](https://github.com/Microsoft/BotFramework-Emulator/releases)

### Connect to bot using Bot Framework Emulator **V4**
- Launch Bot Framework Emulator
- File -> Open bot and navigate to `samples\simple-prompt-bot-es6` folder
- Select `simple-prompt-bot-es6.bot` file

### Connect to bot using Bot Framework Emulator **V3**
- Launch Bot Framework Emulator
- Paste this URL in the emulator window - http://localhost:3978/api/messages

# Further reading

- [Azure Bot Service Introduction](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Bot basics](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-basics?view=azure-bot-service-4.0)
- [Channels and Bot Connector service](https://docs.microsoft.com/en-us/azure/bot-service/bot-concepts?view=azure-bot-service-4.0)
- [Prompt users for input](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-prompts?view=azure-bot-service-4.0&tabs=javascript)