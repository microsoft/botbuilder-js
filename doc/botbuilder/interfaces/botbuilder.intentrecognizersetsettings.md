[Bot Builder SDK - Core](../README.md) > [IntentRecognizerSetSettings](../interfaces/botbuilder.intentrecognizersetsettings.md)



# Interface: IntentRecognizerSetSettings


Optional settings for an `IntentRecognizerSet`.


## Properties
<a id="recognizeorder"></a>

### «Optional» recognizeOrder

**●  recognizeOrder**:  *[RecognizeOrder](../enums/botbuilder.recognizeorder.md)* 

*Defined in [libraries/botbuilder/lib/intentRecognizerSet.d.ts:16](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/intentRecognizerSet.d.ts#L16)*



(Optional) preferred order in which the sets recognizers should be run. The default value is `RecognizeOrder.parallel`.




___

<a id="stoponexactmatch"></a>

### «Optional» stopOnExactMatch

**●  stopOnExactMatch**:  *`undefined`⎮`true`⎮`false`* 

*Defined in [libraries/botbuilder/lib/intentRecognizerSet.d.ts:22](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/intentRecognizerSet.d.ts#L22)*



(Optional) if `true` and the [recognizeOrder](#recognizeorder) is `RecognizeOrder.series`, the execution of recognizers will be short circuited should a recognizer return an intent with a score of 1.0\. The default value is `true`.




___


