[Bot Builder SDK - Dialogs](../README.md) > [NumberPrompt](../classes/botbuilder_dialogs.numberprompt.md)



# Class: NumberPrompt

## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)

## Index

### Constructors

* [constructor](botbuilder_dialogs.numberprompt.md#constructor)


### Methods

* [begin](botbuilder_dialogs.numberprompt.md#begin)
* [continue](botbuilder_dialogs.numberprompt.md#continue)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new NumberPrompt**(validator?: *[PromptValidator](../#promptvalidator)`number`⎮`undefined`⎮`undefined`*): [NumberPrompt](botbuilder_dialogs.numberprompt.md)


*Defined in [libraries/botbuilder-dialogs/lib/prompts/numberPrompt.d.ts:12](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/prompts/numberPrompt.d.ts#L12)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)`number`⎮`undefined`⎮`undefined`   |  - |





**Returns:** [NumberPrompt](botbuilder_dialogs.numberprompt.md)

---


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, options: *[PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/prompts/numberPrompt.d.ts:14](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/prompts/numberPrompt.d.ts#L14)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |
| options | [PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="continue"></a>

###  continue

► **continue**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*): `Promise`.<`void`>



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[continue](../interfaces/botbuilder_dialogs.dialog.md#continue)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/numberPrompt.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/prompts/numberPrompt.d.ts#L15)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |





**Returns:** `Promise`.<`void`>





___


