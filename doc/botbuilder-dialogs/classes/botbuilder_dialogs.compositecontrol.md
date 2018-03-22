[Bot Builder SDK - Dialogs](../README.md) > [CompositeControl](../classes/botbuilder_dialogs.compositecontrol.md)



# Class: CompositeControl

## Type parameters
#### R 
#### O 
#### C :  `BotContext`
## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`

## Index

### Constructors

* [constructor](botbuilder_dialogs.compositecontrol.md#constructor)


### Properties

* [defaultOptions](botbuilder_dialogs.compositecontrol.md#defaultoptions)
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


### ⊕ **new CompositeControl**(dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)`C`*, dialogId: *`string`*, defaultOptions?: *`O`*): [CompositeControl](botbuilder_dialogs.compositecontrol.md)


*Defined in [libraries/botbuilder-dialogs/lib/compositeControl.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/compositeControl.d.ts#L18)*



Creates a new CompositeControl instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)`C`   |  Controls dialog set. |
| dialogId | `string`   |  ID of the root dialog that should be started anytime the control is started. |
| defaultOptions | `O`   |  (Optional) set of default options that should be passed to controls root dialog. These will be merged with arguments passed in by the caller. |





**Returns:** [CompositeControl](botbuilder_dialogs.compositecontrol.md)

---


## Properties
<a id="defaultoptions"></a>

### «Protected» defaultOptions

**●  defaultOptions**:  *`O`* 

*Defined in [libraries/botbuilder-dialogs/lib/compositeControl.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/compositeControl.d.ts#L18)*





___

<a id="dialogid"></a>

### «Protected» dialogId

**●  dialogId**:  *`string`* 

*Defined in [libraries/botbuilder-dialogs/lib/compositeControl.d.ts:17](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/compositeControl.d.ts#L17)*





___

<a id="dialogs"></a>

### «Protected» dialogs

**●  dialogs**:  *[DialogSet](botbuilder_dialogs.dialogset.md)`C`* 

*Defined in [libraries/botbuilder-dialogs/lib/compositeControl.d.ts:16](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/compositeControl.d.ts#L16)*





___


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`C`*, state: *`object`*, options?: *`O`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>



*Defined in [libraries/botbuilder-dialogs/lib/compositeControl.d.ts:26](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/compositeControl.d.ts#L26)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `C`   |  - |
| state | `object`   |  - |
| options | `O`   |  - |





**Returns:** `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>





___

<a id="continue"></a>

###  continue

► **continue**(context: *`C`*, state: *`object`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>



*Defined in [libraries/botbuilder-dialogs/lib/compositeControl.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/compositeControl.d.ts#L27)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `C`   |  - |
| state | `object`   |  - |





**Returns:** `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>





___

<a id="dialogbegin"></a>

###  dialogBegin

► **dialogBegin**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*, dialogArgs?: *`any`*): `Promise`.<`any`>



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[dialogBegin](../interfaces/botbuilder_dialogs.dialog.md#dialogbegin)*

*Defined in [libraries/botbuilder-dialogs/lib/compositeControl.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/compositeControl.d.ts#L28)*



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

*Defined in [libraries/botbuilder-dialogs/lib/compositeControl.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/compositeControl.d.ts#L29)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |





**Returns:** `Promise`.<`any`>





___


