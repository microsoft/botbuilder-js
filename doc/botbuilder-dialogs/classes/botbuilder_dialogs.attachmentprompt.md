[Bot Builder SDK - Dialogs](../README.md) > [AttachmentPrompt](../classes/botbuilder_dialogs.attachmentprompt.md)



# Class: AttachmentPrompt

## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)

## Index

### Constructors

* [constructor](botbuilder_dialogs.attachmentprompt.md#constructor)


### Methods

* [begin](botbuilder_dialogs.attachmentprompt.md#begin)
* [continue](botbuilder_dialogs.attachmentprompt.md#continue)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new AttachmentPrompt**(validator?: *[PromptValidator](../#promptvalidator)[Attachment]()[]⎮`undefined`*): [AttachmentPrompt](botbuilder_dialogs.attachmentprompt.md)


*Defined in [libraries/botbuilder-dialogs/lib/prompts/attachmentPrompt.d.ts:16](https://github.com/Microsoft/botbuilder-js/blob/dfb4aa4/libraries/botbuilder-dialogs/lib/prompts/attachmentPrompt.d.ts#L16)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)[Attachment]()[]⎮`undefined`   |  - |





**Returns:** [AttachmentPrompt](botbuilder_dialogs.attachmentprompt.md)

---


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, options: *[PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/prompts/attachmentPrompt.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/dfb4aa4/libraries/botbuilder-dialogs/lib/prompts/attachmentPrompt.d.ts#L18)*



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

*Defined in [libraries/botbuilder-dialogs/lib/prompts/attachmentPrompt.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/dfb4aa4/libraries/botbuilder-dialogs/lib/prompts/attachmentPrompt.d.ts#L19)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |





**Returns:** `Promise`.<`void`>





___


