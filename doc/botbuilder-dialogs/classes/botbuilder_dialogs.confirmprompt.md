[Bot Builder SDK - Dialogs](../README.md) > [ConfirmPrompt](../classes/botbuilder_dialogs.confirmprompt.md)



# Class: ConfirmPrompt


Prompts a user to confirm something with a yes/no response. By default the prompt will return to the calling dialog a `boolean` representing the users selection.

**Example usage:**

    const { DialogSet, ConfirmPrompt } = require('botbuilder-dialogs');

    const dialogs = new DialogSet();

    dialogs.add('confirmPrompt', new ConfirmPrompt());

    dialogs.add('confirmDemo', [
         function (context) {
             return dialogs.prompt(context, 'confirmPrompt', `confirm: answer "yes" or "no"`);
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

* [constructor](botbuilder_dialogs.confirmprompt.md#constructor)


### Properties

* [stylerOptions](botbuilder_dialogs.confirmprompt.md#styleroptions)
* [choices](botbuilder_dialogs.confirmprompt.md#choices)


### Methods

* [begin](botbuilder_dialogs.confirmprompt.md#begin)
* [continue](botbuilder_dialogs.confirmprompt.md#continue)
* [sendChoicePrompt](botbuilder_dialogs.confirmprompt.md#sendchoiceprompt)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new ConfirmPrompt**(validator?: *[PromptValidator](../#promptvalidator)`boolean`⎮`undefined`⎮`undefined`*): [ConfirmPrompt](botbuilder_dialogs.confirmprompt.md)


*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:65](https://github.com/Microsoft/botbuilder-js/blob/9f80f0a/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L65)*



Creates a new instance of the prompt.

**Example usage:**

    dialogs.add('confirmPrompt', new ConfirmPrompt((context, value) => {
         if (value === undefined) {
             context.reply(`Please answer with "yes" or "no".`);
             return Prompts.resolve();
         } else {
             return dialogs.end(context, values);
         }
    }));


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)`boolean`⎮`undefined`⎮`undefined`   |  (Optional) validator that will be called each time the user responds to the prompt. |





**Returns:** [ConfirmPrompt](botbuilder_dialogs.confirmprompt.md)

---


## Properties
<a id="styleroptions"></a>

###  stylerOptions

**●  stylerOptions**:  *[ChoiceStylerOptions]()* 

*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:65](https://github.com/Microsoft/botbuilder-js/blob/9f80f0a/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L65)*



Can be used to tweak the style of choice prompt rendered to the user.




___

<a id="choices"></a>

### «Static» choices

**●  choices**:  *[ConfirmChoices](../interfaces/botbuilder_dialogs.confirmchoices.md)* 

*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:63](https://github.com/Microsoft/botbuilder-js/blob/9f80f0a/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L63)*



Allows for the localization of the confirm prompts yes/no choices to other locales besides english. The key of each entry is the languages locale code and should be lower cased. A default fallback set of choices can be specified using a key of '*'.

**Example usage:**

    // Configure yes/no choices for english and spanish (default)
    ConfirmPrompt.choices['*'] = ['sí', 'no'];
    ConfirmPrompt.choices['es'] = ['sí', 'no'];
    ConfirmPrompt.choices['en-us'] = ['yes', 'no'];




___


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, options: *[ConfirmPromptOptions](../interfaces/botbuilder_dialogs.confirmpromptoptions.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:84](https://github.com/Microsoft/botbuilder-js/blob/9f80f0a/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L84)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |
| options | [ConfirmPromptOptions](../interfaces/botbuilder_dialogs.confirmpromptoptions.md)   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="continue"></a>

###  continue

► **continue**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*): `Promise`.<`void`>



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[continue](../interfaces/botbuilder_dialogs.dialog.md#continue)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:85](https://github.com/Microsoft/botbuilder-js/blob/9f80f0a/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L85)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="sendchoiceprompt"></a>

### «Protected» sendChoicePrompt

► **sendChoicePrompt**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, prompt: *`string`⎮[Partial]()[Activity]()*, speak?: *`undefined`⎮`string`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:86](https://github.com/Microsoft/botbuilder-js/blob/9f80f0a/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L86)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |
| prompt | `string`⎮[Partial]()[Activity]()   |  - |
| speak | `undefined`⎮`string`   |  - |





**Returns:** `Promise`.<`void`>





___


