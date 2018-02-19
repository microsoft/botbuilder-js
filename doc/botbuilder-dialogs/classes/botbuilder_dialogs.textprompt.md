[Bot Builder SDK - Dialogs](../README.md) > [TextPrompt](../classes/botbuilder_dialogs.textprompt.md)



# Class: TextPrompt


Prompts a user to enter some text. By default the prompt will return to the calling dialog a `string` representing the users reply.

**Example usage:**

    const { DialogSet, TextPrompt } = require('botbuilder-dialogs');

    const dialogs = new DialogSet();

    dialogs.add('textPrompt', new TextPrompt());

    dialogs.add('textDemo', [
         function (context) {
             return dialogs.prompt(context, 'textPrompt', `text: enter some text`);
         },
         function (context, value) {
             context.reply(`Recognized value: ${value}`);
             return dialogs.end(context);
         }
    ]);

## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)

## Index

### Constructors

* [constructor](botbuilder_dialogs.textprompt.md#constructor)


### Methods

* [begin](botbuilder_dialogs.textprompt.md#begin)
* [continue](botbuilder_dialogs.textprompt.md#continue)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new TextPrompt**(validator?: *[PromptValidator](../#promptvalidator)`string`⎮`undefined`*): [TextPrompt](botbuilder_dialogs.textprompt.md)


*Defined in [libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts:36](https://github.com/Microsoft/botbuilder-js/blob/9f80f0a/libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts#L36)*



Creates a new instance of the prompt.

**Example usage:**

    dialogs.add('titlePrompt', new TextPrompt((context, value) => {
         if (value.length < 3) {
             context.reply(`Title should be at least 3 characters long.`);
             return Promise.resolve();
         } else {
             return dialogs.end(context, value.trim());
         }
    }));


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)`string`⎮`undefined`   |  (Optional) validator that will be called each time the user responds to the prompt. |





**Returns:** [TextPrompt](botbuilder_dialogs.textprompt.md)

---


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, options: *[PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/9f80f0a/libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts#L55)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |
| options | [PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="continue"></a>

###  continue

► **continue**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*): `Promise`.<`void`>



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[continue](../interfaces/botbuilder_dialogs.dialog.md#continue)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts:56](https://github.com/Microsoft/botbuilder-js/blob/9f80f0a/libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts#L56)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |





**Returns:** `Promise`.<`void`>





___


