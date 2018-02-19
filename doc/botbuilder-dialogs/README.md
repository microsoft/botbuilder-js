


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

*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:43](https://github.com/Microsoft/botbuilder-js/blob/4638a56/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L43)*



Signature for handler passed to a `ChoicePrompt` that will dynamically calculate the prompts choices.

#### Type declaration
►(context: *`BotContext`*, recognizePhase: *`boolean`*, dialogs: *[DialogSet](classes/botbuilder_dialogs.dialogset.md)*): [Promiseable]()(`string`⎮[Choice]())[]



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  Context object for the current turn of conversation with the user. |
| recognizePhase | `boolean`   |  If `true` the handler is being called to get a list of choices that will be recognized. If `false` then a prompt or retryPrompt is being rendered. |
| dialogs | [DialogSet](classes/botbuilder_dialogs.dialogset.md)   |  The parent dialog set. |





**Returns:** [Promiseable]()(`string`⎮[Choice]())[]






___

<a id="promptvalidator"></a>

###  PromptValidator

**Τ PromptValidator**:  *`function`* 

*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/4638a56/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L31)*



Signature of a function that can be passed in to the constructor of all prompts. This function will be called every time the user replies to a prompt and can be used to add additional validation logic to a prompt or to customize the reply sent when the user send a reply that isn't recognized.
*__param__*: Possible types for `value` arg.


#### Type declaration
►(context: *`BotContext`*, value: *`T`*, dialogs: *[DialogSet](classes/botbuilder_dialogs.dialogset.md)*): [Promiseable]()`void`



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  Context object for the current turn of conversation with the user. |
| value | `T`   |  The value that was recognized or wasn't recognized. Depending on the prompt this can be either undefined or an empty array to indicate an unrecognized value. |
| dialogs | [DialogSet](classes/botbuilder_dialogs.dialogset.md)   |  The parent dialog set. |





**Returns:** [Promiseable]()`void`






___

<a id="skipstepfunction"></a>

###  SkipStepFunction

**Τ SkipStepFunction**:  *`function`* 

*Defined in [libraries/botbuilder-dialogs/lib/waterfall.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/4638a56/libraries/botbuilder-dialogs/lib/waterfall.d.ts#L55)*



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

*Defined in [libraries/botbuilder-dialogs/lib/waterfall.d.ts:50](https://github.com/Microsoft/botbuilder-js/blob/4638a56/libraries/botbuilder-dialogs/lib/waterfall.d.ts#L50)*



Function signature of a waterfall step.

**Example usage:**

    dialogs.add('addAlarm', [
         function (context, alarm, next) {
             dialogs.getInstance(context).state = Object.assign({}, alarm);
             if (!alarm.title) {
                 return dialogs.prompt(context, 'titlePrompt', `What would you like to call your alarm?`);
             } else {
                 return next(alarm.title);
             }
         },
         function (context, title, next) {
             const alarm = dialogs.getInstance(context).state;
             alarm.title = title;
             if (!alarm.time) {
                 return dialogs.prompt(context, 'timePrompt', `What time would you like to set it for?`);
             } else {
                 return next(alarm.time);
             }
         },
         function (context, time) {
             const alarm = dialogs.getInstance(context).state;
             alarm.time = time;

             // ... set alarm ...

             context.reply(`Alarm set.`);
             return dialogs.end(context);
         }
    ]);

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



*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:119](https://github.com/Microsoft/botbuilder-js/blob/4638a56/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L119)*



Helper function to format a choice prompt for a given `ListStyle`. An activity will be returned that can then be sent to the user.

**Example usage:**

    const { formatChoicePrompt } = require('botbuilder-dialogs');

    context.reply(formatChoicePrompt(context, ['red', 'green', 'blue'], `Select a color`));


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| channelOrContext | `string`⎮`BotContext`   |  Context for the current turn of conversation with the user or the ID of a channel. This is used when `style == ListStyle.auto`. |
| choices | (`string`⎮[Choice]())[]   |  Array of choices being prompted for. |
| text | `undefined`⎮`string`   |  (Optional) prompt text to show the user along with the options. |
| speak | `undefined`⎮`string`   |  (Optional) SSML to speak to the user on channels like Cortana. The messages `inputHint` will be automatically set to `InputHints.expectingInput`. |
| options | [ChoiceStylerOptions]()   |  (Optional) additional choice styler options used to customize the rendering of the prompts choice list. |
| style | [ListStyle](enums/botbuilder_dialogs.liststyle.md)   |  (Optional) list style to use when rendering prompt. Defaults to `ListStyle.auto`. |





**Returns:** [Partial]()[Activity]()





___

<a id="formatprompt"></a>

###  formatPrompt

► **formatPrompt**(prompt: *`string`⎮[Partial]()[Activity]()*, speak?: *`undefined`⎮`string`*): [Partial]()[Activity]()



*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:45](https://github.com/Microsoft/botbuilder-js/blob/4638a56/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L45)*



Helper function to properly format a prompt sent to a user.

**Example usage:**

    const { formatPrompt } = require('botbuilder-dialogs');

    context.reply(formatPrompt(`Hi... What's your name?`, `What is your name?`));


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| prompt | `string`⎮[Partial]()[Activity]()   |  Activity or text to prompt the user with. If prompt is a `string` then an activity of type `message` will be created. |
| speak | `undefined`⎮`string`   |  (Optional) SSML to speak to the user on channels like Cortana. The messages `inputHint` will be automatically set to `InputHints.expectingInput`. |





**Returns:** [Partial]()[Activity]()





___


