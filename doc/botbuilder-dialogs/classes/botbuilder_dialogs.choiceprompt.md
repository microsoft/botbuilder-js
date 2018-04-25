[Bot Builder SDK - Dialogs](../README.md) > [ChoicePrompt](../classes/botbuilder_dialogs.choiceprompt.md)



# Class: ChoicePrompt


:package: **botbuilder-dialogs**

Prompts a user to confirm something with a yes/no response. By default the prompt will return to the calling dialog a `boolean` representing the users selection.

The prompt can be used either as a dialog added to your bots `DialogSet` or on its own as a control if your bot is using some other conversation management system.

### Dialog Usage

When used with your bots `DialogSet` you can simply add a new instance of the prompt as a named dialog using `DialogSet.add()`. You can then start the prompt from a waterfall step using either `DialogContext.begin()` or `DialogContext.prompt()`. The user will be prompted to select a choice from a list and their choice will be passed as an argument to the callers next waterfall step:

    const { DialogSet, ChoicePrompt } = require('botbuilder-dialogs');

    const dialogs = new DialogSet();

    dialogs.add('choicePrompt', new ChoicePrompt());

    dialogs.add('colorPrompt', [
         async function (dc) {
             return dc.prompt('choicePrompt', `Select a color`, ['red', 'green', 'blue']);
         },
         async function (dc, choice) {
             const color = choice.value;
             await dc.context.sendActivity(`I like ${color} too!`);
             return dc.end();
         }
    ]);

If the users response to the prompt fails to be recognized they will be automatically re-prompted to try again. By default the original prompt is re-sent to the user but you can provide an alternate prompt to send by passing in additional options:

    return dc.prompt('choicePrompt', `Select a color`, ['red', 'green', 'blue'], { retryPrompt: `I didn't catch that. Select a color from the list.` });

### Control Usage

If your bot isn't dialog based you can still use the prompt on its own as a control. You will just need start the prompt from somewhere within your bots logic by calling the prompts `begin()` method:

    const state = {};
    const prompt = new ChoicePrompt();
    await prompt.begin(context, state, {
        choices: ['red', 'green', 'blue'],
        prompt: `Select a color`,
        retryPrompt: `I didn't catch that. Select a color from the list.`
    });

The prompt will populate the `state` object you passed in with information it needs to process the users response. You should save this off to your bots conversation state as you'll need to pass it to the prompts `continue()` method on the next turn of conversation with the user:

    const prompt = new ChoicePrompt();
    const result = await prompt.continue(context, state);
    if (!result.active) {
        const color = result.result;
    }

The `continue()` method returns a `DialogResult` object which can be used to determine when the prompt is finished and then to access the results of the prompt. To interrupt or cancel the prompt simply delete the `state` object your bot is persisting.

## Type parameters
#### C :  `TurnContext`

The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.

#### O 

(Optional) output type returned by prompt. This defaults to an instance of `FoundChoice` but can be changed by a custom validator passed to the prompt.

#### R 
#### O 
## Hierarchy


↳  [Prompt](botbuilder_dialogs.prompt.md)`C`

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


### ⊕ **new ChoicePrompt**(validator?: *`PromptValidator`.<`prompts.FoundChoice`>,.<`O`>*, defaultLocale?: *`string`*): [ChoicePrompt](botbuilder_dialogs.choiceprompt.md)


*Overrides [Prompt](botbuilder_dialogs.prompt.md).[constructor](botbuilder_dialogs.prompt.md#constructor)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:100](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L100)*



Creates a new `ChoicePrompt` instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | `PromptValidator`.<`prompts.FoundChoice`>,.<`O`>   |  (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent. |
| defaultLocale | `string`   |  (Optional) locale to use if `dc.context.activity.locale` not specified. Defaults to a value of `en-us`. |





**Returns:** [ChoicePrompt](botbuilder_dialogs.choiceprompt.md)

---


## Properties
<a id="defaultoptions"></a>

### «Protected» defaultOptions

**●  defaultOptions**:  *`O`* 

*Inherited from [Control](botbuilder_dialogs.control.md).[defaultOptions](botbuilder_dialogs.control.md#defaultoptions)*

*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/control.d.ts#L27)*





___


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`C`*, state: *`object`*, options?: *`O`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>



*Inherited from [Control](botbuilder_dialogs.control.md).[begin](botbuilder_dialogs.control.md#begin)*

*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:51](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/control.d.ts#L51)*



Starts the control. Depending on the control, its possible for the control to finish immediately so it's advised to check the result object returned by `begin()` and ensure that the control is still active before continuing.

**Usage Example:**

    const state = {};
    const result = await control.begin(context, state);
    if (!result.active) {
        const value = result.result;
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `C`   |  Context for the current turn of the conversation with the user. |
| state | `object`   |  A state object that the control will use to persist its current state. This should be an empty object which the control will populate. The bot should persist this with its other conversation state for as long as the control is still active. |
| options | `O`   |  (Optional) additional options supported by the control. |





**Returns:** `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>





___

<a id="choiceoptions"></a>

###  choiceOptions

► **choiceOptions**(options: *`prompts.ChoiceFactoryOptions`*): `this`



*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:112](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L112)*



Sets additional options passed to the `ChoiceFactory` and used to tweak the style of choices rendered to the user.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | `prompts.ChoiceFactoryOptions`   |  Additional options to set. |





**Returns:** `this`





___

<a id="continue"></a>

###  continue

► **continue**(context: *`C`*, state: *`object`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>



*Inherited from [Control](botbuilder_dialogs.control.md).[continue](botbuilder_dialogs.control.md#continue)*

*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/control.d.ts#L68)*



Passes a users reply to the control for further processing. The bot should keep calling `continue()` for future turns until the control returns a result with `Active == false`. To cancel or interrupt the prompt simply delete the `state` object being persisted.

**Usage Example:**

    const result = await control.continue(context, state);
    if (!result.active) {
        const value = result.result;
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `C`   |  Context for the current turn of the conversation with the user. |
| state | `object`   |  A state object that was previously initialized by a call to [begin()](#begin). |





**Returns:** `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>





___

<a id="dialogbegin"></a>

###  dialogBegin

► **dialogBegin**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*, options: *[PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)*): `Promise`.<`any`>



*Inherited from [Prompt](botbuilder_dialogs.prompt.md).[dialogBegin](botbuilder_dialogs.prompt.md#dialogbegin)*

*Overrides [Control](botbuilder_dialogs.control.md).[dialogBegin](botbuilder_dialogs.control.md#dialogbegin)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:38](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L38)*



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

*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:39](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L39)*



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

*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:123](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L123)*



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

► **onRecognize**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*, options: *[ChoicePromptOptions](../interfaces/botbuilder_dialogs.choicepromptoptions.md)*): `Promise`.<`O`⎮`undefined`>



*Overrides [Prompt](botbuilder_dialogs.prompt.md).[onRecognize](botbuilder_dialogs.prompt.md#onrecognize)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:124](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L124)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| options | [ChoicePromptOptions](../interfaces/botbuilder_dialogs.choicepromptoptions.md)   |  - |





**Returns:** `Promise`.<`O`⎮`undefined`>





___

<a id="recognizeroptions"></a>

###  recognizerOptions

► **recognizerOptions**(options: *`prompts.FindChoicesOptions`*): `this`



*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:117](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L117)*



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



*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:122](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L122)*



Sets the style of the choice list rendered to the user when prompting.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| listStyle | `prompts.ListStyle`   |  Type of list to render to to user. Defaults to `ListStyle.auto`. |





**Returns:** `this`





___


