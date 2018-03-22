[Bot Builder SDK - Prompts](../README.md) > [FoundDatetime](../interfaces/botbuilder_prompts.founddatetime.md)



# Interface: FoundDatetime


Datetime result returned by `DatetimePrompt`. For more details see the LUIS docs for [builtin.datetimev2](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-reference-prebuilt-entities#builtindatetimev2).


## Properties
<a id="timex"></a>

###  timex

**●  timex**:  *`string`* 

*Defined in [libraries/botbuilder-prompts/lib/datetimePrompt.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-prompts/lib/datetimePrompt.d.ts#L18)*



TIMEX expression representing ambiguity of the recognized time.




___

<a id="type"></a>

###  type

**●  type**:  *`string`* 

*Defined in [libraries/botbuilder-prompts/lib/datetimePrompt.d.ts:23](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-prompts/lib/datetimePrompt.d.ts#L23)*



Type of time recognized. Possible values are 'date', 'time', 'datetime', 'daterange', 'timerange', 'datetimerange', 'duration', or 'set'.




___

<a id="value"></a>

###  value

**●  value**:  *`string`* 

*Defined in [libraries/botbuilder-prompts/lib/datetimePrompt.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-prompts/lib/datetimePrompt.d.ts#L28)*



Value of the specified [type](#type) that's a reasonable approximation given the ambiguity of the [timex](#timex).




___


