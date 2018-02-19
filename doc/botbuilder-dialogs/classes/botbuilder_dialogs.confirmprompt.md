[Bot Builder SDK - Dialogs](../README.md) > [ConfirmPrompt](../classes/botbuilder_dialogs.confirmprompt.md)



# Class: ConfirmPrompt

## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)

## Index

### Constructors

* [constructor](botbuilder_dialogs.confirmprompt.md#constructor)


### Properties

* [choices](botbuilder_dialogs.confirmprompt.md#choices)
* [stylerOptions](botbuilder_dialogs.confirmprompt.md#styleroptions)


### Methods

* [begin](botbuilder_dialogs.confirmprompt.md#begin)
* [continue](botbuilder_dialogs.confirmprompt.md#continue)
* [sendChoicePrompt](botbuilder_dialogs.confirmprompt.md#sendchoiceprompt)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new ConfirmPrompt**(validator?: *[PromptValidator](../#promptvalidator)`boolean`⎮`undefined`⎮`undefined`*): [ConfirmPrompt](botbuilder_dialogs.confirmprompt.md)


*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:24](https://github.com/Microsoft/botbuilder-js/blob/59b50cb/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L24)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)`boolean`⎮`undefined`⎮`undefined`   |  - |





**Returns:** [ConfirmPrompt](botbuilder_dialogs.confirmprompt.md)

---


## Properties
<a id="choices"></a>

###  choices

**●  choices**:  *[ConfirmChoices](../interfaces/botbuilder_dialogs.confirmchoices.md)* 

*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:24](https://github.com/Microsoft/botbuilder-js/blob/59b50cb/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L24)*





___

<a id="styleroptions"></a>

###  stylerOptions

**●  stylerOptions**:  *[ChoiceStylerOptions]()* 

*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:23](https://github.com/Microsoft/botbuilder-js/blob/59b50cb/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L23)*





___


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, options: *[ConfirmPromptOptions](../interfaces/botbuilder_dialogs.confirmpromptoptions.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:26](https://github.com/Microsoft/botbuilder-js/blob/59b50cb/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L26)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |
| options | [ConfirmPromptOptions](../interfaces/botbuilder_dialogs.confirmpromptoptions.md)   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="continue"></a>

###  continue

► **continue**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*): `Promise`.<`void`>



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[continue](../interfaces/botbuilder_dialogs.dialog.md#continue)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/59b50cb/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L27)*



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



*Defined in [libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/59b50cb/libraries/botbuilder-dialogs/lib/prompts/confirmPrompt.d.ts#L28)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |
| prompt | `string`⎮[Partial]()[Activity]()   |  - |
| speak | `undefined`⎮`string`   |  - |





**Returns:** `Promise`.<`void`>





___


