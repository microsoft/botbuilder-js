[Bot Builder SDK - Dialogs](../README.md) > [TextPrompt](../classes/botbuilder_dialogs.textprompt.md)



# Class: TextPrompt


Prompts a user to enter some text. By default the prompt will return to the calling dialog a `string` representing the users reply.

**Example usage:**

    const { DialogSet, TextPrompt } = require('botbuilder-dialogs');

    const dialogs = new DialogSet();

    dialogs.add('textPrompt', new TextPrompt());

    dialogs.add('textDemo', [
         function (dc) {
             return dc.prompt('textPrompt', `text: enter some text`);
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


↳  [Prompt](botbuilder_dialogs.prompt.md)`C`, `string`

**↳ TextPrompt**







## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`

## Index

### Constructors

* [constructor](botbuilder_dialogs.textprompt.md#constructor)


### Properties

* [defaultOptions](botbuilder_dialogs.textprompt.md#defaultoptions)


### Methods

* [begin](botbuilder_dialogs.textprompt.md#begin)
* [continue](botbuilder_dialogs.textprompt.md#continue)
* [dialogBegin](botbuilder_dialogs.textprompt.md#dialogbegin)
* [dialogContinue](botbuilder_dialogs.textprompt.md#dialogcontinue)
* [onPrompt](botbuilder_dialogs.textprompt.md#onprompt)
* [onRecognize](botbuilder_dialogs.textprompt.md#onrecognize)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new TextPrompt**(validator?: *[PromptValidator](../#promptvalidator)`C`, `string`*): [TextPrompt](botbuilder_dialogs.textprompt.md)


*Overrides [Prompt](botbuilder_dialogs.prompt.md).[constructor](botbuilder_dialogs.prompt.md#constructor)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts:36](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts#L36)*



Creates a new instance of the prompt.

**Example usage:**

    dialogs.add('titlePrompt', new TextPrompt((dc, value) => {
         if (!value || value.length < 3) {
             dc.batch.reply(`Title should be at least 3 characters long.`);
             return undefined;
         } else {
             return value.trim();
         }
    }));


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)`C`, `string`   |  (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent. |





**Returns:** [TextPrompt](botbuilder_dialogs.textprompt.md)

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

*Defined in [libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts#L55)*



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

► **onRecognize**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*, options: *[PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)*): `Promise`.<`string`⎮`undefined`>



*Overrides [Prompt](botbuilder_dialogs.prompt.md).[onRecognize](botbuilder_dialogs.prompt.md#onrecognize)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts:56](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts#L56)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| options | [PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)   |  - |





**Returns:** `Promise`.<`string`⎮`undefined`>





___


