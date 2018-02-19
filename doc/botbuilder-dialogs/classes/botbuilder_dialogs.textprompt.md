[Bot Builder SDK - Dialogs](../README.md) > [TextPrompt](../classes/botbuilder_dialogs.textprompt.md)



# Class: TextPrompt

## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)

## Index

### Constructors

* [constructor](botbuilder_dialogs.textprompt.md#constructor)


### Methods

* [begin](botbuilder_dialogs.textprompt.md#begin)
* [continue](botbuilder_dialogs.textprompt.md#continue)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new TextPrompt**(validator?: *[PromptValidator](../#promptvalidator)`string`⎮`undefined`*): [TextPrompt](botbuilder_dialogs.textprompt.md)


*Defined in [libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts:12](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts#L12)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)`string`⎮`undefined`   |  - |





**Returns:** [TextPrompt](botbuilder_dialogs.textprompt.md)

---


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, options: *[PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts:14](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts#L14)*



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

*Defined in [libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/prompts/textPrompt.d.ts#L15)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |





**Returns:** `Promise`.<`void`>





___


