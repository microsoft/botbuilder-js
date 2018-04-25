[Bot Builder SDK - Prompts](../README.md) > [TextPrompt](../interfaces/botbuilder_prompts.textprompt.md)



# Interface: TextPrompt


:package: **botbuilder-prompts**

Prompts the user to reply with some text.

**Usage Example:**

    const { createTextPrompt } = require('botbuilder-prompts');

    const agePrompt = createTextPrompt();

## Type parameters
#### O 

(Optional) type of result returned by the [recognize()](#recognize) method. This defaults to return a `string` but can be changed by the prompts custom validator.


## Methods
<a id="prompt"></a>

###  prompt

► **prompt**(context: *[TurnContext]()*, prompt: *`string`⎮[Partial]()[Activity]()*, speak?: *`undefined`⎮`string`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-prompts/lib/textPrompt.d.ts:36](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/textPrompt.d.ts#L36)*



Sends a formated prompt to the user.

**Usage Example:**

    await namePrompt.prompt(context, `What's your name?`);


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



*Defined in [libraries/botbuilder-prompts/lib/textPrompt.d.ts:54](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/textPrompt.d.ts#L54)*



Recognizes and validates the users reply. The result of the call will either be the recognized value or `undefined`.

The recognize() method will not automatically re-prompt the user so either the caller or the prompts custom validator will need to implement re-prompting logic.

**Usage Example:**

    const name = await namePrompt.recognize(context);
    if (name) {
       // Save name and continue
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext]()   |  Context for the current turn of conversation. |





**Returns:** `Promise`.<`O`⎮`undefined`>





___


