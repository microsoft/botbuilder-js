[Bot Builder SDK - Dialogs](../README.md) > [Control](../classes/botbuilder_dialogs.control.md)



# Class: Control


:package: **botbuilder-dialogs**

Base class for any dialog that wants to support being used as a dialog within a bots `DialogSet` or on its own as a control within a bot that uses an alternate conversation management system.

The `Control` and `CompositeControl` classes are very similar in that they both add `begin()` and `continue()` methods which simplify consuming the control from a non-dialog based bot. The primary difference between the two classes is that the `CompositeControl` class is designed to bridge one `DialogSet` to another where the `Control` class assumes that the derived dialog can be used in complete isolation without the need for any other supporting dialogs.

## Type parameters
#### C :  `TurnContext`

The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.

#### R 

(Optional) type of result that's expected to be returned by the control.

#### O 

(Optional) options that can be passed into the [begin()](#begin) method.

## Hierarchy

**Control**

↳  [Prompt](botbuilder_dialogs.prompt.md)




↳  [OAuthPrompt](botbuilder_dialogs.oauthprompt.md)








## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`

## Index

### Constructors

* [constructor](botbuilder_dialogs.control.md#constructor)


### Properties

* [defaultOptions](botbuilder_dialogs.control.md#defaultoptions)


### Methods

* [begin](botbuilder_dialogs.control.md#begin)
* [continue](botbuilder_dialogs.control.md#continue)
* [dialogBegin](botbuilder_dialogs.control.md#dialogbegin)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new Control**(defaultOptions?: *`O`*): [Control](botbuilder_dialogs.control.md)


*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/control.d.ts#L27)*



Creates a new Control instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| defaultOptions | `O`   |  (Optional) set of default options that should be passed to controls `dialogBegin()` method. These will be merged with arguments passed in by the caller. |





**Returns:** [Control](botbuilder_dialogs.control.md)

---


## Properties
<a id="defaultoptions"></a>

### «Protected» defaultOptions

**●  defaultOptions**:  *`O`* 

*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/control.d.ts#L27)*





___


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`C`*, state: *`object`*, options?: *`O`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>



*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:51](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/control.d.ts#L51)*



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



*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/control.d.ts#L68)*



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

*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:69](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/control.d.ts#L69)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| dialogArgs | `any`   |  - |





**Returns:** `Promise`.<`any`>





___


