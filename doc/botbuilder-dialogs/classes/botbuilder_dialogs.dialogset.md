[Bot Builder SDK - Dialogs](../README.md) > [DialogSet](../classes/botbuilder_dialogs.dialogset.md)



# Class: DialogSet


:package: **botbuilder-dialogs**

A related set of dialogs that can all call each other.

### Overview

The dialogs library uses a stack based metaphor to manage a bot conversation with a user. In this model the bt begins dialogs to prompt the user for information. Those dialogs will typically call prompts to actually ask the user for information. A variety of typed prompts are provided and are themselves just other dialogs. When a prompt recognizes a users input as being valid, it will end itself and return the users input to the dialog that started it. That dialog is then free to either process the users input or ask the user for more information by pushing other dialogs/prompts onto the stack. Below is a simple `Waterfall` dialog that asks the user for their name and phone number:

    const { DialogSet, TextPrompt } = require('botbuilder-dialogs');

    const dialogs = new DialogSet();

    dialogs.add('fillProfile', [
        async function (dc, options) {
            dc.instance.state = {};
            return dc.prompt('textPrompt', `What's your name?`);
        },
        async function (dc, name) {
            dc.instance.state.name = name;
            return dc.prompt('textPrompt', `What's your phone number?`);
        },
        async function (dc, phone) {
            dc.instance.state.phone = phone;

            // Return completed profile
            return dc.end(dc.instance.state);
        }
    ]);

    dialogs.add('textPrompt', new TextPrompt());

At first glance it probably looks like we're making this simple task of asking the user two questions way harder then it needs to be. It turns out though that asking a user even one question is a really hard problem. The primary issues coming from the fact that a) your bot will likely be running across multiple compute nodes and the node that asked the user a question may not be the one that receives their answer. and b) it could be minutes, hours, days, or even weeks before the user replies to the bot. Your bots compute process could have been restarted or updated any number of times before the user replies to the last question.

The dialogs library addresses both of those issues by having you statically define and explicitly name all of your bots dialogs on startups. It then uses a persisted dialog stack to essentially maintain a program pointer so that any time a message is received from a user it can identify the function it should run to process that message in a deterministic way.

### Routing Requests

To run the 'fillProfile' dialog above we need to add a bit of fairly boilerplate code to our bots routing logic:

    server.post('/api/messages', (req, res) => {
        adapter.processActivity(req, res, async (context) => {
            // Continue execution if there's a "current" dialog
            const state = conversationState.get(context);
            const dc = dialogs.createContext(context, state);
            await dc.continue();
            if (!context.responded && context.activity.type === ActivityType.Message) {
                // No active dialogs so start 'fillProfile' dialog
                await dc.begin('fillProfile');
            }
        });
    });

This code results in a bot that loops over prompting the user to fill out their profile so while not overly useful it does serve as a good starting point for understanding how to route request to your bots dialogs.

The code first creates a `DialogContext` and then calls `dc.continue()` which will route the request to the "current" dialog on the top of the stack, if there is one. It's using `context.responded` to determine if anything processed the request which is reasonable given that as a best practice your bot should always reply to any message received from the user. So if nothing has responded and we've received a `message` activity we'll start the 'fillProfile' by calling `dc.begin()`.

### Detecting Interruptions

## Type parameters
#### C :  `TurnContext`

The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.

## Index

### Methods

* [add](botbuilder_dialogs.dialogset.md#add)
* [createContext](botbuilder_dialogs.dialogset.md#createcontext)
* [find](botbuilder_dialogs.dialogset.md#find)



---
## Methods
<a id="add"></a>

###  add

► **add**(dialogId: *`string`*, dialogOrSteps: *[Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`*): [Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`

► **add**(dialogId: *`string`*, dialogOrSteps: *[WaterfallStep](../#waterfallstep)`C`[]*): [Waterfall](botbuilder_dialogs.waterfall.md)`C`



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:121](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L121)*



Adds a new dialog to the set and returns the added dialog.

**Example usage:**

    dialogs.add('greeting', [
         async function (dc) {
             await dc.context.sendActivity(`Hello world!`);
             return dc.end();
         }
    ]);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dialogId | `string`   |  Unique ID of the dialog within the set. |
| dialogOrSteps | [Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`   |  Either a new dialog or an array of waterfall steps to execute. If waterfall steps are passed in they will automatically be passed into an new instance of a `Waterfall` class. |





**Returns:** [Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:122](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L122)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dialogId | `string`   |  - |
| dialogOrSteps | [WaterfallStep](../#waterfallstep)`C`[]   |  - |





**Returns:** [Waterfall](botbuilder_dialogs.waterfall.md)`C`





___

<a id="createcontext"></a>

###  createContext

► **createContext**(context: *`C`*, state: *`object`*): [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:123](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L123)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `C`   |  - |
| state | `object`   |  - |





**Returns:** [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`





___

<a id="find"></a>

###  find

► **find**T(dialogId: *`string`*): `T`⎮`undefined`



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:135](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L135)*



Finds a dialog that was previously added to the set using [add()](#add).

**Example usage:**

    const dialog = dialogs.find('greeting');


**Type parameters:**

#### T :  [Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`

(Optional) type of dialog returned.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dialogId | `string`   |  ID of the dialog/prompt to lookup. |





**Returns:** `T`⎮`undefined`





___


