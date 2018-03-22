[Bot Builder SDK - Dialogs](../README.md) > [DialogSet](../classes/botbuilder_dialogs.dialogset.md)



# Class: DialogSet


A related set of dialogs that can all call each other.

**Example usage:**

    const { Bot, MemoryStorage, BotStateManager } = require('botbuilder');
    const { ConsoleAdapter } = require('botbuilder-node');
    const { DialogSet } = require('botbuilder-dialogs');

    const dialogs = new DialogSet();

    dialogs.add('greeting', [
         function (context) {
             context.reply(`Hello... I'm a bot :)`);
             return dialogs.end(context);
         }
    ]);

    const adapter = new ConsoleAdapter().listen();
    const bot = new Bot(adapter)
         .use(new MemoryStorage())
         .use(new BotStateManager())
         .onReceive((context) => {
             return dialogs.continue(context).then(() => {
                 // If nothing has responded start greeting dialog
                 if (!context.responded) {
                     return dialogs.begin(context, 'greeting');
                 }
             });
         });

## Type parameters
#### C :  `BotContext`
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



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:64](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L64)*



Adds a new dialog to the set and returns the added dialog.

**Example usage:**

    dialogs.add('greeting', [
         function (context, user) {
             context.reply(`Hello ${user.name}... I'm a bot :)`);
             return dialogs.end(context);
         }
    ]);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dialogId | `string`   |  Unique ID of the dialog within the set. |
| dialogOrSteps | [Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`   |  Either a new dialog or an array of waterfall steps to execute. If waterfall steps are passed in they will automatically be passed into an new instance of a `Waterfall` class. |





**Returns:** [Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:65](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L65)*



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



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:66](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L66)*



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



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:78](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L78)*



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


