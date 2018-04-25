[Bot Builder SDK - Dialogs](../README.md) > [Waterfall](../classes/botbuilder_dialogs.waterfall.md)



# Class: Waterfall


:package: **botbuilder-dialogs**

Dialog optimized for prompting a user with a series of questions. Waterfalls accept a stack of functions which will be executed in sequence. Each waterfall step can ask a question of the user and the users response will be passed as an argument to the next waterfall step.

For simple text questions you can send the user a message and then process their answer in the next step:

     dialogs.add('namePrompt', [
         async function (dc) {
             dc.instance.state = { first: '', last: '', full: '' };
             await dc.context.sendActivity(`What's your first name?`);
         },
         async function (dc, firstName) {
             dc.instance.state.first = firstName;
             await dc.context.sendActivity(`Great ${firstName}! What's your last name?`);
         },
         async function (dc, lastName) {
             const name = dc.instance.state;
             name.last = lastName;
             name.full = name.first + ' ' + name.last;
             await dc.end(name);
         }
     ]);

For more complex sequences you can call other dialogs from within a step and the result returned by the dialog will be passed to the next step:

     dialogs.add('survey', [
         async function (dc) {
             dc.instance.state = { name: undefined, languages: '', years: 0 };
             await dc.begin('namePrompt');
         },
         async function (dc, name) {
             dc.instance.state.name = name;
             await dc.context.sendActivity(`Ok ${name.full}... What programming languages do you know?`);
         },
         async function (dc, languages) {
             dc.instance.state.languages = languages;
             await dc.prompt('yearsPrompt', `Great. So how many years have you been programming?`);
         },
         async function (dc, years) {
             dc.instance.state.years = years;
             await dc.context.sendActivity(`Thank you for taking our survey.`);
             await dc.end(dc.instance.state);
         }
     ]);

     dialogs.add('yearsPrompt', new NumberPrompt(async (dc, value) => {
         if (value === undefined || value < 0 || value > 110) {
             await dc.context.sendActivity(`Enter a number from 0 to 110.`);
         } else {
             return value;
         }
     }));

The example builds on the previous `namePrompt` sample and shows how you can call another dialog which will ask its own sequence of questions. The dialogs library provides a built-in set of prompt classes which can be used to recognize things like dates and numbers in the users response.

You should generally call `dc.end()` or `dc.replace()` from your last waterfall step but if you fail to do that the dialog will be automatically ended for you on the users next reply. The users response will be passed to the calling dialogs next waterfall step if there is one.

## Type parameters
#### C :  `TurnContext`
## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`

## Index

### Constructors

* [constructor](botbuilder_dialogs.waterfall.md#constructor)


### Methods

* [dialogBegin](botbuilder_dialogs.waterfall.md#dialogbegin)
* [dialogContinue](botbuilder_dialogs.waterfall.md#dialogcontinue)
* [dialogResume](botbuilder_dialogs.waterfall.md#dialogresume)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new Waterfall**(steps: *[WaterfallStep](../#waterfallstep)`C`[]*): [Waterfall](botbuilder_dialogs.waterfall.md)


*Defined in [libraries/botbuilder-dialogs/lib/waterfall.d.ts:131](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/waterfall.d.ts#L131)*



Creates a new waterfall dialog containing the given array of steps.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| steps | [WaterfallStep](../#waterfallstep)`C`[]   |  Array of waterfall steps. |





**Returns:** [Waterfall](botbuilder_dialogs.waterfall.md)

---


## Methods
<a id="dialogbegin"></a>

###  dialogBegin

► **dialogBegin**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*, args?: *`any`*): `Promiseable`.<`any`>



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[dialogBegin](../interfaces/botbuilder_dialogs.dialog.md#dialogbegin)*

*Defined in [libraries/botbuilder-dialogs/lib/waterfall.d.ts:137](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/waterfall.d.ts#L137)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| args | `any`   |  - |





**Returns:** `Promiseable`.<`any`>





___

<a id="dialogcontinue"></a>

###  dialogContinue

► **dialogContinue**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*): `Promise`.<`any`>



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[dialogContinue](../interfaces/botbuilder_dialogs.dialog.md#dialogcontinue)*

*Defined in [libraries/botbuilder-dialogs/lib/waterfall.d.ts:138](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/waterfall.d.ts#L138)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |





**Returns:** `Promise`.<`any`>





___

<a id="dialogresume"></a>

###  dialogResume

► **dialogResume**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*, result?: *`any`*): `Promiseable`.<`any`>



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[dialogResume](../interfaces/botbuilder_dialogs.dialog.md#dialogresume)*

*Defined in [libraries/botbuilder-dialogs/lib/waterfall.d.ts:139](https://github.com/Microsoft/botbuilder-js/blob/ce7c4b3/libraries/botbuilder-dialogs/lib/waterfall.d.ts#L139)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| result | `any`   |  - |





**Returns:** `Promiseable`.<`any`>





___


