[Bot Builder SDK - Dialogs](../README.md) > [DatetimePrompt](../classes/botbuilder_dialogs.datetimeprompt.md)



# Class: DatetimePrompt

## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)

## Index

### Constructors

* [constructor](botbuilder_dialogs.datetimeprompt.md#constructor)


### Methods

* [begin](botbuilder_dialogs.datetimeprompt.md#begin)
* [continue](botbuilder_dialogs.datetimeprompt.md#continue)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new DatetimePrompt**(validator?: *[PromptValidator](../#promptvalidator)[FoundDatetime](../interfaces/botbuilder_dialogs.founddatetime.md)[]⎮`undefined`*): [DatetimePrompt](botbuilder_dialogs.datetimeprompt.md)


*Defined in [libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts:17](https://github.com/Microsoft/botbuilder-js/blob/8226dcc/libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts#L17)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)[FoundDatetime](../interfaces/botbuilder_dialogs.founddatetime.md)[]⎮`undefined`   |  - |





**Returns:** [DatetimePrompt](botbuilder_dialogs.datetimeprompt.md)

---


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, options: *[PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/8226dcc/libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts#L19)*



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

*Defined in [libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts:20](https://github.com/Microsoft/botbuilder-js/blob/8226dcc/libraries/botbuilder-dialogs/lib/prompts/datetimePrompt.d.ts#L20)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |





**Returns:** `Promise`.<`void`>





___


