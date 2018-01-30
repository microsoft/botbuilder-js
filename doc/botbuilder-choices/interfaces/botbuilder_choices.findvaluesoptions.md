[Bot Builder SDK - Choices](../README.md) > [FindValuesOptions](../interfaces/botbuilder_choices.findvaluesoptions.md)



# Interface: FindValuesOptions

## Hierarchy

**FindValuesOptions**

↳  [FindChoicesOptions](botbuilder_choices.findchoicesoptions.md)









## Properties
<a id="allowpartialmatches"></a>

### «Optional» allowPartialMatches

**●  allowPartialMatches**:  *`undefined`⎮`true`⎮`false`* 

*Defined in [libraries/botbuilder-choices/lib/findValues.d.ts:12](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-choices/lib/findValues.d.ts#L12)*



(Optional) if true, then only some of the tokens in a value need to exist to be considered a match. The default value is "false".




___

<a id="locale"></a>

### «Optional» locale

**●  locale**:  *`undefined`⎮`string`* 

*Defined in [libraries/botbuilder-choices/lib/findValues.d.ts:16](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-choices/lib/findValues.d.ts#L16)*



(Optional) locale/culture code of the utterance. The default is `en-US`.




___

<a id="maxtokendistance"></a>

### «Optional» maxTokenDistance

**●  maxTokenDistance**:  *`undefined`⎮`number`* 

*Defined in [libraries/botbuilder-choices/lib/findValues.d.ts:23](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-choices/lib/findValues.d.ts#L23)*



(Optional) maximum tokens allowed between two matched tokens in the utterance. So with a max distance of 2 the value "second last" would match the utterance "second from the last" but it wouldn't match "Wait a second. That's not the last one is it?". The default value is "2".




___

<a id="tokenizer"></a>

### «Optional» tokenizer

**●  tokenizer**:  *[TokenizerFunction]()* 

*Defined in [libraries/botbuilder-choices/lib/findValues.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-choices/lib/findValues.d.ts#L27)*



(Optional) tokenizer to use when parsing the utterance and values being recognized.




___


