[Bot Builder SDK - Prompts](../README.md) > [ChoicePrompt](../interfaces/botbuilder_prompts.choiceprompt.md)



# Interface: ChoicePrompt


:package: **botbuilder-prompts**

Prompts the user to select from a list of choices.

**Usage Example**

    const { createChoicePrompt } = require('botbuilder-prompts');

    const choicePrompt = createChoicePrompt();

## Type parameters
#### O 

(Optional) type of result returned by the [recognize()](#recognize) method. This defaults to an instance of `FoundChoice` but can be changed by the prompts custom validator.


## Properties
<a id="choiceoptions"></a>

###  choiceOptions

**●  choiceOptions**:  *[ChoiceFactoryOptions]()* 

*Defined in [libraries/botbuilder-prompts/lib/choicePrompt.d.ts:50](https://github.com/Microsoft/botbuilder-js/blob/e54b802/libraries/botbuilder-prompts/lib/choicePrompt.d.ts#L50)*



Additional options used to configure the output of the choice factory.




___

<a id="recognizeroptions"></a>

###  recognizerOptions

**●  recognizerOptions**:  *[FindChoicesOptions]()* 

*Defined in [libraries/botbuilder-prompts/lib/choicePrompt.d.ts:52](https://github.com/Microsoft/botbuilder-js/blob/e54b802/libraries/botbuilder-prompts/lib/choicePrompt.d.ts#L52)*



Additional options used to configure the choice recognizer.




___

<a id="style"></a>

###  style

**●  style**:  *[ListStyle](../enums/botbuilder_prompts.liststyle.md)* 

*Defined in [libraries/botbuilder-prompts/lib/choicePrompt.d.ts:48](https://github.com/Microsoft/botbuilder-js/blob/e54b802/libraries/botbuilder-prompts/lib/choicePrompt.d.ts#L48)*



Style of choices sent to user when [prompt()](#prompt) is called. Defaults to `ListStyle.auto`.




___


## Methods
<a id="prompt"></a>

###  prompt

► **prompt**(context: *[TurnContext]()*, choices: *(`string`⎮[Choice]())[]*, prompt?: *`string`⎮[Partial]()[Activity]()*, speak?: *`undefined`⎮`string`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-prompts/lib/choicePrompt.d.ts:74](https://github.com/Microsoft/botbuilder-js/blob/e54b802/libraries/botbuilder-prompts/lib/choicePrompt.d.ts#L74)*



Sends a formated prompt to the user.

By default, this will attempt to send the provided list of choices as buttons using `ChoiceFactory.forChannel()`. It may fallback to sending the choices as a text based list for any number of reasons. You can set the prompts [style](#style) property to force the use of a particular rendering style.

Further tweaks can be made to the rendering of choices using the [choiceOptions](#choiceoptions) property.

**Usage Example**

    await colorPrompt.prompt(context, ['red', 'green', 'blue'], `Pick a color.`);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext]()   |  Context for the current turn of conversation. |
| choices | (`string`⎮[Choice]())[]   |  Array of choices that should be prompted for. This may be different then the choices passed to [recognize()](#recognize). |
| prompt | `string`⎮[Partial]()[Activity]()   |  (Optional) Text or activity to send as the prompt. |
| speak | `undefined`⎮`string`   |  (Optional) SSML that should be spoken for prompt. The prompts `inputHint` will be automatically set to `expectingInput`. |





**Returns:** `Promise`.<`void`>





___

<a id="recognize"></a>

###  recognize

► **recognize**(context: *[TurnContext]()*, choices: *(`string`⎮[Choice]())[]*): `Promise`.<`O`⎮`undefined`>



*Defined in [libraries/botbuilder-prompts/lib/choicePrompt.d.ts:96](https://github.com/Microsoft/botbuilder-js/blob/e54b802/libraries/botbuilder-prompts/lib/choicePrompt.d.ts#L96)*



Recognizes and validates the users reply. The result of the call will either be the recognized value or `undefined`.

The recognize() method will not automatically re-prompt the user so either the caller or the prompts custom validator will need to implement re-prompting logic.

The search options for the underlying choice recognizer can be tweaked using the prompts [recognizerOptions](#recognizeroptions) property.

**Usage Example**

    const choice = await colorPrompt.recognize(context, ['red', 'green', 'blue']);
    if (choice) {
       const color = choice.value;
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext]()   |  Context for the current turn of conversation. |
| choices | (`string`⎮[Choice]())[]   |  Array of choices that should be recognized against. This may be different then the choices passed to [prompt()](#prompt). |





**Returns:** `Promise`.<`O`⎮`undefined`>





___


