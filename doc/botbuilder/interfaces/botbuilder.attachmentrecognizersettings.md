[Bot Builder SDK - Core](../README.md) > [AttachmentRecognizerSettings](../interfaces/botbuilder.attachmentrecognizersettings.md)



# Interface: AttachmentRecognizerSettings


Optional settings for an `AttachmentRecognizer`.


## Properties
<a id="intentname"></a>

###  intentName

**●  intentName**:  *`string`* 

*Defined in [libraries/botbuilder/lib/attachmentRecognizer.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/attachmentRecognizer.d.ts#L15)*



Name of the intent to return when an attachment is detected. This defaults to a value of "Intents.AttachmentReceived".

Developers can also adjust the name of the intent returned by adding content filters to the recognizer. This setting will be ignored when content filters are active.




___


