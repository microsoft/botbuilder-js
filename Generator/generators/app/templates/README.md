# <%= botName %> Bot

This bot has been created using [Microsoft Bot Framework](https://dev.botframework.com), 

This bot is designed to do the following:

<%= description %>

## About the generator

The goal of the BotBuilder Yeoman generator is to both scaffold out a bot according to general best practices, and to provide some templates you can use when implementing commonly requested features and dialogs in your bot. As a result, you will notice that all dialogs are located in a folder called `dialogs`, and the one you chose when running the wizard becomes the default (or root) dialog. You are free to use the additional dialogs provided (or delete them) as you see fit.

One thing to note is it's not possible to completely generate a bot or dialog, as the questions you need to ask of your user will vary wildly depending on your scenario. As such, we hope we've given you a good starting point for building your bots with Bot Framework.

### Dialogs

This generator provides the following dialogs:
- LUIS Dialog, for use with [LUIS](https://luis.ai)
- QnA Maker Dialog, for use with [QnA Maker](https://qnamaker.ai)
- Echo Dialog, for simple bots

Each class has three properties to help simplify addition to an existing bot:
- id: Used for the id
- waterfall: The logic (or waterfall) for the dialog
- name: The intent name for the dialog for triggering

You can add a dialog to a bot with the following code:

``` javascript
// declare your dialog

bot.dialog(dialog.id, dialog.waterfall).triggerAction({ matches: dialog.name });
```

By using this structure, it would be possible to dynamically load all of the dialogs in the `dialogs` folder, and then add them to the bot.

## Getting Started

### Dependencies

- **[Restify](http://restify.com)** Used to host the web service for the bot, and for making REST calls
- **[dotenv](https://github.com/motdotla/dotenv)** Used to manage environmental variables

### Structure

`app.<%= extension %>` references the bot and starts a Restify server. `bot.<%= extension %>` loads the dialog type you selected when running the generator and adds it as the default dialog. `dialogs.<%= extension %>` contains the list of sample dialogs.

### Configuring the bot

Update `.env` with the appropriate keys:

- KBID and SUBSCRIPTION_KEY for QnA Maker
- LUIS_MODEL_URL for LUIS
- App ID and Key for registered bots.

In the case of LUIS, you will need to update the dialog in `dialogs.<%= extension %>` to work with the appropriate intent and entities.

### The dialogs

- Echo dialog is designed for simple Hello, World demos and to get you started.
- LUIS dialog has the basic code to retrieve an entity

### Running the bot

```
<%= launchSteps %>
```

## Additional Resources

- [Microsoft Virtual Academy Bots Course](http://aka.ms/botcourse)
- [Bot Framework Documentation](https://docs.botframework.com)
- [LUIS](https://luis.ai)
- [QnA Maker](https://qnamaker.ai)