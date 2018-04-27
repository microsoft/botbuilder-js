[Bot Builder SDK - Prompts](../README.md) > [ConfirmPrompt](../interfaces/botbuilder_prompts.confirmprompt.md)



# Interface: ConfirmPrompt


:package: **botbuilder-prompts**

Prompts the user to answer a yes/no question.

The [prompt()](#prompt) method will attempt to send a set of buttons yes/no buttons for the user to click. By default, the text of the titles for these buttons will always be in English but you can easily add support for other languages using the prompts [choices](#choices) property.

**Usage Example:**

    const { createConfirmPrompt } = require('botbuilder-prompts');

    const confirmPrompt = createConfirmPrompt();

## Type parameters
#### O 

(Optional) type of result returned by the [recognize()](#recognize) method. This defaults to a boolean `true` or `false` but can be changed by the prompts custom validator.


## Properties
<a id="choiceoptions"></a>

###  choiceOptions

**●  choiceOptions**:  *[ChoiceFactoryOptions]()* 

*Defined in [libraries/botbuilder-prompts/lib/confirmPrompt.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/confirmPrompt.d.ts#L68)*



Additional options used to configure the output of the `ChoiceFactory`. Defaults to `{ includeNumbers: false }`.




___

<a id="choices"></a>

###  choices

**●  choices**:  *[ConfirmChoices](botbuilder_prompts.confirmchoices.md)* 

*Defined in [libraries/botbuilder-prompts/lib/confirmPrompt.d.ts:58](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/confirmPrompt.d.ts#L58)*



Allows for the localization of the confirm prompts yes/no choices to other locales besides english. The key of each entry is the languages locale code and should be lower cased. A default fallback set of choices can be specified using a key of '*'.

The default choices are configured to be `{ '*': ['yes', 'no'] }`.

**Example usage:**

    const confirmPrompt = createConfirmPrompt();

    // Configure yes/no choices for english and spanish (default)
    confirmPrompt.choices['*'] = ['sí', 'no'];
    confirmPrompt.choices['es'] = ['sí', 'no'];
    confirmPrompt.choices['en-us'] = ['yes', 'no'];




___

<a id="style"></a>

###  style

**●  style**:  *[ListStyle](../enums/botbuilder_prompts.liststyle.md)* 

*Defined in [libraries/botbuilder-prompts/lib/confirmPrompt.d.ts:63](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/confirmPrompt.d.ts#L63)*



Style of choices sent to user when [prompt()](#prompt) is called. Defaults to `ListStyle.auto`.




___


## Methods
<a id="prompt"></a>

###  prompt

► **prompt**(context: *[TurnContext]()*, prompt: *`string`⎮[Partial]()[Activity]()*, speak?: *`undefined`⎮`string`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-prompts/lib/confirmPrompt.d.ts:89](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/confirmPrompt.d.ts#L89)*



Sends a formated prompt to the user.

By default, this will attempt to send the user yes & no choices as buttons using `ChoiceFactory.forChannel()`. If the channel doesn't support buttons it will fallback to appending `(yes or no)` to the prompt. You can override this behavior using the prompts [style](#style) property.

Further tweaks can be made to the rendering of the yes/no choices using the [choiceOptions](#choiceoptions) property.

**Usage Example:**

    await confirmPrompt.prompt(context, `This will cancel your order. Are you sure?`);


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



*Defined in [libraries/botbuilder-prompts/lib/confirmPrompt.d.ts:111](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/confirmPrompt.d.ts#L111)*



Recognizes and validates the users reply. The result of the call will either be the recognized value or `undefined`.

The recognize() method will not automatically re-prompt the user so either the caller or the prompts custom validator will need to implement re-prompting logic.

**Usage Example:**

    const confirmed = await confirmPrompt.recognize(context);
    if (typeof confirmed == 'boolean') {
       if (confirmed) {
          // User said yes
       } else {
          // User said no
       }
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext]()   |  Context for the current turn of conversation. |





**Returns:** `Promise`.<`O`⎮`undefined`>





___


