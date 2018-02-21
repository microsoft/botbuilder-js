[Bot Builder SDK - Dialogs](../README.md) > [AttachmentPrompt](../classes/botbuilder_dialogs.attachmentprompt.md)



# Class: AttachmentPrompt


Prompts a user to upload attachments like images. By default the prompt will return to the calling dialog a `Attachment[]` but this can be overridden using a custom `PromptValidator`.

**Example usage:**

    const { DialogSet, AttachmentPrompt } = require('botbuilder-dialogs');

    const dialogs = new DialogSet();

    dialogs.add('attachmentPrompt', new AttachmentPrompt());

    dialogs.add('uploadImage', [
         function (context) {
             return dialogs.prompt(context, 'attachmentPrompt', `Send me image(s)`);
         },
         function (context, attachments) {
             context.reply(`Processing ${attachments.length} images.`);
             return dialogs.end(context);
         }
    ]);

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


*Defined in [libraries/botbuilder-dialogs/lib/prompts/attachmentPrompt.d.ts:37](https://github.com/Microsoft/botbuilder-js/blob/071de25/libraries/botbuilder-dialogs/lib/prompts/attachmentPrompt.d.ts#L37)*



Creates a new instance of the prompt.

**Example usage:**

    dialogs.add('imagePrompt', new AttachmentPrompt((context, values) => {
         if (values.length < 1) {
             context.reply(`Send me an image or say 'cancel'.`);
             return Prompts.resolve();
         } else {
             return dialogs.end(context, values);
         }
    }));


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](../#promptvalidator)[Attachment]()[]⎮`undefined`   |  (Optional) validator that will be called each time the user responds to the prompt. |





**Returns:** [AttachmentPrompt](botbuilder_dialogs.attachmentprompt.md)

---


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`BotContext`*, dialogs: *[DialogSet](botbuilder_dialogs.dialogset.md)*, options: *[PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/prompts/attachmentPrompt.d.ts:56](https://github.com/Microsoft/botbuilder-js/blob/071de25/libraries/botbuilder-dialogs/lib/prompts/attachmentPrompt.d.ts#L56)*



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

*Defined in [libraries/botbuilder-dialogs/lib/prompts/attachmentPrompt.d.ts:57](https://github.com/Microsoft/botbuilder-js/blob/071de25/libraries/botbuilder-dialogs/lib/prompts/attachmentPrompt.d.ts#L57)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| dialogs | [DialogSet](botbuilder_dialogs.dialogset.md)   |  - |





**Returns:** `Promise`.<`void`>





___


