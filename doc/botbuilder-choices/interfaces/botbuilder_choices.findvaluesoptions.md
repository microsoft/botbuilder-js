[Bot Builder SDK - Choices](../README.md) > [FindValuesOptions](../interfaces/botbuilder_choices.findvaluesoptions.md)



# Interface: FindValuesOptions


:package: **botbuilder-choices**

Basic search options used to control how choices are recognized in a users utterance.

## Hierarchy

**FindValuesOptions**

↳  [FindChoicesOptions](botbuilder_choices.findchoicesoptions.md)









## Properties
<a id="allowpartialmatches"></a>

### «Optional» allowPartialMatches

**●  allowPartialMatches**:  *`boolean`* 

*Defined in [libraries/botbuilder-choices/lib/findValues.d.ts:20](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/findValues.d.ts#L20)*



(Optional) if true, then only some of the tokens in a value need to exist to be considered a match. The default value is "false".




___

<a id="locale"></a>

### «Optional» locale

**●  locale**:  *`string`* 

*Defined in [libraries/botbuilder-choices/lib/findValues.d.ts:24](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/findValues.d.ts#L24)*



(Optional) locale/culture code of the utterance. The default is `en-US`.




___

<a id="maxtokendistance"></a>

### «Optional» maxTokenDistance

**●  maxTokenDistance**:  *`number`* 

*Defined in [libraries/botbuilder-choices/lib/findValues.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/findValues.d.ts#L31)*



(Optional) maximum tokens allowed between two matched tokens in the utterance. So with a max distance of 2 the value "second last" would match the utterance "second from the last" but it wouldn't match "Wait a second. That's not the last one is it?". The default value is "2".




___

<a id="tokenizer"></a>

### «Optional» tokenizer

**●  tokenizer**:  *[TokenizerFunction](../#tokenizerfunction)* 

*Defined in [libraries/botbuilder-choices/lib/findValues.d.ts:35](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/findValues.d.ts#L35)*



(Optional) tokenizer to use when parsing the utterance and values being recognized.




___


