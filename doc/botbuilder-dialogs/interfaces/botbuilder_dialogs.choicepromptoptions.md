[Bot Builder SDK - Dialogs](../README.md) > [ChoicePromptOptions](../interfaces/botbuilder_dialogs.choicepromptoptions.md)



# Interface: ChoicePromptOptions


:package: **botbuilder-dialogs**

Additional options that can be used to configure a `ChoicePrompt`.

## Hierarchy


 [PromptOptions](botbuilder_dialogs.promptoptions.md)

**↳ ChoicePromptOptions**








## Properties
<a id="choices"></a>

### «Optional» choices

**●  choices**:  *`any`[]* 

*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:20](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L20)*



List of choices to recognize.




___

<a id="prompt"></a>

### «Optional» prompt

**●  prompt**:  *`string`⎮`Partial`.<`Activity`>* 

*Inherited from [PromptOptions](botbuilder_dialogs.promptoptions.md).[prompt](botbuilder_dialogs.promptoptions.md#prompt)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L19)*



(Optional) Initial prompt to send the user.




___

<a id="retryprompt"></a>

### «Optional» retryPrompt

**●  retryPrompt**:  *`string`⎮`Partial`.<`Activity`>* 

*Inherited from [PromptOptions](botbuilder_dialogs.promptoptions.md).[retryPrompt](botbuilder_dialogs.promptoptions.md#retryprompt)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:23](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L23)*



(Optional) Retry prompt to send the user.




___

<a id="retryspeak"></a>

### «Optional» retrySpeak

**●  retrySpeak**:  *`string`* 

*Inherited from [PromptOptions](botbuilder_dialogs.promptoptions.md).[retrySpeak](botbuilder_dialogs.promptoptions.md#retryspeak)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:25](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L25)*



(Optional) Retry SSML to send the user.




___

<a id="speak"></a>

### «Optional» speak

**●  speak**:  *`string`* 

*Inherited from [PromptOptions](botbuilder_dialogs.promptoptions.md).[speak](botbuilder_dialogs.promptoptions.md#speak)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L21)*



(Optional) Initial SSML to send the user.




___


