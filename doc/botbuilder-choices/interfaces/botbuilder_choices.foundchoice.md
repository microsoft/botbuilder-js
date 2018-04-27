[Bot Builder SDK - Choices](../README.md) > [FoundChoice](../interfaces/botbuilder_choices.foundchoice.md)



# Interface: FoundChoice


:package: **botbuilder-choices**

Result returned by `findChoices()`.


## Properties
<a id="index"></a>

###  index

**●  index**:  *`number`* 

*Defined in [libraries/botbuilder-choices/lib/findChoices.d.ts:82](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/findChoices.d.ts#L82)*



The choices index within the list of choices that was searched over.




___

<a id="score"></a>

###  score

**●  score**:  *`number`* 

*Defined in [libraries/botbuilder-choices/lib/findChoices.d.ts:87](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/findChoices.d.ts#L87)*



The accuracy with which the synonym matched the specified portion of the utterance. A value of 1.0 would indicate a perfect match.




___

<a id="synonym"></a>

### «Optional» synonym

**●  synonym**:  *`string`* 

*Defined in [libraries/botbuilder-choices/lib/findChoices.d.ts:89](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/findChoices.d.ts#L89)*



(Optional) The synonym that was matched.




___

<a id="value"></a>

###  value

**●  value**:  *`string`* 

*Defined in [libraries/botbuilder-choices/lib/findChoices.d.ts:80](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/findChoices.d.ts#L80)*



The value of the choice that was matched.




___


