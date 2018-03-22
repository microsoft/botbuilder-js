[Bot Builder SDK - Dialogs](../README.md) > [DialogContext](../classes/botbuilder_dialogs.dialogcontext.md)



# Class: DialogContext

## Type parameters
#### C :  `BotContext`
## Index

### Constructors

* [constructor](botbuilder_dialogs.dialogcontext.md#constructor)


### Properties

* [batch](botbuilder_dialogs.dialogcontext.md#batch)
* [context](botbuilder_dialogs.dialogcontext.md#context)
* [dialogs](botbuilder_dialogs.dialogcontext.md#dialogs)
* [instance](botbuilder_dialogs.dialogcontext.md#instance)
* [stack](botbuilder_dialogs.dialogcontext.md#stack)


### Methods

* [begin](botbuilder_dialogs.dialogcontext.md#begin)
* [continue](botbuilder_dialogs.dialogcontext.md#continue)
* [end](botbuilder_dialogs.dialogcontext.md#end)
* [endAll](botbuilder_dialogs.dialogcontext.md#endall)
* [prompt](botbuilder_dialogs.dialogcontext.md#prompt)
* [replace](botbuilder_dialogs.dialogcontext.md#replace)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new DialogContext**(dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)`C`*, context: *`C`*, stack: *[DialogInstance](../interfaces/botbuilder_dialogs.dialoginstance.md)[]*): [DialogContext](botbuilder_dialogs.dialogcontext.md)


*Defined in [libraries/botbuilder-dialogs/lib/dialogContext.d.ts:40](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogContext.d.ts#L40)*



Creates a new DialogContext instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)`C`   |  Parent dialog set. |
| context | `C`   |  Context for the current turn of conversation with the user. |
| stack | [DialogInstance](../interfaces/botbuilder_dialogs.dialoginstance.md)[]   |  Current dialog stack. |





**Returns:** [DialogContext](botbuilder_dialogs.dialogcontext.md)

---


## Properties
<a id="batch"></a>

###  batch

**●  batch**:  *`BatchOutput`* 

*Defined in [libraries/botbuilder-dialogs/lib/dialogContext.d.ts:40](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogContext.d.ts#L40)*



Allows for batch based responses from the bot. Optional to use but you should add `BatchOutput` to your adapters middleware stack if you do, otherwise you'll need to manually call `dc.batch.flush()` somewhere within your bots logic.




___

<a id="context"></a>

###  context

**●  context**:  *`C`* 

*Defined in [libraries/botbuilder-dialogs/lib/dialogContext.d.ts:33](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogContext.d.ts#L33)*





___

<a id="dialogs"></a>

###  dialogs

**●  dialogs**:  *[DialogSet](botbuilder_dialogs.dialogset.md)`C`* 

*Defined in [libraries/botbuilder-dialogs/lib/dialogContext.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogContext.d.ts#L32)*





___

<a id="instance"></a>

###  instance

**●  instance**:  *[DialogInstance](../interfaces/botbuilder_dialogs.dialoginstance.md)⎮`undefined`* 

*Defined in [libraries/botbuilder-dialogs/lib/dialogContext.d.ts:49](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogContext.d.ts#L49)*



Returns the cached instance of the active dialog on the top of the stack or `undefined` if the stack is empty.




___

<a id="stack"></a>

###  stack

**●  stack**:  *[DialogInstance](../interfaces/botbuilder_dialogs.dialoginstance.md)[]* 

*Defined in [libraries/botbuilder-dialogs/lib/dialogContext.d.ts:34](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogContext.d.ts#L34)*





___


## Methods
<a id="begin"></a>

###  begin

► **begin**(dialogId: *`string`*, dialogArgs?: *`any`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)>



*Defined in [libraries/botbuilder-dialogs/lib/dialogContext.d.ts:62](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogContext.d.ts#L62)*



Pushes a new dialog onto the dialog stack.

**Example usage:**

    const dc = dialogs.createContext(context, stack);
    return dc.begin('greeting', user);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dialogId | `string`   |  ID of the dialog to start. |
| dialogArgs | `any`   |  (Optional) additional argument(s) to pass to the dialog being started. |





**Returns:** `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)>





___

<a id="continue"></a>

###  continue

► **continue**(): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)>



*Defined in [libraries/botbuilder-dialogs/lib/dialogContext.d.ts:94](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogContext.d.ts#L94)*



Continues execution of the active dialog, if there is one, by passing the context object to its `Dialog.continue()` method. You can check `context.responded` after the call completes to determine if a dialog was run and a reply was sent to the user.

**Example usage:**

    const dc = dialogs.createContext(context, dialogStack);
    return dc.continue().then(() => {
         if (!context.responded) {
             return dc.begin('fallback');
         }
    });




**Returns:** `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)>





___

<a id="end"></a>

###  end

► **end**(result?: *`any`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)>



*Defined in [libraries/botbuilder-dialogs/lib/dialogContext.d.ts:119](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogContext.d.ts#L119)*



Ends a dialog by popping it off the stack and returns an optional result to the dialogs parent. The parent dialog is the dialog the started the on being ended via a call to either [begin()](#begin) or [prompt()](#prompt).

The parent dialog will have its `Dialog.resume()` method invoked with any returned result. If the parent dialog hasn't implemented a `resume()` method then it will be automatically ended as well and the result passed to its parent. If there are no more parent dialogs on the stack then processing of the turn will end.

**Example usage:**

    dialogs.add('showUptime', [
         function (dc) {
             const elapsed = new Date().getTime() - started;
             dc.batch.reply(`I've been running for ${elapsed / 1000} seconds.`);
             return dc.end(elapsed);
         }
    ]);
    const started = new Date().getTime();


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| result | `any`   |  (Optional) result to pass to the parent dialogs `Dialog.resume()` method. |





**Returns:** `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)>





___

<a id="endall"></a>

###  endAll

► **endAll**(): `this`



*Defined in [libraries/botbuilder-dialogs/lib/dialogContext.d.ts:129](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogContext.d.ts#L129)*



Deletes any existing dialog stack thus cancelling all dialogs on the stack.

**Example usage:**

    await dc.endAll().begin('bookFlightTask');




**Returns:** `this`





___

<a id="prompt"></a>

###  prompt

► **prompt**O(dialogId: *`string`*, prompt: *`string`⎮`Partial`.<`Activity`>*, choicesOrOptions?: *`O`⎮`any`[]*, options?: *`O`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)>



*Defined in [libraries/botbuilder-dialogs/lib/dialogContext.d.ts:77](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogContext.d.ts#L77)*



Helper function to simplify formatting the options for calling a prompt dialog. This helper will construct a `PromptOptions` structure and then call [begin(context, dialogId, options)](#begin).

**Example usage:**

    return dc.prompt('confirmPrompt', `Are you sure you'd like to quit?`);


**Type parameters:**

#### O :  [PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)

(Optional) type of options expected by the prompt.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dialogId | `string`   |  ID of the prompt to start. |
| prompt | `string`⎮`Partial`.<`Activity`>   |  Initial prompt to send the user. |
| choicesOrOptions | `O`⎮`any`[]   |  (Optional) array of choices to prompt the user for or additional prompt options. |
| options | `O`   |  - |





**Returns:** `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)>





___

<a id="replace"></a>

###  replace

► **replace**(dialogId: *`string`*, dialogArgs?: *`any`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)>



*Defined in [libraries/botbuilder-dialogs/lib/dialogContext.d.ts:151](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogContext.d.ts#L151)*



Ends the active dialog and starts a new dialog in its place. This is particularly useful for creating loops or redirecting to another dialog.

**Example usage:**

    dialogs.add('loop', [
         function (dc, args) {
             dc.instance.state = args;
             return dc.begin(args.dialogId);
         },
         function (dc) {
             const args = dc.instance.state;
             return dc.replace('loop', args);
         }
    ]);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dialogId | `string`   |  ID of the new dialog to start. |
| dialogArgs | `any`   |  (Optional) additional argument(s) to pass to the new dialog. |





**Returns:** `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)>





___


