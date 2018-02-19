[Bot Builder SDK - Dialogs](../README.md) > [Waterfall](../classes/botbuilder_dialogs.waterfall.md)



# Class: Waterfall


Dialog optimized for prompting a user with a series of questions. Waterfalls accept a stack of functions which will be executed in sequence. Each waterfall step can ask a question of the user by calling either a prompt or another dialog. When the called dialog completes control will be returned to the next step of the waterfall and any input collected by the prompt or other dialog will be passed to the step as an argument.

When a step is executed it should call either `context.begin()`, `context.end()`, `context.replace()`, `context.cancelDialog()`, or a prompt. Failing to do so will result in teh dialog automatically ending the next time the user replies.

Similarly, calling a dialog/prompt from within the last step of the waterfall will result in the waterfall automatically ending once the dialog/prompt completes. This is often desired though as the result from tha called dialog/prompt will be passed to the waterfalls parent dialog.

## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)

## Index

### Constructors

* [constructor](botbuilder_dialogs.waterfall.md#constructor)


### Methods

* [begin](botbuilder_dialogs.waterfall.md#begin)
* [resume](botbuilder_dialogs.waterfall.md#resume)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new Waterfall**(steps: *[WaterfallStep](../#waterfallstep)[]*): [Waterfall](botbuilder_dialogs.waterfall.md)


*Defined in [libraries/botbuilder-dialogs/lib/waterfall.d.ts:40](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/waterfall.d.ts#L40)*



Creates a new waterfall dialog containing the given array of steps.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| steps | [WaterfallStep](../#waterfallstep)[]   |  Array of waterfall steps. |





**Returns:** [Waterfall](botbuilder_dialogs.waterfall.md)

---


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, args?: *`any`*): [Promiseable]()`void`



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[begin](../interfaces/botbuilder_dialogs.dialog.md#begin)*

*Defined in [libraries/botbuilder-dialogs/lib/waterfall.d.ts:46](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/waterfall.d.ts#L46)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |
| args | `any`   |  - |





**Returns:** [Promiseable]()`void`





___

<a id="resume"></a>

###  resume

► **resume**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, result?: *`any`*): [Promiseable]()`void`



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[resume](../interfaces/botbuilder_dialogs.dialog.md#resume)*

*Defined in [libraries/botbuilder-dialogs/lib/waterfall.d.ts:47](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/waterfall.d.ts#L47)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |
| result | `any`   |  - |





**Returns:** [Promiseable]()`void`





___


