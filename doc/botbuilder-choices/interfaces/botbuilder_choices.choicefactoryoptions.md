[Bot Builder SDK - Choices](../README.md) > [ChoiceFactoryOptions](../interfaces/botbuilder_choices.choicefactoryoptions.md)



# Interface: ChoiceFactoryOptions


:package: **botbuilder-choices**

Additional options used to tweak the formatting of choice lists.


## Properties
<a id="includenumbers"></a>

### «Optional» includeNumbers

**●  includeNumbers**:  *`boolean`* 

*Defined in [libraries/botbuilder-choices/lib/choiceFactory.d.ts:36](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/choiceFactory.d.ts#L36)*



(Optional) if `true`, inline and list style choices will be prefixed with the index of the choice as in "1\. choice". If `false`, the list style will use a bulleted list instead. The default value is `true`.




___

<a id="inlineor"></a>

### «Optional» inlineOr

**●  inlineOr**:  *`string`* 

*Defined in [libraries/botbuilder-choices/lib/choiceFactory.d.ts:25](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/choiceFactory.d.ts#L25)*



(Optional) separator inserted between the choices when their are only 2 choices. The default value is `" or "`.




___

<a id="inlineormore"></a>

### «Optional» inlineOrMore

**●  inlineOrMore**:  *`string`* 

*Defined in [libraries/botbuilder-choices/lib/choiceFactory.d.ts:30](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/choiceFactory.d.ts#L30)*



(Optional) separator inserted between the last 2 choices when their are more than 2 choices. The default value is `", or "`.




___

<a id="inlineseparator"></a>

### «Optional» inlineSeparator

**●  inlineSeparator**:  *`string`* 

*Defined in [libraries/botbuilder-choices/lib/choiceFactory.d.ts:20](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/choiceFactory.d.ts#L20)*



(Optional) character used to separate individual choices when there are more than 2 choices. The default value is `", "`.




___


