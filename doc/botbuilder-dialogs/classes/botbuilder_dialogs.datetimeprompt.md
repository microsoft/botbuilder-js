[Bot Builder SDK - Dialogs](../README.md) > [DatetimePrompt](../classes/botbuilder_dialogs.datetimeprompt.md)



# Class: DatetimePrompt


Prompts a user to enter a datetime expression. By default the prompt will return to the calling dialog a `FoundDatetime[]` but this can be overridden using a custom `PromptValidator`.

**Example usage:**

    const { DialogSet, DatetimePrompt } = require('botbuilder-dialogs');

    const dialogs = new DialogSet();

    dialogs.add('datetimePrompt', new DatetimePrompt());

    dialogs.add('datetimeDemo', [
         function (dc) {
             return dc.prompt('datetimePrompt', `datetime: enter a datetime`);
         },
         function (dc, values) {
             dc.batch.reply(`Recognized values: ${JSON.stringify(values)}`);
             return dc.end();
         }
    ]);

## Type parameters
#### C :  `BotContext`
#### O 
#### C :  `BotContext`
## Hierarchy


↳  [Prompt](botbuilder_dialogs.prompt.md)`C`, `prompts.FoundDatetime`[]

**↳ DatetimePrompt**







## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`

## Index

### Constructors

* [constructor](botbuilder_dialogs.datetimeprompt.md#constructor)


### Properties

* [defaultOptions](botbuilder_dialogs.datetimeprompt.md#defaultoptions)


### Methods

* [begin](botbuilder_dialogs.datetimeprompt.md#begin)
* [continue](botbuilder_dialogs.datetimeprompt.md#continue)
* [dialogBegin](botbuilder_dialogs.datetimeprompt.md#dialogbegin)
* [dialogContinue](botbuilder_dialogs.datetimeprompt.md#dialogcontinue)
* [onPrompt](botbuilder_dialogs.datetimeprompt.md#onprompt)
* [onRecognize](botbuilder_dialogs.datetimeprompt.md#onrecognize)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new DatetimePrompt**(validator?: *[PromptValidator](../#promptvalidator)`C`, `prompts.FoundDatetime`[]*, defaultLocale?: *`string`*): [DatetimePrompt](botbuilder_dialogs.datetimeprompt.md)


*Overrides [Prompt](botbuilder_dialogs.prompt.md).[constructor](botbuilder_dialogs.prompt.md#constructor)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts:37](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts#L37)*



Creates a new instance of the prompt.

**Example usage:**

    dialogs.add('timePrompt', new DatetimePrompt((dc, values) => {
         try {
             if (!Array.isArray(values) || values.length < 0) { throw new Error('missing time') }
             if (values[0].type !== 'datetime') { throw new Error('unsupported type') }
             const value = new Date(values[0].value);
             if (value.getTime() < new Date().getTime()) { throw new Error('in the past') }
             return value;
         } catch (err) {
             dc.batch.reply(`Invalid time. Answer with a time in the future like "tomorrow at 9am" or say "cancel".`);
             return undefined;
         }
    }));


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)`C`, `prompts.FoundDatetime`[]   |  (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent. |
| defaultLocale | `string`   |  (Optional) locale to use if `dc.context.request.locale` not specified. Defaults to a value of `en-us`. |





**Returns:** [DatetimePrompt](botbuilder_dialogs.datetimeprompt.md)

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

*Defined in [libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts:61](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts#L61)*



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

► **onRecognize**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*, options: *[PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)*): `Promise`.<`prompts.FoundDatetime`[]⎮`undefined`>



*Overrides [Prompt](botbuilder_dialogs.prompt.md).[onRecognize](botbuilder_dialogs.prompt.md#onrecognize)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts:62](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts#L62)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| options | [PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)   |  - |





**Returns:** `Promise`.<`prompts.FoundDatetime`[]⎮`undefined`>





___


