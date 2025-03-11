# Bot Builder Fluent Dialog

A Microsoft BotBuilder dialog implementation using event sourcing.

- [Installing](#installing)
- [Basic Use](#use)
- [Learn More](#learn-more)
- [Documentation](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Class Reference](https://docs.microsoft.com/en-us/javascript/api/botbuilder-dialogs/)
- [GitHub Repo](https://github.com/Microsoft/botbuilder-js)
- [Report Issues](https://github.com/Microsoft/botbuilder-js/issues)

## Installing
To add the latest version of this package to your bot:

```bash
npm install --save botbuilder-dialogs-fluent
```

#### How to Use Daily Builds
If you want to play with the very latest versions of botbuilder, you can opt in to working with the daily builds.  This is not meant to be used in a production environment and is for advanced development.  Quality will vary and you should only use daily builds for exploratory purposes. 

To get access to the daily builds of this library, configure npm to use the MyGet feed before installing.

```bash
npm config set registry https://botbuilder.myget.org/F/botbuilder-v4-js-daily/npm/
```

To reset the registry in order to get the latest published version, run:
```bash
npm config set registry https://registry.npmjs.org/
```

## What's included?

This module includes a dialog implementation using an approach similar to a durable function. The FluentDialog uses event sourcing to enable arbitrarily complex user interactions in a seemingly uninterrupted execution flow. 
Behind the scenes, the yield operator in the dialog flow function yields control of the execution thread back to a dialog flow dispatcher. The dispatcher then commits any new actions that the dialog flow function scheduled (such as starting a child dialog, receiving an activity or making an async call) to storage.
The transparent commit action updates the execution history of the dialog flow by appending all new events into the dialog state, much like an append-only log. 
Once the history is updated, the dialog ends its turn and, when it is later resumed, the dispatcher re-executes the entire function from the start to rebuild the local state. 
During the replay, if the code tries to begin a child dialog (or do any  async work), the dispatcher consults the execution history, replays that result and the function code continues to run. 
The replay continues until the function code is finished or until it yields a new suspension task.

## Use

After adding the module to your application, modify your app's code to import the multi-turn dialog management capabilities. Near your other `import` and `require` statements, add:

```javascript
// Import some of the capabities from the module. 
const { DialogSet, TextPrompt, ConfirmPrompt } = require("botbuilder-dialogs");
const { FluentDialog } = require("botbuilder-dialogs-fluent");
```

Then, create one or more `DialogSet` objects to manage the dialogs used in your bot.
A DialogSet is used to collect and execute dialogs. A bot may have more than one
DialogSet, which can be used to group dialogs logically and avoid name collisions.

Then, create one or more dialogs and add them to the DialogSet. Use the WaterfallDialog
class to construct dialogs defined by a series of functions for sending and receiving input
that will be executed in order.

More sophisticated multi-dialog sets can be created using the `ComponentDialog` class, which
contains a DialogSet, is itself also a dialog that can be triggered like any other. By building on top ComponentDialog,
developer can bundle multiple dialogs into a single unit which can then be packaged, distributed and reused.

```javascript
// Set up a storage system that will capture the conversation state.
const storage = new MemoryStorage();
const convoState = new ConversationState(storage);

// Define a property associated with the conversation state.
const dialogState = convoState.createProperty('dialogState');

// Initialize a DialogSet, passing in a property used to capture state.
const dialogs = new DialogSet(dialogState);

// Each dialog is identified by a unique name used to invoke the dialog later.
const MAIN_DIALOG = 'MAIN_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT'
const CONFIRM_PROMPT = 'CONFIRM_PROMPT'

// Implement the dialog flow function
function *dialogFlow(context) {

    let response = yield context.prompt(DIALOG_PROMPT, 'say something');
    yield context.sendActivity(`you said: ${response}`);
        
    let shouldContinue = yield context.prompt(CONFIRM_PROMPT, 'play another round?', ['yes', 'no'])
    if (shouldContinue) {
        yield context.restart();
    }

    yield context.sendActivity('good bye!');
}

// Add a dialog. Use the included FluentDialog type, initialized with the dialog flow function
dialogs.add(new FluentDialog(MAIN_DIALOG, dialogFlow));
dialogs.add(new TextPrompt(DIALOG_PROMPT));
dialogs.add(new ConfirmPrompt(CONFIRM_PROMPT));

```

Finally, from somewhere in your bot's code, invoke your dialog by name:

```javascript
// Receive and process incoming events into TurnContext objects in the normal way
adapter.processActivity(req, res, async (turnContext) => {
    // Create a DialogContext object from the incoming TurnContext
    const dc = await dialogs.createContext(turnContext);

    // ...evaluate message and do other bot logic...

    // If the bot hasn't yet responded, try to continue any active dialog
    if (!turnContext.responded) {
        const results = await dc.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(MAIN_DIALOG);
        }
    }
});
```

## Examples

See this module in action in these example apps:

# Learn More

[Prompts](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-prompts?view=azure-bot-service-4.0&tabs=javascript) This module contains several types of built-in prompt that can be used to create dialogs that capture and validate specific data types like dates, numbers and multiple-choice answers.

[DialogSet](https://docs.microsoft.com/en-us/javascript/api/botbuilder-dialogs/dialogset) DialogSet is a container for multiple dialogs. Once added to a DialogSet, dialogs can be called and interlinked.

[ComponentDialog](https://docs.microsoft.com/en-us/javascript/api/botbuilder-dialogs/componentdialog) ComponentDialogs are containers that encapsulate multiple sub-dialogs, but can be invoked like normal dialogs. This is useful for re-usable dialogs, or creating multiple dialogs with similarly named sub-dialogs that would otherwise collide.
