[Bot Builder SDK - Dialogs](../README.md) > [ChoicePromptOptions](../interfaces/botbuilder_dialogs.choicepromptoptions.md)



# Interface: ChoicePromptOptions


Additional options that can be used to configure a `ChoicePrompt`.

## Hierarchy


 [PromptOptions](botbuilder_dialogs.promptoptions.md)

**↳ ChoicePromptOptions**








## Properties
<a id="choices"></a>

### «Optional» choices

**●  choices**:  *(`string`⎮[Choice]())[]* 

*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/9f80f0a/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L32)*



List of choices to recognize.




___

<a id="prompt"></a>

### «Optional» prompt

**●  prompt**:  *`string`⎮[Partial]()[Activity]()* 

*Inherited from [PromptOptions](botbuilder_dialogs.promptoptions.md).[prompt](botbuilder_dialogs.promptoptions.md#prompt)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:13](https://github.com/Microsoft/botbuilder-js/blob/9f80f0a/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L13)*



(Optional) Initial prompt to send the user.




___

<a id="retryprompt"></a>

### «Optional» retryPrompt

**●  retryPrompt**:  *`string`⎮[Partial]()[Activity]()* 

*Inherited from [PromptOptions](botbuilder_dialogs.promptoptions.md).[retryPrompt](botbuilder_dialogs.promptoptions.md#retryprompt)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:17](https://github.com/Microsoft/botbuilder-js/blob/9f80f0a/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L17)*



(Optional) Retry prompt to send the user.




___

<a id="retryspeak"></a>

### «Optional» retrySpeak

**●  retrySpeak**:  *`undefined`⎮`string`* 

*Inherited from [PromptOptions](botbuilder_dialogs.promptoptions.md).[retrySpeak](botbuilder_dialogs.promptoptions.md#retryspeak)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/9f80f0a/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L19)*



(Optional) Retry SSML to send the user.




___

<a id="speak"></a>

### «Optional» speak

**●  speak**:  *`undefined`⎮`string`* 

*Inherited from [PromptOptions](botbuilder_dialogs.promptoptions.md).[speak](botbuilder_dialogs.promptoptions.md#speak)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/9f80f0a/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L15)*



(Optional) Initial SSML to send the user.




___

<a id="style"></a>

### «Optional» style

**●  style**:  *[ListStyle](../enums/botbuilder_dialogs.liststyle.md)* 

*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:34](https://github.com/Microsoft/botbuilder-js/blob/9f80f0a/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L34)*



Preferred style of the choices sent to the user. The default value is `ListStyle.auto`.




___


