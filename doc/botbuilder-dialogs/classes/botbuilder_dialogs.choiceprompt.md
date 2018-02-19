[Bot Builder SDK - Dialogs](../README.md) > [ChoicePrompt](../classes/botbuilder_dialogs.choiceprompt.md)



# Class: ChoicePrompt

## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)

## Index

### Constructors

* [constructor](botbuilder_dialogs.choiceprompt.md#constructor)


### Properties

* [stylerOptions](botbuilder_dialogs.choiceprompt.md#styleroptions)


### Methods

* [begin](botbuilder_dialogs.choiceprompt.md#begin)
* [continue](botbuilder_dialogs.choiceprompt.md#continue)
* [sendChoicePrompt](botbuilder_dialogs.choiceprompt.md#sendchoiceprompt)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new ChoicePrompt**(validator?: *[PromptValidator](../#promptvalidator)[FoundChoice]()⎮`undefined`⎮`undefined`*, choices?: *[DynamicChoicesProvider](../#dynamicchoicesprovider)⎮`undefined`*): [ChoicePrompt](botbuilder_dialogs.choiceprompt.md)


*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:35](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L35)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)[FoundChoice]()⎮`undefined`⎮`undefined`   |  - |
| choices | [DynamicChoicesProvider](../#dynamicchoicesprovider)⎮`undefined`   |  - |





**Returns:** [ChoicePrompt](botbuilder_dialogs.choiceprompt.md)

---


## Properties
<a id="styleroptions"></a>

###  stylerOptions

**●  stylerOptions**:  *[ChoiceStylerOptions]()* 

*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:35](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L35)*





___


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, options: *[ChoicePromptOptions](../interfaces/botbuilder_dialogs.choicepromptoptions.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:37](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L37)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |
| options | [ChoicePromptOptions](../interfaces/botbuilder_dialogs.choicepromptoptions.md)   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="continue"></a>

###  continue

► **continue**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*): `Promise`.<`void`>



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[continue](../interfaces/botbuilder_dialogs.dialog.md#continue)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:38](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L38)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="sendchoiceprompt"></a>

### «Protected» sendChoicePrompt

► **sendChoicePrompt**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, prompt: *`string`⎮[Partial]()[Activity]()*, speak?: *`undefined`⎮`string`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts:39](https://github.com/Microsoft/botbuilder-js/blob/9c47be0/libraries/botbuilder-dialogs/lib/prompts/choicePrompt.d.ts#L39)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |
| prompt | `string`⎮[Partial]()[Activity]()   |  - |
| speak | `undefined`⎮`string`   |  - |





**Returns:** `Promise`.<`void`>





___


