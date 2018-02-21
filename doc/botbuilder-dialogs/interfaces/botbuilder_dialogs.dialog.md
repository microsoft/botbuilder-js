[Bot Builder SDK - Dialogs](../README.md) > [Dialog](../interfaces/botbuilder_dialogs.dialog.md)



# Interface: Dialog


Interface of Dialog objects that can be added to a `DialogSet`. The dialog should generally be a singleton and added to a dialog set using `DialogSet.add()` at which point it will be assigned a unique ID.

## Implemented by

* [AttachmentPrompt](../classes/botbuilder_dialogs.attachmentprompt.md)
* [ChoicePrompt](../classes/botbuilder_dialogs.choiceprompt.md)
* [ConfirmPrompt](../classes/botbuilder_dialogs.confirmprompt.md)
* [DatetimePrompt](../classes/botbuilder_dialogs.datetimeprompt.md)
* [NumberPrompt](../classes/botbuilder_dialogs.numberprompt.md)
* [TextPrompt](../classes/botbuilder_dialogs.textprompt.md)
* [Waterfall](../classes/botbuilder_dialogs.waterfall.md)


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`BotContext`*, dialogs: *[DialogSet](../classes/botbuilder_dialogs.dialogset.md)*, args?: *`any`*): [Promiseable]()`void`



*Defined in [libraries/botbuilder-dialogs/lib/dialog.d.ts:22](https://github.com/Microsoft/botbuilder-js/blob/071de25/libraries/botbuilder-dialogs/lib/dialog.d.ts#L22)*



Method called when a new dialog has been pushed onto the stack and is being activated.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  The dialog context for the current turn of conversation. |
| dialogs | [DialogSet](../classes/botbuilder_dialogs.dialogset.md)   |  The dialogs parent set. |
| args | `any`   |  (Optional) arguments that were passed to the dialog during `begin()` call that started the instance. |





**Returns:** [Promiseable]()`void`





___

<a id="continue"></a>

### «Optional» continue

► **continue**(context: *`BotContext`*, dialogs: *[DialogSet](../classes/botbuilder_dialogs.dialogset.md)*): [Promiseable]()`void`



*Defined in [libraries/botbuilder-dialogs/lib/dialog.d.ts:33](https://github.com/Microsoft/botbuilder-js/blob/071de25/libraries/botbuilder-dialogs/lib/dialog.d.ts#L33)*



(Optional) method called when an instance of the dialog is the "current" dialog and the user replies with a new activity. The dialog will generally continue to receive the users replies until it calls either `DialogSet.end()` or `DialogSet.begin()`.

If this method is NOT implemented then the dialog will automatically be ended when the user replies.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  The dialog context for the current turn of conversation. |
| dialogs | [DialogSet](../classes/botbuilder_dialogs.dialogset.md)   |  The dialogs parent set. |





**Returns:** [Promiseable]()`void`





___

<a id="resume"></a>

### «Optional» resume

► **resume**(context: *`BotContext`*, dialogs: *[DialogSet](../classes/botbuilder_dialogs.dialogset.md)*, result?: *`any`*): [Promiseable]()`void`



*Defined in [libraries/botbuilder-dialogs/lib/dialog.d.ts:45](https://github.com/Microsoft/botbuilder-js/blob/071de25/libraries/botbuilder-dialogs/lib/dialog.d.ts#L45)*



(Optional) method called when an instance of the dialog is being returned to from another dialog that was started by the current instance using `DialogSet.begin()`.

If this method is NOT implemented then the dialog will be automatically ended with a call to `DialogSet.endDialogWithResult()`. Any result passed from the called dialog will be passed to the current dialogs parent.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  The dialog context for the current turn of conversation. |
| dialogs | [DialogSet](../classes/botbuilder_dialogs.dialogset.md)   |  The dialogs parent set. |
| result | `any`   |  (Optional) value returned from the dialog that was called. The type of the value returned is dependant on the dialog that was called. |





**Returns:** [Promiseable]()`void`





___


