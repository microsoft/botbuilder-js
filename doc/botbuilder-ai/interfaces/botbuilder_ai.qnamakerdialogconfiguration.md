**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / QnAMakerDialogConfiguration

# Interface: QnAMakerDialogConfiguration

## Hierarchy

* any

  ↳ **QnAMakerDialogConfiguration**

## Implemented by

* [QnAMakerDialog](../classes/botbuilder_ai.qnamakerdialog.md)

## Index

### Properties

* [activeLearningCardTitle](botbuilder_ai.qnamakerdialogconfiguration.md#activelearningcardtitle)
* [cardNoMatchResponse](botbuilder_ai.qnamakerdialogconfiguration.md#cardnomatchresponse)
* [cardNoMatchText](botbuilder_ai.qnamakerdialogconfiguration.md#cardnomatchtext)
* [displayPreciseAnswerOnly](botbuilder_ai.qnamakerdialogconfiguration.md#displaypreciseansweronly)
* [endpointKey](botbuilder_ai.qnamakerdialogconfiguration.md#endpointkey)
* [hostname](botbuilder_ai.qnamakerdialogconfiguration.md#hostname)
* [includeUnstructuredSources](botbuilder_ai.qnamakerdialogconfiguration.md#includeunstructuredsources)
* [isTest](botbuilder_ai.qnamakerdialogconfiguration.md#istest)
* [knowledgeBaseId](botbuilder_ai.qnamakerdialogconfiguration.md#knowledgebaseid)
* [logPersonalInformation](botbuilder_ai.qnamakerdialogconfiguration.md#logpersonalinformation)
* [noAnswer](botbuilder_ai.qnamakerdialogconfiguration.md#noanswer)
* [rankerType](botbuilder_ai.qnamakerdialogconfiguration.md#rankertype)
* [strictFilters](botbuilder_ai.qnamakerdialogconfiguration.md#strictfilters)
* [strictFiltersJoinOperator](botbuilder_ai.qnamakerdialogconfiguration.md#strictfiltersjoinoperator)
* [threshold](botbuilder_ai.qnamakerdialogconfiguration.md#threshold)
* [top](botbuilder_ai.qnamakerdialogconfiguration.md#top)
* [useTeamsAdaptiveCard](botbuilder_ai.qnamakerdialogconfiguration.md#useteamsadaptivecard)

## Properties

### activeLearningCardTitle

• `Optional` **activeLearningCardTitle**: string \| Expression \| StringExpression

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:60*

___

### cardNoMatchResponse

• `Optional` **cardNoMatchResponse**: string \| Partial\<Activity> \| TemplateInterface\<Partial\<Activity>, DialogStateManager>

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:62*

___

### cardNoMatchText

• `Optional` **cardNoMatchText**: string \| Expression \| StringExpression

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:61*

___

### displayPreciseAnswerOnly

• `Optional` **displayPreciseAnswerOnly**: boolean

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:67*

___

### endpointKey

• `Optional` **endpointKey**: string \| Expression \| StringExpression

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:56*

___

### hostname

• `Optional` **hostname**: string \| Expression \| StringExpression

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:55*

___

### includeUnstructuredSources

• `Optional` **includeUnstructuredSources**: boolean

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:69*

___

### isTest

• `Optional` **isTest**: boolean

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:65*

___

### knowledgeBaseId

• `Optional` **knowledgeBaseId**: string \| Expression \| StringExpression

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:54*

___

### logPersonalInformation

• `Optional` **logPersonalInformation**: boolean \| string \| Expression \| BoolExpression

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:64*

___

### noAnswer

• `Optional` **noAnswer**: string \| Partial\<Activity> \| TemplateInterface\<Partial\<Activity>, DialogStateManager>

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:59*

___

### rankerType

• `Optional` **rankerType**: RankerTypes \| string \| Expression \| EnumExpression\<RankerTypes>

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:66*

___

### strictFilters

• `Optional` **strictFilters**: QnAMakerMetadata[] \| string \| Expression \| ArrayExpression\<QnAMakerMetadata>

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:63*

___

### strictFiltersJoinOperator

• `Optional` **strictFiltersJoinOperator**: JoinOperator

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:68*

___

### threshold

• `Optional` **threshold**: number \| string \| Expression \| NumberExpression

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:57*

___

### top

• `Optional` **top**: number \| string \| Expression \| IntExpression

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:58*

___

### useTeamsAdaptiveCard

• `Optional` **useTeamsAdaptiveCard**: boolean

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:70*
