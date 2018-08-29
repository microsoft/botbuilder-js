A dialog stack based conversation manager for Microsoft BotBuilder.

- [Installing](#installing)
- [Documentation](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Library Reference](https://docs.microsoft.com/en-us/javascript/api/botbuilder-dialogs/)
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


## Use

After adding the module to your application, modify your app's code to import the multi-turn dialog management capabilities. Near your other `import` and `require` statements, add:

```
// import all capabities in the module.  
import * from "botbuilder-dialogs";
```

Then, create one or more `DialogSet` objects to manage the dialogs used in your bot:

```
// set up a storage system that will capture the conversation state.
const DIALOG_STATE_PROPERTY = 'dialogState';
const storage = new MemoryStorage();
const convoState = new ConversationState(storage);

// define a property associated with the conversation
const dialogState = convoState.createProperty(DIALOG_STATE_PROPERTY);

// initialize the dialogset with the propery accessor as a paramter.
const dialogs = new DialogSet(dialogState);

// add dialog. each dialog is identified by a unique name used to invoke the dialog later
const DIALOG_ONE = 'dialog_identifier_value';
dialogs.add(new WaterfallDialog(DIALOG_ONE, [
    async (dialog_context, step) => {
        // access user input from previous step
        var last_step_answer = step.result;

        // send a message to the user
        await dialog_context.context.sendActivity('Send a reply');

        // continue to the next step
        return await step.next();

        // OR end
        // return await dc.end();
    },
    step2fn,
    step3fn,
    ...,
    stepNfn
]));
```

Finally, from somewhere in your bot's code, invoke your dialog by name:

```
// receive and process incoming events into TurnContext objects in the normal way
adapter.processActivity(req, res, async (context) => {
    // create a dialogContext object from the incoming TurnContext
    const dc = await dialogs.createContext(context);

    // ...evaluate message and do other bot logic...

    // invoke the dialog we created above
    dc.begin(DIALOG_ONE);
});
```