[Bot Builder SDK - Prompts](../README.md) > [NumberPrompt](../interfaces/botbuilder_prompts.numberprompt.md)



# Interface: NumberPrompt


:package: **botbuilder-prompts**

Prompts the user to reply with a number.

**Usage Example:**

    const { createNumberPrompt } = require('botbuilder-prompts');

    const agePrompt = createNumberPrompt();

## Type parameters
#### O 

(Optional) type of result returned by the [recognize()](#recognize) method. This defaults to `number` but can be changed by the prompts custom validator.


## Methods
<a id="prompt"></a>

###  prompt

► **prompt**(context: *[TurnContext]()*, prompt: *`string`⎮[Partial]()[Activity]()*, speak?: *`undefined`⎮`string`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-prompts/lib/numberPrompt.d.ts:37](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/numberPrompt.d.ts#L37)*



Sends a formated prompt to the user.

**Usage Example:**

    await agePrompt.prompt(context, `How old are you?`);


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



*Defined in [libraries/botbuilder-prompts/lib/numberPrompt.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/numberPrompt.d.ts#L55)*



Recognizes and validates the users reply. The result of the call will either be the recognized value or `undefined`.

The recognize() method will not automatically re-prompt the user so either the caller or the prompts custom validator will need to implement re-prompting logic.

**Usage Example:**

    const age = await agePrompt.recognize(context);
    if (typeof age == 'number') {
       // Save age and continue
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext]()   |  Context for the current turn of conversation. |





**Returns:** `Promise`.<`O`⎮`undefined`>





___


