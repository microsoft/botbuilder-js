**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / CustomQuestionAnswering

# Class: CustomQuestionAnswering

Query a Custom Question Answering knowledge base for answers and provide feedbacks.

**`summary`** 
This class is used to make queries to a single QnA Maker knowledge base and return the result.

Use this to process incoming messages with the [getAnswers()](#getAnswers) method.

## Hierarchy

* **CustomQuestionAnswering**

## Implements

* [QnAMakerClient](../interfaces/botbuilder_ai.qnamakerclient-1.md)
* [QnAMakerTelemetryClient](../interfaces/botbuilder_ai.qnamakertelemetryclient-1.md)

## Index

### Constructors

* [constructor](botbuilder_ai.customquestionanswering.md#constructor)

### Accessors

* [logPersonalInformation](botbuilder_ai.customquestionanswering.md#logpersonalinformation)
* [telemetryClient](botbuilder_ai.customquestionanswering.md#telemetryclient)

### Methods

* [callTrain](botbuilder_ai.customquestionanswering.md#calltrain)
* [fillQnAEvent](botbuilder_ai.customquestionanswering.md#fillqnaevent)
* [getAnswers](botbuilder_ai.customquestionanswering.md#getanswers)
* [getAnswersRaw](botbuilder_ai.customquestionanswering.md#getanswersraw)
* [getKnowledgebaseAnswersRaw](botbuilder_ai.customquestionanswering.md#getknowledgebaseanswersraw)
* [getLowScoreVariation](botbuilder_ai.customquestionanswering.md#getlowscorevariation)
* [onQnaResults](botbuilder_ai.customquestionanswering.md#onqnaresults)

## Constructors

### constructor

\+ **new CustomQuestionAnswering**(`endpoint`: QnAMakerEndpoint, `options?`: QnAMakerOptions, `telemetryClient?`: BotTelemetryClient, `logPersonalInformation?`: boolean): [CustomQuestionAnswering](botbuilder_ai.customquestionanswering.md)

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:98*

Creates a new CustomQuestionAnswering instance.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`endpoint` | QnAMakerEndpoint | The endpoint of the knowledge base to query. |
`options?` | QnAMakerOptions | (Optional) additional settings used to configure the instance. |
`telemetryClient?` | BotTelemetryClient | The BotTelemetryClient used for logging telemetry events. |
`logPersonalInformation?` | boolean | Set to true to include personally indentifiable information in telemetry events.  |

**Returns:** [CustomQuestionAnswering](botbuilder_ai.customquestionanswering.md)

## Accessors

### logPersonalInformation

• get **logPersonalInformation**(): boolean

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:113*

Gets a value indicating whether determines whether to log personal information that came from the user.

**Returns:** boolean

True to determine whether to log personal information that came from the user; otherwise, false.

___

### telemetryClient

• get **telemetryClient**(): BotTelemetryClient

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:119*

Gets the currently configured BotTelemetryClient that logs the events.

**Returns:** BotTelemetryClient

Currently configured BotTelemetryClient that logs the events.

## Methods

### callTrain

▸ **callTrain**(`feedbackRecords`: FeedbackRecords): Promise\<void>

*Implementation of [QnAMakerClient](../interfaces/botbuilder_ai.qnamakerclient-1.md)*

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:183*

Send feedback to the knowledge base.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`feedbackRecords` | FeedbackRecords | FeedbackRecords for Active Learning. |

**Returns:** Promise\<void>

A promise representing the async operation.

___

### fillQnAEvent

▸ `Protected`**fillQnAEvent**(`qnaResults`: QnAMakerResult[], `turnContext`: TurnContext, `telemetryProperties?`: Record\<string, string>, `telemetryMetrics?`: Record\<string, number>): Promise\<[Record\<string, string>, Record\<string, number>]>

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:208*

Fills the event properties for QnaMessage event for telemetry.
These properties are logged when the recognizer is called.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`qnaResults` | QnAMakerResult[] | Last activity sent from user. |
`turnContext` | TurnContext | Context object containing information for a single turn of conversation with a user. |
`telemetryProperties?` | Record\<string, string> | Additional properties to be logged to telemetry with the QnaMessage event. |
`telemetryMetrics?` | Record\<string, number> | Additional properties to be logged to telemetry with the QnaMessage event. |

**Returns:** Promise\<[Record\<string, string>, Record\<string, number>]>

A dictionary that is sent as properties to BotTelemetryClient.trackEvent method for the QnaMessage event.

___

### getAnswers

▸ **getAnswers**(`context`: TurnContext, `options?`: QnAMakerOptions, `telemetryProperties?`: { [key:string]: string;  }, `telemetryMetrics?`: { [key:string]: number;  }): Promise\<QnAMakerResult[]>

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:135*

Calls the Language service to generate answer(s) for a question.

**`summary`** 
Returns an array of answers sorted by score with the top scoring answer returned first.

In addition to returning the results from Language service, [getAnswers()](#getAnswers) will also
emit a trace activity that contains the query results.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`context` | TurnContext | The Turn Context that contains the user question to be queried against your knowledge base. |
`options?` | QnAMakerOptions | (Optional) The options for the Custom Question Answering knowledge base. If null, constructor option is used for this instance. |
`telemetryProperties?` | { [key:string]: string;  } | Additional properties to be logged to telemetry with the QnaMessage event. |
`telemetryMetrics?` | { [key:string]: number;  } | Additional metrics to be logged to telemetry with the QnaMessage event. |

**Returns:** Promise\<QnAMakerResult[]>

A promise resolving to the QnAMaker result

___

### getAnswersRaw

▸ **getAnswersRaw**(`context`: TurnContext, `options`: QnAMakerOptions, `telemetryProperties`: { [key:string]: string;  }, `telemetryMetrics`: { [key:string]: number;  }): Promise\<QnAMakerResults>

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:149*

Generates an answer from the knowledge base.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`context` | TurnContext | The [TurnContext](xref:botbuilder-core.TurnContext) that contains the user question to be queried against your knowledge base. |
`options` | QnAMakerOptions | Optional. The [QnAMakerOptions](xref:botbuilder-ai.QnAMakerOptions) for the Custom Question Answering knowledge base. If null, constructor option is used for this instance. |
`telemetryProperties` | { [key:string]: string;  } | Optional. Additional properties to be logged to telemetry with the QnaMessage event. |
`telemetryMetrics` | { [key:string]: number;  } | Optional. Additional metrics to be logged to telemetry with the QnaMessage event. |

**Returns:** Promise\<QnAMakerResults>

A list of answers for the user query, sorted in decreasing order of ranking score.

___

### getKnowledgebaseAnswersRaw

▸ **getKnowledgebaseAnswersRaw**(`context`: TurnContext, `options`: QnAMakerOptions, `telemetryProperties`: { [key:string]: string;  }, `telemetryMetrics`: { [key:string]: number;  }): Promise\<QnAMakerResults>

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:163*

Queries for answers from the Language Service project's knowledge base.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`context` | TurnContext | The [TurnContext](xref:botbuilder-core.TurnContext) that contains the user question to be queried against your knowledge base. |
`options` | QnAMakerOptions | Optional. The [QnAMakerOptions](xref:botbuilder-ai.QnAMakerOptions) for the Language Service project's knowledge base. If null, constructor option is used for this instance. |
`telemetryProperties` | { [key:string]: string;  } | Optional. Additional properties to be logged to telemetry with the QnaMessage event. |
`telemetryMetrics` | { [key:string]: number;  } | Optional. Additional metrics to be logged to telemetry with the QnaMessage event. |

**Returns:** Promise\<QnAMakerResults>

A list of answers for the user query, sorted in decreasing order of ranking score.

___

### getLowScoreVariation

▸ **getLowScoreVariation**(`queryResult`: QnAMakerResult[]): QnAMakerResult[]

*Implementation of [QnAMakerClient](../interfaces/botbuilder_ai.qnamakerclient-1.md)*

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:176*

Filters the ambiguous question for active learning.

**`summary`** Returns a filtered array of ambiguous question.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`queryResult` | QnAMakerResult[] | User query output. |

**Returns:** QnAMakerResult[]

the filtered results

___

### onQnaResults

▸ `Protected`**onQnaResults**(`qnaResults`: QnAMakerResult[], `turnContext`: TurnContext, `telemetryProperties?`: { [key:string]: string;  }, `telemetryMetrics?`: { [key:string]: number;  }): Promise\<void>

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:193*

Invoked prior to a QnaMessage Event being logged.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`qnaResults` | QnAMakerResult[] | The QnA Results for the call. |
`turnContext` | TurnContext | Context object containing information for a single turn of conversation with a user. |
`telemetryProperties?` | { [key:string]: string;  } | Additional properties to be logged to telemetry with the QnaMessage event. |
`telemetryMetrics?` | { [key:string]: number;  } | Additional metrics to be logged to telemetry with the QnaMessage event. |

**Returns:** Promise\<void>

A promise representing the async operation
