[Bot Builder SDK - Dialogs](../README.md) > [DatetimePrompt](../classes/botbuilder_dialogs.datetimeprompt.md)



# Class: DatetimePrompt


Prompts a user to enter a datetime expression. By default the prompt will return to the calling dialog a `FoundDatetime[]` but this can be overridden using a custom `PromptValidator`.

**Example usage:**

    const { DialogSet, DatetimePrompt } = require('botbuilder-dialogs');

    const dialogs = new DialogSet();

    dialogs.add('datetimePrompt', new DatetimePrompt());

    dialogs.add('datetimeDemo', [
         function (context) {
             return dialogs.prompt(context, 'datetimePrompt', `datetime: enter a datetime`);
         },
         function (context, values) {
             context.reply(`Recognized values: ${JSON.stringify(values)}`);
             return dialogs.end(context);
         }
    ]);

## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)

## Index

### Constructors

* [constructor](botbuilder_dialogs.datetimeprompt.md#constructor)


### Methods

* [begin](botbuilder_dialogs.datetimeprompt.md#begin)
* [continue](botbuilder_dialogs.datetimeprompt.md#continue)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new DatetimePrompt**(validator?: *[PromptValidator](../#promptvalidator)[FoundDatetime](../interfaces/botbuilder_dialogs.founddatetime.md)[]⎮`undefined`*): [DatetimePrompt](botbuilder_dialogs.datetimeprompt.md)


*Defined in [libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts:57](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts#L57)*



Creates a new instance of the prompt.

**Example usage:**

    dialogs.add('timePrompt', new DatetimePrompt((context, values) => {
         try {
             if (values.length < 0) { throw new Error('missing time') }
             if (values[0].type !== 'datetime') { throw new Error('unsupported type') }
             const value = new Date(values[0].value);
             if (value.getTime() < new Date().getTime()) { throw new Error('in the past') }
             return dialogs.end(context, value);
         } catch (err) {
             context.reply(`Please enter a valid time in the future like "tomorrow at 9am" or say "cancel".`);
             return Promise.resolve();
         }
    }));


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)[FoundDatetime](../interfaces/botbuilder_dialogs.founddatetime.md)[]⎮`undefined`   |  (Optional) validator that will be called each time the user responds to the prompt. |





**Returns:** [DatetimePrompt](botbuilder_dialogs.datetimeprompt.md)

---


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *[BotContext]()*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, options: *[PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts:80](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts#L80)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |
| options | [PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="continue"></a>

###  continue

► **continue**(context: *[BotContext]()*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*): `Promise`.<`void`>



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[continue](../interfaces/botbuilder_dialogs.dialog.md#continue)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts:81](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts#L81)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |





**Returns:** `Promise`.<`void`>





___


