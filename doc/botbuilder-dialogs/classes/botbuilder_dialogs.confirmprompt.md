[Bot Builder SDK - Dialogs](../README.md) > [ConfirmPrompt](../classes/botbuilder_dialogs.confirmprompt.md)



# Class: ConfirmPrompt


Prompts a user to confirm something with a yes/no response. By default the prompt will return to the calling dialog a `boolean` representing the users selection.

**Example usage:**

    const { DialogSet, ConfirmPrompt } = require('botbuilder-dialogs');

    const dialogs = new DialogSet();

    dialogs.add('confirmPrompt', new ConfirmPrompt());

    dialogs.add('confirmDemo', [
         function (dc) {
             return dc.prompt('confirmPrompt', `confirm: answer "yes" or "no"`);
         },
         function (dc, value) {
             dc.batch.reply(`Recognized value: ${value}`);
             return dc.end();
         }
    ]);

## Type parameters
#### C :  `BotContext`
#### O 
#### C :  `BotContext`
## Hierarchy


↳  [Prompt](botbuilder_dialogs.prompt.md)`C`, `boolean`

**↳ ConfirmPrompt**







## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`

## Index

### Constructors

* [constructor](botbuilder_dialogs.confirmprompt.md#constructor)


### Properties

* [defaultOptions](botbuilder_dialogs.confirmprompt.md#defaultoptions)
* [choices](botbuilder_dialogs.confirmprompt.md#choices)


### Methods

* [begin](botbuilder_dialogs.confirmprompt.md#begin)
* [choiceOptions](botbuilder_dialogs.confirmprompt.md#choiceoptions)
* [continue](botbuilder_dialogs.confirmprompt.md#continue)
* [dialogBegin](botbuilder_dialogs.confirmprompt.md#dialogbegin)
* [dialogContinue](botbuilder_dialogs.confirmprompt.md#dialogcontinue)
* [onPrompt](botbuilder_dialogs.confirmprompt.md#onprompt)
* [onRecognize](botbuilder_dialogs.confirmprompt.md#onrecognize)
* [style](botbuilder_dialogs.confirmprompt.md#style)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new ConfirmPrompt**(validator?: *[PromptValidator](../#promptvalidator)`C`, `boolean`*, defaultLocale?: *`string`*): [ConfirmPrompt](botbuilder_dialogs.confirmprompt.md)


*Overrides [Prompt](botbuilder_dialogs.prompt.md).[constructor](botbuilder_dialogs.prompt.md#constructor)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:52](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L52)*



Creates a new instance of the prompt.

**Example usage:**

    dialogs.add('confirmPrompt', new ConfirmPrompt((dc, value) => {
         if (value === undefined) {
             dc.batch.reply(`Invalid answer. Answer with "yes" or "no".`);
             return undefined;
         } else {
             return value;
         }
    }));


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)`C`, `boolean`   |  (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent. |
| defaultLocale | `string`   |  (Optional) locale to use if `dc.context.request.locale` not specified. Defaults to a value of `en-us`. |





**Returns:** [ConfirmPrompt](botbuilder_dialogs.confirmprompt.md)

---


## Properties
<a id="defaultoptions"></a>

### «Protected» defaultOptions

**●  defaultOptions**:  *`O`* 

*Inherited from [Control](botbuilder_dialogs.control.md).[defaultOptions](botbuilder_dialogs.control.md#defaultoptions)*

*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/control.d.ts#L15)*





___

<a id="choices"></a>

### «Static» choices

**●  choices**:  *`prompts.ConfirmChoices`* 

*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:52](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L52)*



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



*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:77](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L77)*



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

► **onPrompt**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*, options: *[PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)*, isRetry: *`boolean`*): `Promise`.<`void`>



*Overrides [Prompt](botbuilder_dialogs.prompt.md).[onPrompt](botbuilder_dialogs.prompt.md#onprompt)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:83](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L83)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| options | [PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)   |  - |
| isRetry | `boolean`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="onrecognize"></a>

### «Protected» onRecognize

► **onRecognize**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*, options: *[PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)*): `Promise`.<`boolean`⎮`undefined`>



*Overrides [Prompt](botbuilder_dialogs.prompt.md).[onRecognize](botbuilder_dialogs.prompt.md#onrecognize)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:84](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L84)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| options | [PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)   |  - |





**Returns:** `Promise`.<`boolean`⎮`undefined`>





___

<a id="style"></a>

###  style

► **style**(listStyle: *`prompts.ListStyle`*): `this`



*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:82](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L82)*



Sets the style of the yes/no choices rendered to the user when prompting.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| listStyle | `prompts.ListStyle`   |  Type of list to render to to user. Defaults to `ListStyle.auto`. |





**Returns:** `this`





___


