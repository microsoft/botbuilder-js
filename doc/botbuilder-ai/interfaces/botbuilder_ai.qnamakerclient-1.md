**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / QnAMakerClient

# Interface: QnAMakerClient

Client to access a Custom Question Answering knowledge base.

## Hierarchy

* **QnAMakerClient**

## Implemented by

* [CustomQuestionAnswering](../classes/botbuilder_ai.customquestionanswering.md)

## Index

### Methods

* [callTrain](botbuilder_ai.qnamakerclient-1.md#calltrain)
* [getAnswers](botbuilder_ai.qnamakerclient-1.md#getanswers)
* [getAnswersRaw](botbuilder_ai.qnamakerclient-1.md#getanswersraw)
* [getLowScoreVariation](botbuilder_ai.qnamakerclient-1.md#getlowscorevariation)

## Methods

### callTrain

▸ **callTrain**(`feedbackRecords`: FeedbackRecords): Promise\<void>

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:50*

Send feedback to the knowledge base.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`feedbackRecords` | FeedbackRecords | A list of Feedback Records for Active Learning.  |

**Returns:** Promise\<void>

___

### getAnswers

▸ **getAnswers**(`turnContext`: TurnContext, `options?`: QnAMakerOptions, `telemetryProperties?`: Record\<string, string>, `telemetryMetrics?`: Record\<string, number>): Promise\<QnAMakerResult[]>

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:27*

Generates an answer from the project.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`turnContext` | TurnContext | The Turn Context that contains the user question to be queried against your knowledge base. |
`options?` | QnAMakerOptions | The options for the Custom Question Answering Knowledge Base. If null, constructor option is used for this instance. |
`telemetryProperties?` | Record\<string, string> | Additional properties to be logged to telemetry with the QnaMessage event. |
`telemetryMetrics?` | Record\<string, number> | Additional metrics to be logged to telemetry with the QnaMessage event. |

**Returns:** Promise\<QnAMakerResult[]>

A list of answers for the user query, sorted in decreasing order of ranking score.

___

### getAnswersRaw

▸ **getAnswersRaw**(`turnContext`: TurnContext, `options?`: QnAMakerOptions, `telemetryProperties?`: Record\<string, string>, `telemetryMetrics?`: Record\<string, number>): Promise\<QnAMakerResults>

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:37*

Generates an answer from the knowledge base.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`turnContext` | TurnContext | The Turn Context that contains the user question to be queried against your knowledge base. |
`options?` | QnAMakerOptions | The options for the Custom Question Answering knowledge base. If null, constructor option is used for this instance. |
`telemetryProperties?` | Record\<string, string> | Additional properties to be logged to telemetry with the QnaMessage event. |
`telemetryMetrics?` | Record\<string, number> | Additional metrics to be logged to telemetry with the QnaMessage event. |

**Returns:** Promise\<QnAMakerResults>

A list of answers for the user query, sorted in decreasing order of ranking score.

___

### getLowScoreVariation

▸ **getLowScoreVariation**(`queryResult`: QnAMakerResult[]): QnAMakerResult[]

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:44*

Filters the ambiguous question for active learning.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`queryResult` | QnAMakerResult[] | User query output. |

**Returns:** QnAMakerResult[]

Filtered array of ambiguous question.
