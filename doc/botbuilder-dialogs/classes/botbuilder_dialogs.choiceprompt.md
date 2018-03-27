[Bot Builder SDK - Dialogs](../README.md) > [ChoicePrompt](../classes/botbuilder_dialogs.choiceprompt.md)



# Class: ChoicePrompt


Prompts a user to confirm something with a yes/no response. By default the prompt will return to the calling dialog a `boolean` representing the users selection.

**Example usage:**

    const { DialogSet, ChoicePrompt } = require('botbuilder-dialogs');

    const dialogs = new DialogSet();

    dialogs.add('choicePrompt', new ChoicePrompt());

    dialogs.add('choiceDemo', [
         function (dc) {
             return dc.prompt('choicePrompt', `choice: select a color`, ['red', 'green', 'blue']);
         },
         function (dc, choice) {
             dc.batch.reply(`Recognized choice: ${JSON.stringify(choice)}`);
             return dc.end();
         }
    ]);

## Type parameters
#### C :  `BotContext`
#### O 
#### C :  `BotContext`
## Hierarchy


↳  [Prompt](botbuilder_dialogs.prompt.md)`C`, `prompts.FoundChoice`

**↳ ChoicePrompt**







## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`

## Index

### Constructors

* [constructor](botbuilder_dialogs.choiceprompt.md#constructor)


### Properties

* [defaultOptions](botbuilder_dialogs.choiceprompt.md#defaultoptions)


### Methods

* [begin](botbuilder_dialogs.choiceprompt.md#begin)
* [choiceOptions](botbuilder_dialogs.choiceprompt.md#choiceoptions)
* [continue](botbuilder_dialogs.choiceprompt.md#continue)
* [dialogBegin](botbuilder_dialogs.choiceprompt.md#dialogbegin)
* [dialogContinue](botbuilder_dialogs.choiceprompt.md#dialogcontinue)
* [onPrompt](botbuilder_dialogs.choiceprompt.md#onprompt)
* [onRecognize](botbuilder_dialogs.choiceprompt.md#onrecognize)
* [recognizerOptions](botbuilder_dialogs.choiceprompt.md#recognizeroptions)
* [style](botbuilder_dialogs.choiceprompt.md#style)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new ChoicePrompt**(validator?: *[PromptValidator](../#promptvalidator)`C`, `prompts.FoundChoice`*, defaultLocale?: *`string`*): [ChoicePrompt](botbuilder_dialogs.choiceprompt.md)


*Overrides [Prompt](botbuilder_dialogs.prompt.md).[constructor](botbuilder_dialogs.prompt.md#constructor)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:42](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L42)*



Creates a new instance of the prompt.

**Example usage:**

    dialogs.add('choicePrompt', new ChoicePrompt());


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)`C`, `prompts.FoundChoice`   |  (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent. |
| defaultLocale | `string`   |  (Optional) locale to use if `dc.context.request.locale` not specified. Defaults to a value of `en-us`. |





**Returns:** [ChoicePrompt](botbuilder_dialogs.choiceprompt.md)

---


## Properties
<a id="defaultoptions"></a>

### «Protected» defaultOptions

**●  defaultOptions**:  *`O`* 

*Inherited from [Control](botbuilder_dialogs.control.md).[defaultOptions](botbuilder_dialogs.control.md#defaultoptions)*

*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/control.d.ts#L15)*





___


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`C`*, state: *`object`*, options?: *`O`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`C`>



*Inherited from [Control](botbuilder_dialogs.control.md).[begin](botbuilder_dialogs.control.md#begin)*

*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/control.d.ts#L21)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `C`   |  - |
| state | `object`   |  - |
| options | `O`   |  - |





**Returns:** `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`C`>





___

<a id="choiceoptions"></a>

###  choiceOptions

► **choiceOptions**(options: *`prompts.ChoiceFactoryOptions`*): `this`



*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:60](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L60)*



Sets additional options passed to the `ChoiceFactory` and used to tweak the style of choices rendered to the user.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | `prompts.ChoiceFactoryOptions`   |  Additional options to set. |





**Returns:** `this`





___

<a id="continue"></a>

###  continue

► **continue**(context: *`C`*, state: *`object`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`C`>



*Inherited from [Control](botbuilder_dialogs.control.md).[continue](botbuilder_dialogs.control.md#continue)*

*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:22](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/control.d.ts#L22)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `C`   |  - |
| state | `object`   |  - |





**Returns:** `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`C`>





___

<a id="dialogbegin"></a>

###  dialogBegin

► **dialogBegin**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*, options: *[PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)*): `Promise`.<`any`>



*Inherited from [Prompt](botbuilder_dialogs.prompt.md).[dialogBegin](botbuilder_dialogs.prompt.md#dialogbegin)*

*Overrides [Control](botbuilder_dialogs.control.md).[dialogBegin](botbuilder_dialogs.control.md#dialogbegin)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:39](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L39)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| options | [PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)   |  - |





**Returns:** `Promise`.<`any`>





___

<a id="dialogcontinue"></a>

###  dialogContinue

► **dialogContinue**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*): `Promise`.<`any`>



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[dialogContinue](../interfaces/botbuilder_dialogs.dialog.md#dialogcontinue)*

*Inherited from [Prompt](botbuilder_dialogs.prompt.md).[dialogContinue](botbuilder_dialogs.prompt.md#dialogcontinue)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:40](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L40)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |





**Returns:** `Promise`.<`any`>





___

<a id="onprompt"></a>

### «Protected» onPrompt

► **onPrompt**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*, options: *[ChoicePromptOptions](../interfaces/botbuilder_dialogs.choicepromptoptions.md)*, isRetry: *`boolean`*): `Promise`.<`void`>



*Overrides [Prompt](botbuilder_dialogs.prompt.md).[onPrompt](botbuilder_dialogs.prompt.md#onprompt)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:71](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L71)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| options | [ChoicePromptOptions](../interfaces/botbuilder_dialogs.choicepromptoptions.md)   |  - |
| isRetry | `boolean`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="onrecognize"></a>

### «Protected» onRecognize

► **onRecognize**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*, options: *[ChoicePromptOptions](../interfaces/botbuilder_dialogs.choicepromptoptions.md)*): `Promise`.<`prompts.FoundChoice`⎮`undefined`>



*Overrides [Prompt](botbuilder_dialogs.prompt.md).[onRecognize](botbuilder_dialogs.prompt.md#onrecognize)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:72](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L72)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| options | [ChoicePromptOptions](../interfaces/botbuilder_dialogs.choicepromptoptions.md)   |  - |





**Returns:** `Promise`.<`prompts.FoundChoice`⎮`undefined`>





___

<a id="recognizeroptions"></a>

###  recognizerOptions

► **recognizerOptions**(options: *`prompts.FindChoicesOptions`*): `this`



*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:65](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L65)*



Sets additional options passed to the `recognizeChoices()` function.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | `prompts.FindChoicesOptions`   |  Additional options to set. |





**Returns:** `this`





___

<a id="style"></a>

###  style

► **style**(listStyle: *`prompts.ListStyle`*): `this`



*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:70](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L70)*



Sets the style of the choice list rendered to the user when prompting.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| listStyle | `prompts.ListStyle`   |  Type of list to render to to user. Defaults to `ListStyle.auto`. |





**Returns:** `this`





___


