[Bot Builder SDK - Dialogs](../README.md) > [Control](../classes/botbuilder_dialogs.control.md)



# Class: Control

## Type parameters
#### R 
#### O 
#### C :  `BotContext`
## Hierarchy

**Control**

↳  [Prompt](botbuilder_dialogs.prompt.md)








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


*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/control.d.ts#L15)*



Creates a new Control instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| defaultOptions | `O`   |  (Optional) set of default options that should be passed to controls root dialog. These will be merged with arguments passed in by the caller. |





**Returns:** [Control](botbuilder_dialogs.control.md)

---


## Properties
<a id="defaultoptions"></a>

### «Protected» defaultOptions

**●  defaultOptions**:  *`O`* 

*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/control.d.ts#L15)*





___


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`C`*, state: *`object`*, options?: *`O`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>



*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/control.d.ts#L21)*



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



*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:22](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/control.d.ts#L22)*



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

*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:23](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/control.d.ts#L23)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| dialogArgs | `any`   |  - |





**Returns:** `Promise`.<`any`>





___


