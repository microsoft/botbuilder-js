**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / QnAMakerDialog

# Class: QnAMakerDialog

A dialog that supports multi-step and adaptive-learning QnA Maker services.

**`summary`** 
An instance of this class targets a specific QnA Maker knowledge base.
It supports knowledge bases that include follow-up prompt and active learning features.
The dialog will also present user with appropriate multi-turn prompt or active learning options.

## Hierarchy

* any

  ↳ **QnAMakerDialog**

## Implements

* [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md)

## Index

### Constructors

* [constructor](botbuilder_ai.qnamakerdialog.md#constructor)

### Properties

* [activeLearningCardTitle](botbuilder_ai.qnamakerdialog.md#activelearningcardtitle)
* [cardNoMatchResponse](botbuilder_ai.qnamakerdialog.md#cardnomatchresponse)
* [cardNoMatchText](botbuilder_ai.qnamakerdialog.md#cardnomatchtext)
* [defaultThreshold](botbuilder_ai.qnamakerdialog.md#defaultthreshold)
* [defaultTopN](botbuilder_ai.qnamakerdialog.md#defaulttopn)
* [displayPreciseAnswerOnly](botbuilder_ai.qnamakerdialog.md#displaypreciseansweronly)
* [enablePreciseAnswer](botbuilder_ai.qnamakerdialog.md#enablepreciseanswer)
* [endpointKey](botbuilder_ai.qnamakerdialog.md#endpointkey)
* [filters](botbuilder_ai.qnamakerdialog.md#filters)
* [hostname](botbuilder_ai.qnamakerdialog.md#hostname)
* [includeUnstructuredSources](botbuilder_ai.qnamakerdialog.md#includeunstructuredsources)
* [isTest](botbuilder_ai.qnamakerdialog.md#istest)
* [knowledgeBaseId](botbuilder_ai.qnamakerdialog.md#knowledgebaseid)
* [logPersonalInformation](botbuilder_ai.qnamakerdialog.md#logpersonalinformation)
* [noAnswer](botbuilder_ai.qnamakerdialog.md#noanswer)
* [options](botbuilder_ai.qnamakerdialog.md#options)
* [previousQnAId](botbuilder_ai.qnamakerdialog.md#previousqnaid)
* [qnAContextData](botbuilder_ai.qnamakerdialog.md#qnacontextdata)
* [qnaServiceType](botbuilder_ai.qnamakerdialog.md#qnaservicetype)
* [rankerType](botbuilder_ai.qnamakerdialog.md#rankertype)
* [strictFilters](botbuilder_ai.qnamakerdialog.md#strictfilters)
* [strictFiltersJoinOperator](botbuilder_ai.qnamakerdialog.md#strictfiltersjoinoperator)
* [threshold](botbuilder_ai.qnamakerdialog.md#threshold)
* [top](botbuilder_ai.qnamakerdialog.md#top)
* [useTeamsAdaptiveCard](botbuilder_ai.qnamakerdialog.md#useteamsadaptivecard)
* [$kind](botbuilder_ai.qnamakerdialog.md#$kind)

### Methods

* [beginDialog](botbuilder_ai.qnamakerdialog.md#begindialog)
* [continueDialog](botbuilder_ai.qnamakerdialog.md#continuedialog)
* [displayQnAResult](botbuilder_ai.qnamakerdialog.md#displayqnaresult)
* [getConverter](botbuilder_ai.qnamakerdialog.md#getconverter)
* [getQnAMakerClient](botbuilder_ai.qnamakerdialog.md#getqnamakerclient)
* [getQnAMakerOptions](botbuilder_ai.qnamakerdialog.md#getqnamakeroptions)
* [getQnAResponseOptions](botbuilder_ai.qnamakerdialog.md#getqnaresponseoptions)
* [onPreBubbleEvent](botbuilder_ai.qnamakerdialog.md#onprebubbleevent)

## Constructors

### constructor

\+ **new QnAMakerDialog**(`knowledgeBaseId?`: string, `endpointKey?`: string, `hostname?`: string, `noAnswer?`: Activity, `threshold?`: number, `activeLearningCardTitle?`: string, `cardNoMatchText?`: string, `top?`: number, `cardNoMatchResponse?`: Activity, `rankerType?`: RankerTypes, `strictFilters?`: QnAMakerMetadata[], `dialogId?`: string, `strictFiltersJoinOperator?`: JoinOperator, `enablePreciseAnswer?`: boolean, `displayPreciseAnswerOnly?`: boolean, `qnaServiceType?`: [ServiceType](../enums/botbuilder_ai.servicetype.md), `useTeamsAdaptiveCard?`: boolean): [QnAMakerDialog](botbuilder_ai.qnamakerdialog.md)

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:225*

Initializes a new instance of the [QnAMakerDialog](xref:QnAMakerDialog) class.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`knowledgeBaseId?` | string | The ID of the QnA Maker knowledge base to query. |
`endpointKey?` | string | The QnA Maker endpoint key to use to query the knowledge base. |
`hostname?` | string | The QnA Maker host URL for the knowledge base, starting with "https://" and ending with "/qnamaker". |
`noAnswer?` | Activity | (Optional) The activity to send the user when QnA Maker does not find an answer. |
`threshold?` | number | (Optional) The threshold above which to treat answers found from the knowledgebase as a match. |
`activeLearningCardTitle?` | string | (Optional) The card title to use when showing active learning options to the user, if active learning is enabled. |
`cardNoMatchText?` | string | (Optional) The button text to use with active learning options, allowing a user to indicate none of the options are applicable. |
`top?` | number | (Optional) Maximum number of answers to return from the knowledge base. |
`cardNoMatchResponse?` | Activity | (Optional) The activity to send the user if they select the no match option on an active learning card. |
`rankerType?` | RankerTypes | - |
`strictFilters?` | QnAMakerMetadata[] | (Optional) QnA Maker metadata with which to filter or boost queries to the knowledge base; or null to apply none. |
`dialogId?` | string | (Optional) Id of the created dialog. Default is 'QnAMakerDialog'. |
`strictFiltersJoinOperator?` | JoinOperator | join operator for strict filters |
`enablePreciseAnswer?` | boolean | - |
`displayPreciseAnswerOnly?` | boolean | - |
`qnaServiceType?` | [ServiceType](../enums/botbuilder_ai.servicetype.md) | - |
`useTeamsAdaptiveCard?` | boolean | boolean setting for using Teams Adaptive Cards instead of Hero Cards  |

**Returns:** [QnAMakerDialog](botbuilder_ai.qnamakerdialog.md)

\+ **new QnAMakerDialog**(`knowledgeBaseId?`: string, `endpointKey?`: string, `hostname?`: string, `noAnswer?`: Activity, `threshold?`: number, `suggestionsActivityFactory?`: [QnASuggestionsActivityFactory](../README.md#qnasuggestionsactivityfactory), `cardNoMatchText?`: string, `top?`: number, `cardNoMatchResponse?`: Activity, `rankerType?`: RankerTypes, `strictFilters?`: QnAMakerMetadata[], `dialogId?`: string, `strictFiltersJoinOperator?`: JoinOperator, `enablePreciseAnswer?`: boolean, `displayPreciseAnswerOnly?`: boolean, `qnaServiceType?`: [ServiceType](../enums/botbuilder_ai.servicetype.md), `useTeamsAdaptiveCard?`: boolean): [QnAMakerDialog](botbuilder_ai.qnamakerdialog.md)

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:243*

Initializes a new instance of the [QnAMakerDialog](xref:QnAMakerDialog) class.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`knowledgeBaseId?` | string | The ID of the QnA Maker knowledge base to query. |
`endpointKey?` | string | The QnA Maker endpoint key to use to query the knowledge base. |
`hostname?` | string | The QnA Maker host URL for the knowledge base, starting with "https://" and ending with "/qnamaker". |
`noAnswer?` | Activity | (Optional) The activity to send the user when QnA Maker does not find an answer. |
`threshold?` | number | (Optional) The threshold above which to treat answers found from the knowledgebase as a match. |
`suggestionsActivityFactory?` | [QnASuggestionsActivityFactory](../README.md#qnasuggestionsactivityfactory) | (xref:botbuilder-ai.QnASuggestionsActivityFactory) used for custom Activity formatting. |
`cardNoMatchText?` | string | (Optional) The button text to use with active learning options, allowing a user to indicate none of the options are applicable. |
`top?` | number | (Optional) Maximum number of answers to return from the knowledge base. |
`cardNoMatchResponse?` | Activity | (Optional) The activity to send the user if they select the no match option on an active learning card. |
`rankerType?` | RankerTypes | - |
`strictFilters?` | QnAMakerMetadata[] | (Optional) QnA Maker metadata with which to filter or boost queries to the knowledge base; or null to apply none. |
`dialogId?` | string | (Optional) Id of the created dialog. Default is 'QnAMakerDialog'. |
`strictFiltersJoinOperator?` | JoinOperator | join operator for strict filters |
`enablePreciseAnswer?` | boolean | - |
`displayPreciseAnswerOnly?` | boolean | - |
`qnaServiceType?` | [ServiceType](../enums/botbuilder_ai.servicetype.md) | - |
`useTeamsAdaptiveCard?` | boolean | boolean setting for using Teams Adaptive Cards instead of Hero Cards  |

**Returns:** [QnAMakerDialog](botbuilder_ai.qnamakerdialog.md)

## Properties

### activeLearningCardTitle

•  **activeLearningCardTitle**: StringExpression

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[activeLearningCardTitle](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#activelearningcardtitle)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:162*

Gets or sets the card title to use when showing active learning options to the user.

_Note: If suggestionsActivityFactory is passed in, this member is unused._

___

### cardNoMatchResponse

•  **cardNoMatchResponse**: TemplateInterface\<Partial\<Activity>, DialogStateManager>

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[cardNoMatchResponse](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#cardnomatchresponse)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:174*

Gets or sets the template to send to the user if they select the no match option on an
active learning card.

___

### cardNoMatchText

•  **cardNoMatchText**: StringExpression

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[cardNoMatchText](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#cardnomatchtext)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:169*

Gets or sets the button text to use with active learning options, allowing a user to
indicate non of the options are applicable.

_Note: If suggestionsActivityFactory is passed in, this member is required._

___

### defaultThreshold

• `Protected` **defaultThreshold**: number

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:121*

The default threshold for answers returned, based on score.

___

### defaultTopN

• `Protected` **defaultTopN**: number

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:125*

The default maximum number of answers to be returned for the question.

___

### displayPreciseAnswerOnly

•  **displayPreciseAnswerOnly**: boolean

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[displayPreciseAnswerOnly](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#displaypreciseansweronly)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:203*

Gets or sets a value indicating whether the dialog response should display only precise answers.

___

### enablePreciseAnswer

•  **enablePreciseAnswer**: boolean

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:199*

Gets or sets a value indicating whether to include precise answer in response.

___

### endpointKey

•  **endpointKey**: StringExpression

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[endpointKey](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#endpointkey)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:144*

Gets or sets the QnA Maker endpoint key to use to query the knowledge base.

___

### filters

•  **filters**: [Filters](../interfaces/botbuilder_ai.filters.md)

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:215*

Gets or sets the metadata and sources used to filter results.

___

### hostname

•  **hostname**: StringExpression

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[hostname](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#hostname)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:140*

Gets or sets the QnA Maker host URL for the knowledge base.

___

### includeUnstructuredSources

•  **includeUnstructuredSources**: boolean

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[includeUnstructuredSources](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#includeunstructuredsources)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:219*

Gets or sets a value indicating whether to include unstructured sources in search for answers.

___

### isTest

•  **isTest**: boolean

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[isTest](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#istest)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:191*

Gets or sets a value indicating whether gets or sets environment of knowledgebase to be called.

___

### knowledgeBaseId

•  **knowledgeBaseId**: StringExpression

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[knowledgeBaseId](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#knowledgebaseid)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:136*

Gets or sets the QnA Maker knowledge base ID to query.

___

### logPersonalInformation

•  **logPersonalInformation**: BoolExpression

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[logPersonalInformation](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#logpersonalinformation)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:187*

Gets or sets the flag to determine if personal information should be logged in telemetry.

**`summary`** 
Defaults to a value of `=settings.telemetry.logPersonalInformation`, which retrieves
`logPersonalInformation` flag from settings.

___

### noAnswer

•  **noAnswer**: TemplateInterface\<Partial\<Activity>, DialogStateManager>

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[noAnswer](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#noanswer)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:156*

Gets or sets the template to send to the user when QnA Maker does not find an answer.

___

### options

• `Protected` **options**: string

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:117*

The path for storing and retrieving the options for this instance of the dialog.

**`summary`** 
This includes the options with which the dialog was started and options expected by the QnA Maker service.
It is stored within the current step's [WaterfallStepContext](xref:botbuilder-dialogs.WaterfallStepContext).
It supports QnA Maker and the dialog system.

___

### previousQnAId

• `Protected` **previousQnAId**: string

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:108*

The path for storing and retrieving the previous question ID.

**`summary`** 
This represents the QnA question ID from the previous turn.
It is stored within the current step's [WaterfallStepContext](xref:botbuilder-dialogs.WaterfallStepContext).
It supports QnA Maker's follow-up prompt and active learning features.

___

### qnAContextData

• `Protected` **qnAContextData**: string

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:99*

The path for storing and retrieving QnA Maker context data.

**`summary`** 
This represents context about the current or previous call to QnA Maker.
It is stored within the current step's [WaterfallStepContext](xref:botbuilder-dialogs.WaterfallStepContext).
It supports QnA Maker's follow-up prompt and active learning features.

___

### qnaServiceType

•  **qnaServiceType**: [ServiceType](../enums/botbuilder_ai.servicetype.md)

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:207*

Question answering service type - qnaMaker or language

___

### rankerType

•  **rankerType**: EnumExpression\<RankerTypes>

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[rankerType](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#rankertype)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:195*

Gets or sets the QnA Maker ranker type to use.

___

### strictFilters

•  **strictFilters**: QnAMakerMetadata[]

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[strictFilters](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#strictfilters)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:179*

Gets or sets the QnA Maker metadata with which to filter or boost queries to the knowledge base,
or null to apply none.

___

### strictFiltersJoinOperator

•  **strictFiltersJoinOperator**: JoinOperator

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[strictFiltersJoinOperator](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#strictfiltersjoinoperator)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:211*

Gets or sets a value - AND or OR - logical operation on list of metadata

___

### threshold

•  **threshold**: NumberExpression

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[threshold](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#threshold)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:148*

Gets or sets the threshold for answers returned, based on score.

___

### top

•  **top**: IntExpression

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[top](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#top)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:152*

Gets or sets the maximum number of answers to return from the knowledge base.

___

### useTeamsAdaptiveCard

•  **useTeamsAdaptiveCard**: boolean

*Implementation of [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md).[useTeamsAdaptiveCard](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md#useteamsadaptivecard)*

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:223*

Gets or sets a value indicating whether to use a Teams-formatted Adaptive Card in responses instead of a generic Hero Card.

___

### $kind

▪ `Static` **$kind**: string

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:90*

## Methods

### beginDialog

▸ **beginDialog**(`dc`: DialogContext, `options?`: object): Promise\<DialogTurnResult>

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:282*

Called when the dialog is started and pushed onto the dialog stack.

**`summary`** 
If the task is successful, the result indicates whether the dialog is still
active after the turn has been processed by the dialog.

You can use the [options](#options) parameter to include the QnA Maker context data,
which represents context from the previous query. To do so, the value should include a
`context` property of type [QnAResponseContext](#QnAResponseContext).

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`dc` | DialogContext | The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation. |
`options?` | object | (Optional) Initial information to pass to the dialog. |

**Returns:** Promise\<DialogTurnResult>

A promise resolving to the turn result

___

### continueDialog

▸ **continueDialog**(`dc`: DialogContext): Promise\<DialogTurnResult>

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:290*

Called when the dialog is _continued_, where it is the active dialog and the
user replies with a new [Activity](xref:botframework-schema.Activity).

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`dc` | DialogContext | The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation. |

**Returns:** Promise\<DialogTurnResult>

A Promise representing the asynchronous operation.

___

### displayQnAResult

▸ `Protected`**displayQnAResult**(`step`: WaterfallStepContext): Promise\<DialogTurnResult>

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:328*

Displays an appropriate response based on the incoming result to the user. If an answer has been identified it
is sent to the user. Alternatively, if no answer has been identified or the user has indicated 'no match' on an
active learning card, then an appropriate message is sent to the user.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`step` | WaterfallStepContext | the waterfall step context |

**Returns:** Promise\<DialogTurnResult>

a promise resolving to the dialog turn result

___

### getConverter

▸ **getConverter**(`property`: keyof [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md)): Converter \| ConverterFactory

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:266*

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`property` | keyof [QnAMakerDialogConfiguration](../interfaces/botbuilder_ai.qnamakerdialogconfiguration.md) | Properties that extend QnAMakerDialogConfiguration. |

**Returns:** Converter \| ConverterFactory

The expression converter.

___

### getQnAMakerClient

▸ `Protected`**getQnAMakerClient**(`dc`: DialogContext): Promise\<[QnAMakerClient](../interfaces/botbuilder_ai.qnamakerclient.md)>

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:305*

Gets an [QnAMakerClient](xref:botbuilder-ai.QnAMakerClient) to use to access the QnA Maker knowledge base.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`dc` | DialogContext | The dialog context for the current turn of conversation. |

**Returns:** Promise\<[QnAMakerClient](../interfaces/botbuilder_ai.qnamakerclient.md)>

A promise of QnA Maker instance.

___

### getQnAMakerOptions

▸ `Protected`**getQnAMakerOptions**(`dc`: DialogContext): Promise\<QnAMakerOptions>

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:312*

Gets the options for the QnA Maker client that the dialog will use to query the knowledge base.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`dc` | DialogContext | The dialog context for the current turn of conversation. |

**Returns:** Promise\<QnAMakerOptions>

A promise of QnA Maker options to use.

___

### getQnAResponseOptions

▸ `Protected`**getQnAResponseOptions**(`dc`: DialogContext): Promise\<[QnAMakerDialogResponseOptions](../interfaces/botbuilder_ai.qnamakerdialogresponseoptions.md)>

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:319*

Gets the options the dialog will use to display query results to the user.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`dc` | DialogContext | The dialog context for the current turn of conversation. |

**Returns:** Promise\<[QnAMakerDialogResponseOptions](../interfaces/botbuilder_ai.qnamakerdialogresponseoptions.md)>

A promise of QnA Maker response options to use.

___

### onPreBubbleEvent

▸ `Protected`**onPreBubbleEvent**(`dc`: DialogContext, `e`: DialogEvent): Promise\<boolean>

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:298*

Called before an event is bubbled to its parent.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`dc` | DialogContext | The dialog context for the current turn of conversation. |
`e` | DialogEvent | The event being raised. |

**Returns:** Promise\<boolean>

Whether the event is handled by the current dialog and further processing should stop.
