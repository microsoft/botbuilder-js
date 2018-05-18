This sample shows how to use multiple prompts and waterfall dialogs.

## To try this sample
- Clone the repository
```bash
git clone https://github.com/Microsoft/botbuilder-js.git
```

### Visual studio code
- open `samples\multiple-prompts-bot-es6` folder
- Bring up a terminal, navigate to `samples\multiple-prompts-bot-es6` folder
- type `npm install` to install the sample's dependencies
- type `npm start` to run the bot

## Testing the bot using Bot Framework Emulator
[Microsoft Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework emulator from [here](https://github.com/Microsoft/BotFramework-Emulator/releases)

### Connect to bot using Bot Framework Emulator **V4**
- Launch Bot Framework Emulator
- File -> Open bot and navigate to `samples\multiple-prompts-bot-es6` folder
- Select `multiple-prompts-bot-es6.bot` file

### Connect to bot using Bot Framework Emulator **V3**
- Launch Bot Framework Emulator
- Paste this URL in the emulator window - http://localhost:3978/api/messages

# Manage conversation flow with Dialogs
Managing conversation flow is an essential task in building bots. With the Bot Builder SDK, you can manage conversation flow using dialogs.

A dialog is like a function in a program. It is generally designed to perform a specific operation and it can be invoked as often as it is needed. You can chain multiple dialogs together to handle just about any conversation flow that you want your bot to handle. The dialogs library in the Bot Builder SDK includes built-in features such as prompts and waterfalls to help you manage conversation flow through dialogs. The prompts library provides various prompts you can use to ask users for different types of information. The waterfalls provide a way for you to combine multiple steps together in a sequence.

# Further reading

- [Azure Bot Service Introduction](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Bot State](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-storage-concept?view=azure-bot-service-4.0)
- [Manage conversation flow with Dialogs](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-dialog-manage-conversation-flow?view=azure-bot-service-4.0&tabs=js)