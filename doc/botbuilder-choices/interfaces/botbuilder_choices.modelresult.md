[Bot Builder SDK - Choices](../README.md) > [ModelResult](../interfaces/botbuilder_choices.modelresult.md)



# Interface: ModelResult


Outer result returned by an entity recognizer like `recognizeChoices()`. This structure is wrapped around the recognized result and contains [start](#start) and [end](#end) position information to identify the span of text in the users utterance that was recognized. The actual result can be accessed through the [resolution](#resolution) property.

## Type parameters
#### T :  `Object`

The type of entity/resolution being returned.


## Properties
<a id="end"></a>

###  end

**●  end**:  *`number`* 

*Defined in [libraries/botbuilder-choices/lib/modelResult.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/modelResult.d.ts#L21)*



End character position of the recognized substring.




___

<a id="resolution"></a>

###  resolution

**●  resolution**:  *`T`* 

*Defined in [libraries/botbuilder-choices/lib/modelResult.d.ts:25](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/modelResult.d.ts#L25)*



The recognized entity.




___

<a id="start"></a>

###  start

**●  start**:  *`number`* 

*Defined in [libraries/botbuilder-choices/lib/modelResult.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/modelResult.d.ts#L19)*



Start character position of the recognized substring.




___

<a id="text"></a>

###  text

**●  text**:  *`string`* 

*Defined in [libraries/botbuilder-choices/lib/modelResult.d.ts:17](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/modelResult.d.ts#L17)*



Substring of the utterance that was recognized.




___

<a id="typename"></a>

###  typeName

**●  typeName**:  *`string`* 

*Defined in [libraries/botbuilder-choices/lib/modelResult.d.ts:23](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/modelResult.d.ts#L23)*



Type of entity that was recognized.




___


