[Bot Builder SDK - Prompts](../README.md) > [ChoicePrompt](../interfaces/botbuilder_prompts.choiceprompt.md)



# Interface: ChoicePrompt


Prompts the user to select from a list of choices.

## Type parameters
#### O 

## Properties
<a id="choiceoptions"></a>

###  choiceOptions

**●  choiceOptions**:  *[ChoiceFactoryOptions]()* 

*Defined in [libraries/botbuilder-prompts/lib/choicePrompt.d.ts:34](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-prompts/lib/choicePrompt.d.ts#L34)*



Additional options used to configure the output of the choice factory.




___

<a id="recognizeroptions"></a>

###  recognizerOptions

**●  recognizerOptions**:  *[FindChoicesOptions]()* 

*Defined in [libraries/botbuilder-prompts/lib/choicePrompt.d.ts:36](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-prompts/lib/choicePrompt.d.ts#L36)*



Additional options used to configure the choice recognizer.




___

<a id="style"></a>

###  style

**●  style**:  *[ListStyle](../enums/botbuilder_prompts.liststyle.md)* 

*Defined in [libraries/botbuilder-prompts/lib/choicePrompt.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-prompts/lib/choicePrompt.d.ts#L32)*



Style of choices sent to user when [prompt()](#prompt) is called. Defaults to `ListStyle.auto`.




___


## Methods
<a id="prompt"></a>

###  prompt

► **prompt**(context: *[BotContext]()*, choices: *(`string`⎮[Choice]())[]*, prompt?: *`string`⎮[Partial]()[Activity]()*, speak?: *`undefined`⎮`string`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-prompts/lib/choicePrompt.d.ts:44](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-prompts/lib/choicePrompt.d.ts#L44)*



Sends a formated prompt to the user.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  Context for the current turn of conversation. |
| choices | (`string`⎮[Choice]())[]   |  Array of choices that should be prompted for. |
| prompt | `string`⎮[Partial]()[Activity]()   |  (Optional) Text or activity to send as the prompt. |
| speak | `undefined`⎮`string`   |  (Optional) SSML that should be spoken for prompt. The prompts `inputHint` will be automatically set to `expectingInput`. |





**Returns:** `Promise`.<`void`>





___

<a id="recognize"></a>

###  recognize

► **recognize**(context: *[BotContext]()*, choices: *(`string`⎮[Choice]())[]*): `Promise`.<`O`⎮`undefined`>



*Defined in [libraries/botbuilder-prompts/lib/choicePrompt.d.ts:50](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-prompts/lib/choicePrompt.d.ts#L50)*



Recognizes and validates the users reply.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  Context for the current turn of conversation. |
| choices | (`string`⎮[Choice]())[]   |  Array of choices that should be recognized against. |





**Returns:** `Promise`.<`O`⎮`undefined`>





___


