A dialog stack based conversation manager for Microsoft BotBuilder.

- [Installing](#installing)
- [Basic Use](#use)
- [Advanced Topics](#advanced-topics)
- [Documentation](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Class Reference](https://docs.microsoft.com/en-us/javascript/api/botbuilder-dialogs/)
- [GitHub Repo](https://github.com/Microsoft/botbuilder-js)
- [Report Issues](https://github.com/Microsoft/botbuilder-js/issues)

## Installing
To add the preview version of this package to your bot be sure include the @preview tag:

```bash
npm install --save botbuilder-dialogs@preview
```

While this package is in preview it's possible for updates to include build breaks. To avoid having any updates break your bot it's recommended that you update the dependency table of your bots `package.json` file to lock down the specific version of the package you're using:

```JSON
{
    "dependencies": {
        "botbuilder": "4.0.0-preview1.2",
        "botbuilder-dialogs": "4.0.0-preview1.2"
    }
}
```

## What's included?

This module includes a system for managing multi-turn conversations within a Microsoft Botbuilder app, including
tools for creating and managing dialog systems, a means for creating custom interoperable dialog systems, and a series
of useful prompts that provide type checking and validation of input.

## Use

After adding the module to your application, modify your app's code to import the multi-turn dialog management capabilities. Near your other `import` and `require` statements, add:

```
// Import some of the capabities from the module. 
const { DialogSet, WaterfallDialog } = require("botbuilder-dialogs");
```

Then, create one or more `DialogSet` objects to manage the dialogs used in your bot.
A DialogSet is used to collect and execute dialogs. A bot may have more than one
DialogSet, which can be used to group dialogs logically and avoid name collisions.

Then, create one or more dialogs and add them to the DialogSet. Use the WaterfallDialog
class to construct dialogs defined by a series of functions for sending and receiving input
that will be executed in order. More sophisticated multi-dialog sets can be created using the `ComponentDialog` class, which
has many of the capabilities of a DialogSet, but behaves and can be called like a single dialog.

```
// Set up a storage system that will capture the conversation state.
const storage = new MemoryStorage();
const convoState = new ConversationState(storage);

// Define a property associated with the conversation state.
const dialogState = convoState.createProperty('dialogState');

// Initialize a DialogSet, passing in a property used to capture state.
const dialogs = new DialogSet(dialogState);

// Each dialog is identified by a unique name used to invoke the dialog later.
const DIALOG_ONE = 'dialog_identifier_value';

// Add a dialog. Use the included WaterfallDialog type, or build your own
// by subclassing from the Dialog class.
dialogs.add(new WaterfallDialog(DIALOG_ONE, [
    async (step) => {
        // access user input from previous step
        var last_step_answer = step.result;

        // send a message to the user
        await step.context.sendActivity('Send a reply');

        // continue to the next step
        return await step.next();

        // OR end
        // return await step.endDialog();
    },
    step2fn,
    step3fn,
    ...,
    stepNfn
]));
```

Finally, from somewhere in your bot's code, invoke your dialog by name:

```
// Receive and process incoming events into TurnContext objects in the normal way
adapter.processActivity(req, res, async (turnContext) => {
    // Create a DialogContext object from the incoming TurnContext
    const dc = await dialogs.createContext(turnContext);

    // ...evaluate message and do other bot logic...

    // If the bot hasn't yet responded, try to continue any active dialog
    if (!turnContext.responded) {
        const status = await dc.continueDialog();
    }

    // Invoke the dialog we created above.
    if (!turnContext.responded) {
        await dc.beginDialog(DIALOG_ONE);
    }
});
```

# Learn More

[Prompts](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-prompts?view=azure-bot-service-4.0&tabs=javascript) This module contains several types of built-in prompt that can be used to create dialogs that capture and validate specific data types like dates, numbers and multiple-choice answers.

[DialogSet]() DialogSet is a container for multiple dialogs. Once added to a DialogSet, dialogs can be called and interlinked.

[WaterfallDialog](https://docs.microsoft.com/en-us/javascript/api/botbuilder-dialogs/waterfall) WaterfallDialogs execute a series of step functions in order, passing the resulting user input from each steo into the next step's function.

[ComponentDialog]() ComponentDialogs are containers that encapsulate multiple sub-dialogs, but can be invoked like normal dialogs. This is useful for re-usable dialogs, or creating multiple dialogs with similarly named sub-dialogs that would otherwise collide.