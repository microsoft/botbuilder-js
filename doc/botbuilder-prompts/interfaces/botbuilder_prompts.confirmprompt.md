[Bot Builder SDK - Prompts](../README.md) > [ConfirmPrompt](../interfaces/botbuilder_prompts.confirmprompt.md)



# Interface: ConfirmPrompt


Prompts the user to answer a yes/no question.

## Type parameters
#### O 

## Properties
<a id="choiceoptions"></a>

###  choiceOptions

**●  choiceOptions**:  *[ChoiceFactoryOptions]()* 

*Defined in [libraries/botbuilder-prompts/lib/confirmPrompt.d.ts:39](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-prompts/lib/confirmPrompt.d.ts#L39)*



Additional options used to configure the output of the choice factory.




___

<a id="choices"></a>

###  choices

**●  choices**:  *[ConfirmChoices](botbuilder_prompts.confirmchoices.md)* 

*Defined in [libraries/botbuilder-prompts/lib/confirmPrompt.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-prompts/lib/confirmPrompt.d.ts#L32)*



Allows for the localization of the confirm prompts yes/no choices to other locales besides english. The key of each entry is the languages locale code and should be lower cased. A default fallback set of choices can be specified using a key of '*'.

**Example usage:**

    // Configure yes/no choices for english and spanish (default)
    ConfirmPrompt.choices['*'] = ['sí', 'no'];
    ConfirmPrompt.choices['es'] = ['sí', 'no'];
    ConfirmPrompt.choices['en-us'] = ['yes', 'no'];




___

<a id="style"></a>

###  style

**●  style**:  *[ListStyle](../enums/botbuilder_prompts.liststyle.md)* 

*Defined in [libraries/botbuilder-prompts/lib/confirmPrompt.d.ts:37](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-prompts/lib/confirmPrompt.d.ts#L37)*



Style of choices sent to user when [prompt()](#prompt) is called. Defaults to `ListStyle.auto`.




___


## Methods
<a id="prompt"></a>

###  prompt

► **prompt**(context: *[BotContext]()*, prompt: *`string`⎮[Partial]()[Activity]()*, speak?: *`undefined`⎮`string`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-prompts/lib/confirmPrompt.d.ts:46](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-prompts/lib/confirmPrompt.d.ts#L46)*



Sends a formated prompt to the user.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  Context for the current turn of conversation. |
| prompt | `string`⎮[Partial]()[Activity]()   |  Text or activity to send as the prompt. |
| speak | `undefined`⎮`string`   |  (Optional) SSML that should be spoken for prompt. The prompts `inputHint` will be automatically set to `expectingInput`. |





**Returns:** `Promise`.<`void`>





___

<a id="recognize"></a>

###  recognize

► **recognize**(context: *[BotContext]()*): `Promise`.<`O`⎮`undefined`>



*Defined in [libraries/botbuilder-prompts/lib/confirmPrompt.d.ts:51](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-prompts/lib/confirmPrompt.d.ts#L51)*



Recognizes and validates the users reply.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  Context for the current turn of conversation. |





**Returns:** `Promise`.<`O`⎮`undefined`>





___


