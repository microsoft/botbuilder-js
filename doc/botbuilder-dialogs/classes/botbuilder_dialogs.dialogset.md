[Bot Builder SDK - Dialogs](../README.md) > [DialogSet](../classes/botbuilder_dialogs.dialogset.md)



# Class: DialogSet


A related set of dialogs that can all call each other.
*__example__*:     const { Bot, MemoryStorage, BotStateManager } = require('botbuilder');
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


## Index

### Constructors

* [constructor](botbuilder_dialogs.dialogset.md#constructor)


### Methods

* [add](botbuilder_dialogs.dialogset.md#add)
* [begin](botbuilder_dialogs.dialogset.md#begin)
* [continue](botbuilder_dialogs.dialogset.md#continue)
* [end](botbuilder_dialogs.dialogset.md#end)
* [endAll](botbuilder_dialogs.dialogset.md#endall)
* [find](botbuilder_dialogs.dialogset.md#find)
* [getInstance](botbuilder_dialogs.dialogset.md#getinstance)
* [getStack](botbuilder_dialogs.dialogset.md#getstack)
* [prompt](botbuilder_dialogs.dialogset.md#prompt)
* [replace](botbuilder_dialogs.dialogset.md#replace)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new DialogSet**(stackName?: *`undefined`⎮`string`*): [DialogSet](botbuilder_dialogs.dialogset.md)


*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:47](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L47)*



Creates an empty dialog set.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| stackName | `undefined`⎮`string`   |  (Optional) name of the field to store the dialog stack in off the bots conversation state object. This defaults to 'dialogStack'. |





**Returns:** [DialogSet](botbuilder_dialogs.dialogset.md)

---


## Methods
<a id="add"></a>

###  add

► **add**T(dialogId: *`string`*, dialogOrSteps: *`T`*): `T`

► **add**(dialogId: *`string`*, dialogOrSteps: *[WaterfallStep](../#waterfallstep)[]*): [Waterfall](botbuilder_dialogs.waterfall.md)



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:58](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L58)*



Adds a new dialog to the set and returns the added dialog.


**Type parameters:**

#### T :  [Dialog](../interfaces/botbuilder_dialogs.dialog.md)
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dialogId | `string`   |  Unique ID of the dialog within the set. |
| dialogOrSteps | `T`   |  Either a new dialog or an array of waterfall steps to execute. If waterfall steps are passed in they will automatically be passed into an new instance of a `Waterfall` class. |





**Returns:** `T`



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:59](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L59)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dialogId | `string`   |  - |
| dialogOrSteps | [WaterfallStep](../#waterfallstep)[]   |  - |





**Returns:** [Waterfall](botbuilder_dialogs.waterfall.md)





___

<a id="begin"></a>

###  begin

► **begin**(context: *`BotContext`*, dialogId: *`string`*, dialogArgs?: *`any`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:66](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L66)*



Pushes a new dialog onto the dialog stack.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  Context object for the current turn of conversation with the user. |
| dialogId | `string`   |  ID of the dialog to start. |
| dialogArgs | `any`   |  (Optional) additional argument(s) to pass to the dialog being started. |





**Returns:** `Promise`.<`void`>





___

<a id="continue"></a>

###  continue

► **continue**(context: *`BotContext`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:80](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L80)*



Continues execution of the active dialog, if there is one, by passing the context object to its `Dialog.continue()` method.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  Context object for the current turn of conversation with the user. |





**Returns:** `Promise`.<`void`>





___

<a id="end"></a>

###  end

► **end**(context: *`BotContext`*, result?: *`any`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:93](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L93)*



Ends a dialog by popping it off the stack and returns an optional result to the dialogs parent. The parent dialog is the dialog the started the on being ended via a call to either [begin()](#begin) or [prompt()](#prompt).

The parent dialog will have its `Dialog.resume()` method invoked with any returned result. If the parent dialog hasn't implemented a `resume()` method then it will be automatically ended as well and the result passed to its parent. If there are no more parent dialogs on the stack then processing of the turn will end.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  Context object for the current turn of conversation with the user. |
| result | `any`   |  (Optional) result to pass to the parent dialogs `Dialog.resume()` method. |





**Returns:** `Promise`.<`void`>





___

<a id="endall"></a>

###  endAll

► **endAll**(context: *`BotContext`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:98](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L98)*



Deletes any existing dialog stack thus cancelling all dialogs on the stack.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  Context object for the current turn of conversation with the user. |





**Returns:** `Promise`.<`void`>





___

<a id="find"></a>

###  find

► **find**T(dialogId: *`string`*): `T`⎮`undefined`



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:103](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L103)*



Finds a dialog that was previously added to the set using [add()](#add).


**Type parameters:**

#### T :  [Dialog](../interfaces/botbuilder_dialogs.dialog.md)
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dialogId | `string`   |  ID of the dialog/prompt to lookup. |





**Returns:** `T`⎮`undefined`





___

<a id="getinstance"></a>

###  getInstance

► **getInstance**T(context: *`BotContext`*): [DialogInstance](../interfaces/botbuilder_dialogs.dialoginstance.md)`T`



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:115](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L115)*



Returns the active dialog instance on the top of the stack. Throws an error if the stack is empty so use `dialogs.getStack(context).length > 0` to protect calls where the stack could be empty.


**Type parameters:**

#### T :  `Object`
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  Context object for the current turn of conversation with the user. |





**Returns:** [DialogInstance](../interfaces/botbuilder_dialogs.dialoginstance.md)`T`





___

<a id="getstack"></a>

###  getStack

► **getStack**T(context: *`BotContext`*): [DialogInstance](../interfaces/botbuilder_dialogs.dialoginstance.md)`T`[]



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:108](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L108)*



Returns the dialog stack persisted for a conversation.


**Type parameters:**

#### T :  `Object`
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  Context object for the current turn of conversation with the user. |





**Returns:** [DialogInstance](../interfaces/botbuilder_dialogs.dialoginstance.md)`T`[]





___

<a id="prompt"></a>

###  prompt

► **prompt**O(context: *`BotContext`*, dialogId: *`string`*, prompt: *`string`⎮[Partial]()[Activity]()*, choicesOrOptions?: *`O`⎮(`string`⎮[Choice]())[]*, options?: *[O]()*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:74](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L74)*



Helper function to simplify formatting the options for calling a prompt dialog.


**Type parameters:**

#### O :  [PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  Context object for the current turn of conversation with the user. |
| dialogId | `string`   |  ID of the prompt to start. |
| prompt | `string`⎮[Partial]()[Activity]()   |  Initial prompt to send the user. |
| choicesOrOptions | `O`⎮(`string`⎮[Choice]())[]   |  (Optional) array of choices to prompt the user for or additional prompt options. |
| options | [O]()   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="replace"></a>

###  replace

► **replace**(context: *`BotContext`*, dialogId: *`string`*, dialogArgs?: *`any`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/dialogSet.d.ts:124](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/dialogSet.d.ts#L124)*



Ends the current dialog and starts a new dialog in its place.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  Context object for the current turn of conversation with the user. |
| dialogId | `string`   |  ID of the new dialog to start. |
| dialogArgs | `any`   |  (Optional) additional argument(s) to pass to the new dialog. |





**Returns:** `Promise`.<`void`>





___


