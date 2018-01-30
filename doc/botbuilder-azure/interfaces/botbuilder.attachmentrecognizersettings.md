[Bot Builder SDK - Azure](../README.md) > [botbuilder](../modules/botbuilder.md) > [AttachmentRecognizerSettings](../interfaces/botbuilder.attachmentrecognizersettings.md)



# Interface: AttachmentRecognizerSettings


Optional settings for an `AttachmentRecognizer`.


## Properties
<a id="intentname"></a>

###  intentName

**●  intentName**:  *`string`* 

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/attachmentRecognizer.d.ts:15*



Name of the intent to return when an attachment is detected. This defaults to a value of "Intents.AttachmentReceived".

Developers can also adjust the name of the intent returned by adding content filters to the recognizer. This setting will be ignored when content filters are active.




___


