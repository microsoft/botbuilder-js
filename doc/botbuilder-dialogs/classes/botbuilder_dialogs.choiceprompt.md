[Bot Builder SDK - Dialogs](../README.md) > [ChoicePrompt](../classes/botbuilder_dialogs.choiceprompt.md)



# Class: ChoicePrompt


Prompts a user to make a selection from a list of choices. By default the prompt will return to the calling dialog a `FoundChoice` for the choice the user selected. This can be overridden using a custom `PromptValidator`.

**Example usage:**

    const { DialogSet, ChoicePrompt } = require('botbuilder-dialogs');

    const dialogs = new DialogSet();

    dialogs.add('choicePrompt', new ChoicePrompt());

    dialogs.add('choiceDemo', [
         function (context) {
             return dialogs.prompt(context, 'choicePrompt', `choice: select a color`, ['red', 'green', 'blue']);
         },
         function (context, choice: FoundChoice) {
             context.reply(`Recognized choice: ${JSON.stringify(choice)}`);
             return dialogs.end(context);
         }
    ]);

## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)

## Index

### Constructors

* [constructor](botbuilder_dialogs.choiceprompt.md#constructor)


### Properties

* [stylerOptions](botbuilder_dialogs.choiceprompt.md#styleroptions)


### Methods

* [begin](botbuilder_dialogs.choiceprompt.md#begin)
* [continue](botbuilder_dialogs.choiceprompt.md#continue)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new ChoicePrompt**(validator?: *[PromptValidator](../#promptvalidator)[FoundChoice]()⎮`undefined`⎮`undefined`*, choices?: *[DynamicChoicesProvider](../#dynamicchoicesprovider)⎮`undefined`*): [ChoicePrompt](botbuilder_dialogs.choiceprompt.md)


*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:73](https://github.com/Microsoft/botbuilder-js/blob/4638a56/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L73)*



Creates a new instance of the prompt.

**Example usage:**

    const { ChoicePrompt, formatChoicePrompt } = require('botbuilder-dialogs');

    dialogs.add('choiceDemo', [
         function (context) {
             return dialogs.prompt(context, 'choicePrompt', `choice: select a color`, ['red', 'green', 'blue']);
         },
         function (context, choice) {
             context.reply(`Recognized choice: ${JSON.stringify(choice)}`);
             return dialogs.end(context);
         }
    ]);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)[FoundChoice]()⎮`undefined`⎮`undefined`   |  (Optional) validator that will be called each time the user responds to the prompt. |
| choices | [DynamicChoicesProvider](../#dynamicchoicesprovider)⎮`undefined`   |  (Optional) handler to dynamically provide the list of choices for the prompt/ |





**Returns:** [ChoicePrompt](botbuilder_dialogs.choiceprompt.md)

---


## Properties
<a id="styleroptions"></a>

###  stylerOptions

**●  stylerOptions**:  *[ChoiceStylerOptions]()* 

*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:73](https://github.com/Microsoft/botbuilder-js/blob/4638a56/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L73)*



Can be used to tweak the style of choice prompt rendered to the user.




___


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, options: *[ChoicePromptOptions](../interfaces/botbuilder_dialogs.choicepromptoptions.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:96](https://github.com/Microsoft/botbuilder-js/blob/4638a56/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L96)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |
| options | [ChoicePromptOptions](../interfaces/botbuilder_dialogs.choicepromptoptions.md)   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="continue"></a>

###  continue

► **continue**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*): `Promise`.<`void`>



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[continue](../interfaces/botbuilder_dialogs.dialog.md#continue)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:97](https://github.com/Microsoft/botbuilder-js/blob/4638a56/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L97)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |





**Returns:** `Promise`.<`void`>





___


