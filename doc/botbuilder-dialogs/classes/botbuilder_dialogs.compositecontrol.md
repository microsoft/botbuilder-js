[Bot Builder SDK - Dialogs](../README.md) > [CompositeControl](../classes/botbuilder_dialogs.compositecontrol.md)



# Class: CompositeControl


:package: **botbuilder-dialogs**

A `CompositeControl` makes it easy to take an existing set of dialogs and package them up as a control that can be used within another bot. The control can be used either as a dialog added to the other bots `DialogSet` or on its own for bots that are using some other conversation management system.

### Control Packaging

You'll typically want to package your control as a new class derived from `CompositeControl`. Within your controls constructor you'll pass the `DialogSet` containing your controls dialogs and the `ID` of the initial dialog that should be started anytime a caller calls the dialog.

If your control needs to be configured then you can pass through the configuration settings as a set of `defaultOptions` which will be merged with any options passed in by the caller when they call `begin()`. These will then be passed as arguments to the initial dialog that gets started.

Here's a fairly simple example of a `ProfileControl` that's designed to prompt the user to enter their name and phone number which it will return as a JSON object to the caller:

    const { CompositeControl, DialogSet, TextPrompt } = require('botbuilder-dialogs');

    const dialogs = new DialogSet();

    class ProfileControl extends CompositeControl {
        constructor() {
            super('fillProfile');

            this.dialogs.add('fillProfile', [
                async function (dc, options) {
                    dc.instance.state = {};
                    await dc.prompt('textPrompt', `What's your name?`);
                },
                async function (dc, name) {
                    dc.instance.state.name = name;
                    await dc.prompt('textPrompt', `What's your phone number?`);
                },
                async function (dc, phone) {
                    dc.instance.state.phone = phone;

                    // Return completed profile
                    await dc.end(dc.instance.state);
               }
           ]);

           this.dialogs.add('textPrompt', new TextPrompt());
        }
    }
    module.exports.ProfileControl = ProfileControl;

### Consume as Dialog

On the consumption side the control we created can be used by a bot in much the same way they would use any other prompt. They can add a new instance of the control as a named dialog to their bots `DialogSet` and then start it using a call to `DialogContext.begin()`. If the control accepts options these can be passed in to the `begin()` call as well.

    const { DialogSet } = require('botbuilder-dialogs');
    const { ProfileControl } = require('./profileControl');

    const dialogs = new DialogSet();

    dialogs.add('getProfile', new ProfileControl());

    dialogs.add('firstrun', [
         async function (dc) {
             await dc.context.sendActivity(`Welcome! We need to ask a few questions to get started.`);
             await dc.begin('getProfile');
         },
         async function (dc, profile) {
             await dc.context.sendActivity(`Thanks ${profile.name}!`);
             await dc.end();
         }
    ]);

### Consume as Control

If the consuming bot isn't dialog based they can still use your control. They will just need start the control from somewhere within their bots logic by calling the controls `begin()` method:

    const state = {};
    const control = new ProfileControl();
    await prompt.begin(context, state);

The control will populate the `state` object passed in with information it needs to process the users response. This should be saved off with the bots conversation state as it needs to be passed into the controls `continue()` method on the next turn of conversation with the user:

    const control = new ProfileControl();
    const result = await control.continue(context, state);
    if (!result.active) {
        const profile = result.result;
    }

The `continue()` method returns a `DialogResult` object which can be used to determine when the control is finished and then to access any results it might have returned. To interrupt or cancel the control simply delete the `state` object the bot has been persisting.

## Type parameters
#### R 

(Optional) type of result that's expected to be returned by the control.

#### O 

(Optional) options that can be passed into the begin() method.

#### C :  `TurnContext`

(Optional) type of `TurnContext` being passed to dialogs in the set.

## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`

## Index

### Constructors

* [constructor](botbuilder_dialogs.compositecontrol.md#constructor)


### Properties

* [dialogId](botbuilder_dialogs.compositecontrol.md#dialogid)
* [dialogs](botbuilder_dialogs.compositecontrol.md#dialogs)


### Methods

* [begin](botbuilder_dialogs.compositecontrol.md#begin)
* [continue](botbuilder_dialogs.compositecontrol.md#continue)
* [dialogBegin](botbuilder_dialogs.compositecontrol.md#dialogbegin)
* [dialogContinue](botbuilder_dialogs.compositecontrol.md#dialogcontinue)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new CompositeControl**(dialogId: *`string`*, dialogs?: *[DialogSet](botbuilder_dialogs.dialogset.md)`C`*): [CompositeControl](botbuilder_dialogs.compositecontrol.md)


*Defined in [libraries/botbuilder-dialogs/lib/compositeControl.d.ts:127](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/compositeControl.d.ts#L127)*



Creates a new `CompositeControl` instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dialogId | `string`   |  ID of the root dialog that should be started anytime the control is started. |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)`C`   |  (Optional) set of existing dialogs the control should use. If omitted an empty set will be created. |





**Returns:** [CompositeControl](botbuilder_dialogs.compositecontrol.md)

---


## Properties
<a id="dialogid"></a>

### «Protected» dialogId

**●  dialogId**:  *`string`* 

*Defined in [libraries/botbuilder-dialogs/lib/compositeControl.d.ts:125](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/compositeControl.d.ts#L125)*





___

<a id="dialogs"></a>

### «Protected» dialogs

**●  dialogs**:  *[DialogSet](botbuilder_dialogs.dialogset.md)`C`* 

*Defined in [libraries/botbuilder-dialogs/lib/compositeControl.d.ts:127](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/compositeControl.d.ts#L127)*



The controls dialog set.




___


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`C`*, state: *`object`*, options?: *`O`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>



*Defined in [libraries/botbuilder-dialogs/lib/compositeControl.d.ts:152](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/compositeControl.d.ts#L152)*



Starts the control. Depending on the control, its possible for the control to finish immediately so it's advised to check the result object returned by `begin()` and ensure that the control is still active before continuing.

**Usage Example:**

    const state = {};
    const result = await control.begin(context, state);
    if (!result.active) {
        const value = result.result;
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `C`   |  Context for the current turn of the conversation with the user. |
| state | `object`   |  A state object that the control will use to persist its current state. This should be an empty object which the control will populate. The bot should persist this with its other conversation state for as long as the control is still active. |
| options | `O`   |  (Optional) additional options supported by the control. |





**Returns:** `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>





___

<a id="continue"></a>

###  continue

► **continue**(context: *`C`*, state: *`object`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>



*Defined in [libraries/botbuilder-dialogs/lib/compositeControl.d.ts:169](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/compositeControl.d.ts#L169)*



Passes a users reply to the control for further processing. The bot should keep calling `continue()` for future turns until the control returns a result with `Active == false`. To cancel or interrupt the prompt simply delete the `state` object being persisted.

**Usage Example:**

    const result = await control.continue(context, state);
    if (!result.active) {
        const value = result.result;
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `C`   |  Context for the current turn of the conversation with the user. |
| state | `object`   |  A state object that was previously initialized by a call to [begin()](#begin). |





**Returns:** `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>





___

<a id="dialogbegin"></a>

###  dialogBegin

► **dialogBegin**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*, dialogArgs?: *`any`*): `Promise`.<`any`>



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[dialogBegin](../interfaces/botbuilder_dialogs.dialog.md#dialogbegin)*

*Defined in [libraries/botbuilder-dialogs/lib/compositeControl.d.ts:170](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/compositeControl.d.ts#L170)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| dialogArgs | `any`   |  - |





**Returns:** `Promise`.<`any`>





___

<a id="dialogcontinue"></a>

###  dialogContinue

► **dialogContinue**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*): `Promise`.<`any`>



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[dialogContinue](../interfaces/botbuilder_dialogs.dialog.md#dialogcontinue)*

*Defined in [libraries/botbuilder-dialogs/lib/compositeControl.d.ts:171](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/compositeControl.d.ts#L171)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |





**Returns:** `Promise`.<`any`>





___


