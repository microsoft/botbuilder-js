# basic-bot

This bot has been created using [Microsoft Bot Framework](https://dev.botframework.com),

This samples shows how to:
- Use [LUIS](https://luis.ai) to implement core AI capabilities
- Implement a multi-turn conversation using Dialogs
- Handle user interruptions for such things as Help or Cancel
- Prompt for and validate requests for information from the user


## To try this sample
- [Optional] Update the .env with your botFileSecret
    For Azure Bot Service bots, you can find the botFileSecret under application settings.
- Update the .env with your language generation app id and endpointKey
	```
	lgAppId=cafebot
	lgEndpointKey=<YOUR_KEY_HERE>
	```
- Install dependecies
  ```bash
  npm install
  ```
- Run the sample
  ```bash
  npm start
  ```

## Testing the bot using Bot Framework Emulator
[Microsoft Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework Emulator from [here](https://aka.ms/botframework-emulator)

### Connect to bot using Bot Framework Emulator v4
- Launch Bot Framework Emulator
- File -> Open Bot Configuration and navigate to `samples/53.book-table-bot` folder
- Select `book-table-bot.bot` file


## Further Reading
- [Bot Framework Documentation](https://docs.botframework.com)
- [Bot basics](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-basics?view=azure-bot-service-4.0)
- [Activity processing](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-activity-processing?view=azure-bot-service-4.0)
- [LUIS](https://luis.ai)
- [Prompt Types](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-prompts?view=azure-bot-service-4.0&tabs=javascript)
- [Azure Bot Service Introduction](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Channels and Bot Connector Service](https://docs.microsoft.com/en-us/azure/bot-service/bot-concepts?view=azure-bot-service-4.0)
- [QnA Maker](https://qnamaker.ai)

## Additional Resources

### Dependencies

- **[Restify](http://restify.com)** Used to host the web service for the bot, and for making REST calls
- **[dotenv](https://github.com/motdotla/dotenv)** Used to manage environmental variables

### Project Structure

`index.js` references the bot and starts a Restify server. `bot.js` loads the dialog type you selected when running the generator and adds it as the default dialog.

### Configuring the bot

Update `.env` with the appropriate keys botFilePath and botFileSecret.
  - For Azure Bot Service bots, you can find the botFileSecret under application settings.
  - If you use [MSBot CLI](https://github.com/microsoft/botbuilder-tools) to encrypt your bot file, the botFileSecret will be written out to the console window.
  - If you used [Bot Framework Emulator **V4**](https://github.com/microsoft/botframework-emulator) to encrypt your bot file, the secret key will be available in bot settings.

### Running the bot

```
node ./index.js
```
### Developing the bot

```
nodemon ./index.js
```



