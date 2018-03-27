


#  botbuilder-dialogs


## Index

### Classes

* [AttachmentPrompt](classes/botbuilder_dialogs.attachmentprompt.md)
* [ChoicePrompt](classes/botbuilder_dialogs.choiceprompt.md)
* [CompositeControl](classes/botbuilder_dialogs.compositecontrol.md)
* [ConfirmPrompt](classes/botbuilder_dialogs.confirmprompt.md)
* [Control](classes/botbuilder_dialogs.control.md)
* [DatetimePrompt](classes/botbuilder_dialogs.datetimeprompt.md)
* [DialogContext](classes/botbuilder_dialogs.dialogcontext.md)
* [DialogSet](classes/botbuilder_dialogs.dialogset.md)
* [NumberPrompt](classes/botbuilder_dialogs.numberprompt.md)
* [Prompt](classes/botbuilder_dialogs.prompt.md)
* [TextPrompt](classes/botbuilder_dialogs.textprompt.md)
* [Waterfall](classes/botbuilder_dialogs.waterfall.md)


### Interfaces

* [ChoicePromptOptions](interfaces/botbuilder_dialogs.choicepromptoptions.md)
* [Dialog](interfaces/botbuilder_dialogs.dialog.md)
* [DialogInstance](interfaces/botbuilder_dialogs.dialoginstance.md)
* [DialogResult](interfaces/botbuilder_dialogs.dialogresult.md)
* [PromptOptions](interfaces/botbuilder_dialogs.promptoptions.md)


### Type aliases

* [PromptValidator](#promptvalidator)
* [SkipStepFunction](#skipstepfunction)
* [WaterfallStep](#waterfallstep)



---
## Type aliases
<a id="promptvalidator"></a>

###  PromptValidator

**Τ PromptValidator**:  *`function`* 

*Defined in [libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts:33](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/prompts/prompt.d.ts#L33)*



Signature of a function that can be passed in to the constructor of all prompts. This function will be called every time the user replies to a prompt and can be used to add additional validation logic to a prompt or to customize the reply sent when the user send a reply that isn't recognized.
*__param__*: Type of dialog context object passed to validator.

*__param__*: Type of value that will recognized and passed to the validator as input.

*__param__*: Type of output that will be returned by the validator. This can be changed from the input type by the validator.

*__param__*: Dialog context for the current turn of conversation with the user.


#### Type declaration
►(dc: *[DialogContext](classes/botbuilder_dialogs.dialogcontext.md)`C`*, value: *`R`⎮`undefined`*): `Promiseable`.<`any`>



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](classes/botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| value | `R`⎮`undefined`   |  The value that was recognized or wasn't recognized. Depending on the prompt this can be either undefined or an empty array to indicate an unrecognized value. |





**Returns:** `Promiseable`.<`any`>






___

<a id="skipstepfunction"></a>

###  SkipStepFunction

**Τ SkipStepFunction**:  *`function`* 

*Defined in [libraries/botbuilder-dialogs/lib/waterfall.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/waterfall.d.ts#L55)*



When called, control will skip to the next waterfall step.

#### Type declaration
►(args?: *`any`*): `Promise`.<`any`>



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| args | `any`   |  (Optional) additional argument(s) to pass into the next step. |





**Returns:** `Promise`.<`any`>






___

<a id="waterfallstep"></a>

###  WaterfallStep

**Τ WaterfallStep**:  *`function`* 

*Defined in [libraries/botbuilder-dialogs/lib/waterfall.d.ts:50](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/waterfall.d.ts#L50)*



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
*__param__*: The dialog context for the current turn of conversation.


#### Type declaration
►(dc: *[DialogContext](classes/botbuilder_dialogs.dialogcontext.md)`C`*, args?: *`any`*, next?: *[SkipStepFunction](#skipstepfunction)*): `Promiseable`.<`any`>



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](classes/botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| args | `any`   |  Argument(s) passed into the dialog for the first step and then the results from calling a prompt or other dialog for subsequent steps. |
| next | [SkipStepFunction](#skipstepfunction)   |  Function passed into the step to let you manually skip to the next step in the waterfall. |





**Returns:** `Promiseable`.<`any`>






___


