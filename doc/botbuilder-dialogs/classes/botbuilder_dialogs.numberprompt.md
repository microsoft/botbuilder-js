[Bot Builder SDK - Dialogs](../README.md) > [NumberPrompt](../classes/botbuilder_dialogs.numberprompt.md)



# Class: NumberPrompt


Prompts a user to enter a number. By default the prompt will return to the calling dialog a `number` representing the users input.

**Example usage:**

    const { DialogSet, NumberPrompt } = require('botbuilder-dialogs');

    const dialogs = new DialogSet();

    dialogs.add('numberPrompt', new NumberPrompt());

    dialogs.add('numberDemo', [
         function (context) {
             return dialogs.prompt(context, 'numberPrompt', `number: enter a number`);
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

* [constructor](botbuilder_dialogs.numberprompt.md#constructor)


### Methods

* [begin](botbuilder_dialogs.numberprompt.md#begin)
* [continue](botbuilder_dialogs.numberprompt.md#continue)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new NumberPrompt**(validator?: *[PromptValidator](../#promptvalidator)`number`⎮`undefined`⎮`undefined`*): [NumberPrompt](botbuilder_dialogs.numberprompt.md)


*Defined in [libraries/botbuilder-dialogs/lib/prompts/numberPrompt.d.ts:36](https://github.com/Microsoft/botbuilder-js/blob/4638a56/libraries/botbuilder-dialogs/lib/prompts/numberPrompt.d.ts#L36)*



Creates a new instance of the prompt.

**Example usage:**

    dialogs.add('agePrompt', new NumberPrompt((context, value) => {
         if (value === undefined || value < 1 || value > 110) {
             context.reply(`Please enter a valid age between 1 and 110.`);
             return Promise.resolve();
         } else {
             return dialogs.end(context, value);
         }
    }));


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)`number`⎮`undefined`⎮`undefined`   |  (Optional) validator that will be called each time the user responds to the prompt. |





**Returns:** [NumberPrompt](botbuilder_dialogs.numberprompt.md)

---


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, options: *[PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/prompts/numberPrompt.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/4638a56/libraries/botbuilder-dialogs/lib/prompts/numberPrompt.d.ts#L55)*



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

*Defined in [libraries/botbuilder-dialogs/lib/prompts/numberPrompt.d.ts:56](https://github.com/Microsoft/botbuilder-js/blob/4638a56/libraries/botbuilder-dialogs/lib/prompts/numberPrompt.d.ts#L56)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |





**Returns:** `Promise`.<`void`>





___


