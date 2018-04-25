


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
* [OAuthPrompt](classes/botbuilder_dialogs.oauthprompt.md)
* [Prompt](classes/botbuilder_dialogs.prompt.md)
* [TextPrompt](classes/botbuilder_dialogs.textprompt.md)
* [Waterfall](classes/botbuilder_dialogs.waterfall.md)


### Interfaces

* [ChoicePromptOptions](interfaces/botbuilder_dialogs.choicepromptoptions.md)
* [Dialog](interfaces/botbuilder_dialogs.dialog.md)
* [DialogInstance](interfaces/botbuilder_dialogs.dialoginstance.md)
* [DialogResult](interfaces/botbuilder_dialogs.dialogresult.md)
* [OAuthPromptSettingsWithTimeout](interfaces/botbuilder_dialogs.oauthpromptsettingswithtimeout.md)
* [PromptOptions](interfaces/botbuilder_dialogs.promptoptions.md)


### Type aliases

* [SkipStepFunction](#skipstepfunction)
* [WaterfallStep](#waterfallstep)



---
## Type aliases
<a id="skipstepfunction"></a>

###  SkipStepFunction

**Τ SkipStepFunction**:  *`function`* 

*Defined in [libraries/botbuilder-dialogs/lib/waterfall.d.ts:59](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/waterfall.d.ts#L59)*



:package: **botbuilder-dialogs**

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

*Defined in [libraries/botbuilder-dialogs/lib/waterfall.d.ts:52](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/waterfall.d.ts#L52)*



:package: **botbuilder-dialogs**

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


