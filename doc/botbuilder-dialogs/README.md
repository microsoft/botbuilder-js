


#  botbuilder-dialogs


## Index

### Enumerations

* [ListStyle](enums/botbuilder_dialogs.liststyle.md)


### Classes

* [AttachmentPrompt](classes/botbuilder_dialogs.attachmentprompt.md)
* [ChoicePrompt](classes/botbuilder_dialogs.choiceprompt.md)
* [ConfirmPrompt](classes/botbuilder_dialogs.confirmprompt.md)
* [DatetimePrompt](classes/botbuilder_dialogs.datetimeprompt.md)
* [DialogSet](classes/botbuilder_dialogs.dialogset.md)
* [NumberPrompt](classes/botbuilder_dialogs.numberprompt.md)
* [TextPrompt](classes/botbuilder_dialogs.textprompt.md)
* [Waterfall](classes/botbuilder_dialogs.waterfall.md)


### Interfaces

* [ChoicePromptOptions](interfaces/botbuilder_dialogs.choicepromptoptions.md)
* [ConfirmChoices](interfaces/botbuilder_dialogs.confirmchoices.md)
* [ConfirmPromptOptions](interfaces/botbuilder_dialogs.confirmpromptoptions.md)
* [Dialog](interfaces/botbuilder_dialogs.dialog.md)
* [DialogInstance](interfaces/botbuilder_dialogs.dialoginstance.md)
* [FoundDatetime](interfaces/botbuilder_dialogs.founddatetime.md)
* [PromptOptions](interfaces/botbuilder_dialogs.promptoptions.md)


### Type aliases

* [DynamicChoicesProvider](#dynamicchoicesprovider)
* [PromptValidator](#promptvalidator)
* [SkipStepFunction](#skipstepfunction)
* [WaterfallStep](#waterfallstep)


### Functions

* [formatChoicePrompt](#formatchoiceprompt)
* [formatPrompt](#formatprompt)



---
## Type aliases
<a id="dynamicchoicesprovider"></a>

###  DynamicChoicesProvider

**Τ DynamicChoicesProvider**:  *`function`* 

*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/dfb4aa4/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L31)*


#### Type declaration
►(context: *`BotContext`*, recognizePhase: *`boolean`*, dialogs: *[DialogSet](classes/botbuilder_dialogs.dialogset.md)*): [Promiseable]()(`string`⎮[Choice]())[]



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| recognizePhase | `boolean`   |  - |
| dialogs | [DialogSet](classes/botbuilder_dialogs.dialogset.md)   |  - |





**Returns:** [Promiseable]()(`string`⎮[Choice]())[]






___

<a id="promptvalidator"></a>

###  PromptValidator

**Τ PromptValidator**:  *`function`* 

*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:20](https://github.com/Microsoft/botbuilder-js/blob/dfb4aa4/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L20)*


#### Type declaration
►(context: *`BotContext`*, value: *`T`*, dialogs: *[DialogSet](classes/botbuilder_dialogs.dialogset.md)*): [Promiseable]()`void`



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| value | `T`   |  - |
| dialogs | [DialogSet](classes/botbuilder_dialogs.dialogset.md)   |  - |





**Returns:** [Promiseable]()`void`






___

<a id="skipstepfunction"></a>

###  SkipStepFunction

**Τ SkipStepFunction**:  *`function`* 

*Defined in [libraries/botbuilder-dialogs/lib/waterfall.d.ts:22](https://github.com/Microsoft/botbuilder-js/blob/dfb4aa4/libraries/botbuilder-dialogs/lib/waterfall.d.ts#L22)*



When called, control will skip to the next waterfall step.

#### Type declaration
►(args?: *`any`*): `Promise`.<`void`>



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| args | `any`   |  (Optional) additional argument(s) to pass into the next step. |





**Returns:** `Promise`.<`void`>






___

<a id="waterfallstep"></a>

###  WaterfallStep

**Τ WaterfallStep**:  *`function`* 

*Defined in [libraries/botbuilder-dialogs/lib/waterfall.d.ts:17](https://github.com/Microsoft/botbuilder-js/blob/dfb4aa4/libraries/botbuilder-dialogs/lib/waterfall.d.ts#L17)*



Function signature of a waterfall step.

#### Type declaration
►(context: *`BotContext`*, args?: *`any`*, next?: *[SkipStepFunction](#skipstepfunction)*): [Promiseable]()`void`



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  The dialog context for the current turn of conversation. |
| args | `any`   |  Argument(s) passed into the dialog for the first step and then the results from calling a prompt or other dialog for subsequent steps. |
| next | [SkipStepFunction](#skipstepfunction)   |  Function passed into the step to let you manually skip to the next step in the waterfall. |





**Returns:** [Promiseable]()`void`






___


## Functions
<a id="formatchoiceprompt"></a>

###  formatChoicePrompt

► **formatChoicePrompt**(channelOrContext: *`string`⎮`BotContext`*, choices: *(`string`⎮[Choice]())[]*, text?: *`undefined`⎮`string`*, speak?: *`undefined`⎮`string`*, options?: *[ChoiceStylerOptions]()*, style?: *[ListStyle](enums/botbuilder_dialogs.liststyle.md)*): [Partial]()[Activity]()



*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:42](https://github.com/Microsoft/botbuilder-js/blob/dfb4aa4/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L42)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| channelOrContext | `string`⎮`BotContext`   |  - |
| choices | (`string`⎮[Choice]())[]   |  - |
| text | `undefined`⎮`string`   |  - |
| speak | `undefined`⎮`string`   |  - |
| options | [ChoiceStylerOptions]()   |  - |
| style | [ListStyle](enums/botbuilder_dialogs.liststyle.md)   |  - |





**Returns:** [Partial]()[Activity]()





___

<a id="formatprompt"></a>

###  formatPrompt

► **formatPrompt**(prompt: *`string`⎮[Partial]()[Activity]()*, speak?: *`undefined`⎮`string`*): [Partial]()[Activity]()



*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/dfb4aa4/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L21)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| prompt | `string`⎮[Partial]()[Activity]()   |  - |
| speak | `undefined`⎮`string`   |  - |





**Returns:** [Partial]()[Activity]()





___


