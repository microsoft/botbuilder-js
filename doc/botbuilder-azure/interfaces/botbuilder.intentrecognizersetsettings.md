[Bot Builder SDK - Azure](../README.md) > [botbuilder](../modules/botbuilder.md) > [IntentRecognizerSetSettings](../interfaces/botbuilder.intentrecognizersetsettings.md)



# Interface: IntentRecognizerSetSettings


Optional settings for an `IntentRecognizerSet`.


## Properties
<a id="recognizeorder"></a>

### «Optional» recognizeOrder

**●  recognizeOrder**:  *[RecognizeOrder](../enums/botbuilder.recognizeorder.md)* 

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/intentRecognizerSet.d.ts:16*



(Optional) preferred order in which the sets recognizers should be run. The default value is `RecognizeOrder.parallel`.




___

<a id="stoponexactmatch"></a>

### «Optional» stopOnExactMatch

**●  stopOnExactMatch**:  *`undefined`⎮`true`⎮`false`* 

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/intentRecognizerSet.d.ts:22*



(Optional) if `true` and the [recognizeOrder](#recognizeorder) is `RecognizeOrder.series`, the execution of recognizers will be short circuited should a recognizer return an intent with a score of 1.0\. The default value is `true`.




___


