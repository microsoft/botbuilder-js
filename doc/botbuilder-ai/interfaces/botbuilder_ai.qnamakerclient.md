**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / QnAMakerClient

# Interface: QnAMakerClient

Client to access a QnA Maker knowledge base.

## Hierarchy

* **QnAMakerClient**

## Implemented by

* [QnAMaker](../classes/botbuilder_ai.qnamaker.md)

## Index

### Methods

* [callTrain](botbuilder_ai.qnamakerclient.md#calltrain)
* [getAnswers](botbuilder_ai.qnamakerclient.md#getanswers)
* [getAnswersRaw](botbuilder_ai.qnamakerclient.md#getanswersraw)
* [getLowScoreVariation](botbuilder_ai.qnamakerclient.md#getlowscorevariation)

## Methods

### callTrain

▸ **callTrain**(`feedbackRecords`: FeedbackRecords): Promise\<void>

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:53*

Send feedback to the knowledge base.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`feedbackRecords` | FeedbackRecords | Feedback records.  |

**Returns:** Promise\<void>

___

### getAnswers

▸ **getAnswers**(`turnContext`: TurnContext, `options?`: QnAMakerOptions, `telemetryProperties?`: Record\<string, string>, `telemetryMetrics?`: Record\<string, number>): Promise\<QnAMakerResult[]>

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:30*

Generates an answer from the knowledge base.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`turnContext` | TurnContext | The Turn Context that contains the user question to be queried against your knowledge base. |
`options?` | QnAMakerOptions | The options for the QnA Maker knowledge base. If null, constructor option is used for this instance. |
`telemetryProperties?` | Record\<string, string> | Additional properties to be logged to telemetry with the QnaMessage event. |
`telemetryMetrics?` | Record\<string, number> | Additional metrics to be logged to telemetry with the QnaMessage event. |

**Returns:** Promise\<QnAMakerResult[]>

A list of answers for the user query, sorted in decreasing order of ranking score.

___

### getAnswersRaw

▸ **getAnswersRaw**(`turnContext`: TurnContext, `options?`: QnAMakerOptions, `telemetryProperties?`: Record\<string, string>, `telemetryMetrics?`: Record\<string, number>): Promise\<QnAMakerResults>

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:40*

Generates an answer from the knowledge base.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`turnContext` | TurnContext | The Turn Context that contains the user question to be queried against your knowledge base. |
`options?` | QnAMakerOptions | The options for the QnA Maker knowledge base. If null, constructor option is used for this instance. |
`telemetryProperties?` | Record\<string, string> | Additional properties to be logged to telemetry with the QnaMessage event. |
`telemetryMetrics?` | Record\<string, number> | Additional metrics to be logged to telemetry with the QnaMessage event. |

**Returns:** Promise\<QnAMakerResults>

A list of answers for the user query, sorted in decreasing order of ranking score.

___

### getLowScoreVariation

▸ **getLowScoreVariation**(`queryResult`: QnAMakerResult[]): QnAMakerResult[]

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:47*

Filters the ambiguous question for active learning.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`queryResult` | QnAMakerResult[] | User query output. |

**Returns:** QnAMakerResult[]

Filtered array of ambiguous question.
