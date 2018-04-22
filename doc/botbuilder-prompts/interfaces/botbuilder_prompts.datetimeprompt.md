[Bot Builder SDK - Prompts](../README.md) > [DatetimePrompt](../interfaces/botbuilder_prompts.datetimeprompt.md)



# Interface: DatetimePrompt


:package: **botbuilder-prompts**

Prompts the user to reply with a date and/or time. The user can use natural language utterances like "tomorrow at 9am".

**Usage Example**

    const { createDatetimePrompt } = require('botbuilder-prompts');

    const timePrompt = createDatetimePrompt();

## Type parameters
#### O 

(Optional) type of result returned by the [recognize()](#recognize) method. This defaults to an instance of `FoundDateTime[]` but can be changed by the prompts custom validator.


## Methods
<a id="prompt"></a>

###  prompt

► **prompt**(context: *[TurnContext]()*, prompt: *`string`⎮[Partial]()[Activity]()*, speak?: *`undefined`⎮`string`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-prompts/lib/datetimePrompt.d.ts:60](https://github.com/Microsoft/botbuilder-js/blob/e54b802/libraries/botbuilder-prompts/lib/datetimePrompt.d.ts#L60)*



Sends a formated prompt to the user.

**Usage Example**

    await timePrompt.prompt(context, `What time should I set your alarm for?`);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext]()   |  Context for the current turn of conversation. |
| prompt | `string`⎮[Partial]()[Activity]()   |  Text or activity to send as the prompt. |
| speak | `undefined`⎮`string`   |  (Optional) SSML that should be spoken for prompt. The prompts `inputHint` will be automatically set to `expectingInput`. |





**Returns:** `Promise`.<`void`>





___

<a id="recognize"></a>

###  recognize

► **recognize**(context: *[TurnContext]()*): `Promise`.<`O`⎮`undefined`>



*Defined in [libraries/botbuilder-prompts/lib/datetimePrompt.d.ts:85](https://github.com/Microsoft/botbuilder-js/blob/e54b802/libraries/botbuilder-prompts/lib/datetimePrompt.d.ts#L85)*



Recognizes and validates the users reply. The result of the call will either be the recognized value or `undefined`.

The recognize() method will not automatically re-prompt the user so either the caller or the prompts custom validator will need to implement re-prompting logic.

**Usage Example**

    const values = await timePrompt.recognize(context);
    if (values && values.length > 0) {
       const time = values[0];
       switch (time.type) {
          case 'date':
          case 'time':
          case 'datetime':
             const date = new Date(time.value);
             break;
       }
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext]()   |  Context for the current turn of conversation. |





**Returns:** `Promise`.<`O`⎮`undefined`>





___


