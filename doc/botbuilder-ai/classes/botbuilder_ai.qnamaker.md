**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / QnAMaker

# Class: QnAMaker

Query a QnA Maker knowledge base for answers and provide feedbacks.

**`summary`** 
This class is used to make queries to a single QnA Maker knowledge base and return the result.

Use this to process incoming messages with the [getAnswers()](#getAnswers) method.

## Hierarchy

* **QnAMaker**

## Implements

* [QnAMakerClient](../interfaces/botbuilder_ai.qnamakerclient.md)
* [QnAMakerTelemetryClient](../interfaces/botbuilder_ai.qnamakertelemetryclient.md)

## Index

### Constructors

* [constructor](botbuilder_ai.qnamaker.md#constructor)

### Accessors

* [logPersonalInformation](botbuilder_ai.qnamaker.md#logpersonalinformation)
* [telemetryClient](botbuilder_ai.qnamaker.md#telemetryclient)

### Methods

* [answer](botbuilder_ai.qnamaker.md#answer)
* [callService](botbuilder_ai.qnamaker.md#callservice)
* [callTrain](botbuilder_ai.qnamaker.md#calltrain)
* [fillQnAEvent](botbuilder_ai.qnamaker.md#fillqnaevent)
* [generateAnswer](botbuilder_ai.qnamaker.md#generateanswer)
* [getAnswers](botbuilder_ai.qnamaker.md#getanswers)
* [getAnswersRaw](botbuilder_ai.qnamaker.md#getanswersraw)
* [getLegacyAnswersRaw](botbuilder_ai.qnamaker.md#getlegacyanswersraw)
* [getLowScoreVariation](botbuilder_ai.qnamaker.md#getlowscorevariation)
* [onQnaResults](botbuilder_ai.qnamaker.md#onqnaresults)

## Constructors

### constructor

\+ **new QnAMaker**(`endpoint`: QnAMakerEndpoint, `options?`: QnAMakerOptions, `telemetryClient?`: BotTelemetryClient, `logPersonalInformation?`: boolean): [QnAMaker](botbuilder_ai.qnamaker.md)

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:102*

Creates a new QnAMaker instance.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`endpoint` | QnAMakerEndpoint | The endpoint of the knowledge base to query. |
`options?` | QnAMakerOptions | (Optional) additional settings used to configure the instance. |
`telemetryClient?` | BotTelemetryClient | The BotTelemetryClient used for logging telemetry events. |
`logPersonalInformation?` | boolean | Set to true to include personally identifiable information in telemetry events.  |

**Returns:** [QnAMaker](botbuilder_ai.qnamaker.md)

## Accessors

### logPersonalInformation

• get **logPersonalInformation**(): boolean

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:117*

Gets a value indicating whether determines whether to log personal information that came from the user.

**Returns:** boolean

True if will log personal information into the BotTelemetryClient.TrackEvent method; otherwise the properties will be filtered.

___

### telemetryClient

• get **telemetryClient**(): BotTelemetryClient

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:123*

Gets the currently configured BotTelemetryClient that logs the events.

**Returns:** BotTelemetryClient

The currently configured BotTelemetryClient that logs the QnaMessage event.

## Methods

### answer

▸ **answer**(`context`: TurnContext): Promise\<boolean>

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:183*

Calls [generateAnswer()](#generateanswer) and sends the resulting answer as a reply to the user.

**`deprecated`** Instead, favor using [QnAMaker.getAnswers()](#getAnswers) to generate answers for a question.

**`summary`** 
Returns a value of `true` if an answer was found and sent. If multiple answers are
returned the first one will be delivered.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`context` | TurnContext | Context for the current turn of conversation with the user. |

**Returns:** Promise\<boolean>

A promise resolving to true if an answer was sent

___

### callService

▸ `Protected`**callService**(`endpoint`: QnAMakerEndpoint, `question`: string, `top`: number): Promise\<QnAMakerResults>

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:224*

Called internally to query the QnA Maker service.

**`summary`** This is exposed to enable better unit testing of the service.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`endpoint` | QnAMakerEndpoint | the qna maker endpoint |
`question` | string | the question |
`top` | number | number of results to return |

**Returns:** Promise\<QnAMakerResults>

a promise resolving to the qna maker results

___

### callTrain

▸ **callTrain**(`feedbackRecords`: FeedbackRecords): Promise\<void>

*Implementation of [QnAMakerClient](../interfaces/botbuilder_ai.qnamakerclient.md)*

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:213*

Send feedback to the knowledge base.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`feedbackRecords` | FeedbackRecords | Feedback records. |

**Returns:** Promise\<void>

A promise representing the async operation

___

### fillQnAEvent

▸ `Protected`**fillQnAEvent**(`qnaResults`: QnAMakerResult[], `turnContext`: TurnContext, `telemetryProperties?`: Record\<string, string>, `telemetryMetrics?`: Record\<string, number>): Promise\<[Record\<string, string>, Record\<string, number>]>

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:249*

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

### generateAnswer

▸ **generateAnswer**(`question`: string \| undefined, `top?`: number, `_scoreThreshold?`: number): Promise\<QnAMakerResult[]>

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:197*

Calls the QnA Maker service to generate answer(s) for a question.

**`deprecated`** Instead, favor using [QnAMaker.getAnswers()](#getAnswers) to generate answers for a question.

**`summary`** 
Returns an array of answers sorted by score with the top scoring answer returned first.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`question` | string \| undefined | The question to answer. |
`top?` | number | (Optional) number of answers to return. Defaults to a value of `1`. |
`_scoreThreshold?` | number | (Optional) minimum answer score needed to be considered a match to questions. Defaults to a value of `0.001`. |

**Returns:** Promise\<QnAMakerResult[]>

A promise resolving to the QnAMaker results

___

### getAnswers

▸ **getAnswers**(`context`: TurnContext, `options?`: QnAMakerOptions, `telemetryProperties?`: { [key:string]: string;  }, `telemetryMetrics?`: { [key:string]: number;  }): Promise\<QnAMakerResult[]>

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:139*

Calls the QnA Maker service to generate answer(s) for a question.

**`summary`** 
Returns an array of answers sorted by score with the top scoring answer returned first.

In addition to returning the results from QnA Maker, [getAnswers()](#getAnswers) will also
emit a trace activity that contains the QnA Maker results.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`context` | TurnContext | The Turn Context that contains the user question to be queried against your knowledge base. |
`options?` | QnAMakerOptions | (Optional) The options for the QnA Maker knowledge base. If null, constructor option is used for this instance. |
`telemetryProperties?` | { [key:string]: string;  } | Additional properties to be logged to telemetry with the QnaMessage event. |
`telemetryMetrics?` | { [key:string]: number;  } | Additional metrics to be logged to telemetry with the QnaMessage event. |

**Returns:** Promise\<QnAMakerResult[]>

A promise resolving to the QnAMaker result

___

### getAnswersRaw

▸ **getAnswersRaw**(`context`: TurnContext, `options`: QnAMakerOptions, `telemetryProperties`: { [key:string]: string;  }, `telemetryMetrics`: { [key:string]: number;  }): Promise\<QnAMakerResults>

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:153*

Generates an answer from the knowledge base.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`context` | TurnContext | The [TurnContext](xref:botbuilder-core.TurnContext) that contains the user question to be queried against your knowledge base. |
`options` | QnAMakerOptions | Optional. The [QnAMakerOptions](xref:botbuilder-ai.QnAMakerOptions) for the QnA Maker knowledge base. If null, constructor option is used for this instance. |
`telemetryProperties` | { [key:string]: string;  } | Optional. Additional properties to be logged to telemetry with the QnaMessage event. |
`telemetryMetrics` | { [key:string]: number;  } | Optional. Additional metrics to be logged to telemetry with the QnaMessage event. |

**Returns:** Promise\<QnAMakerResults>

A list of answers for the user query, sorted in decreasing order of ranking score.

___

### getLegacyAnswersRaw

▸ **getLegacyAnswersRaw**(`context`: TurnContext, `options?`: QnAMakerOptions, `telemetryProperties?`: { [key:string]: string;  }, `telemetryMetrics?`: { [key:string]: number;  }): Promise\<QnAMakerResults>

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:167*

Generates an answer from the QnA Maker knowledge base.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`context` | TurnContext | The [TurnContext](xref:botbuilder-core.TurnContext) that contains the user question to be queried against your knowledge base. |
`options?` | QnAMakerOptions | Optional. The [QnAMakerOptions](xref:botbuilder-ai.QnAMakerOptions) for the QnA Maker knowledge base. If null, constructor option is used for this instance. |
`telemetryProperties?` | { [key:string]: string;  } | Optional. Additional properties to be logged to telemetry with the QnaMessage event. |
`telemetryMetrics?` | { [key:string]: number;  } | Optional. Additional metrics to be logged to telemetry with the QnaMessage event. |

**Returns:** Promise\<QnAMakerResults>

A list of answers for the user query, sorted in decreasing order of ranking score.

___

### getLowScoreVariation

▸ **getLowScoreVariation**(`queryResult`: QnAMakerResult[]): QnAMakerResult[]

*Implementation of [QnAMakerClient](../interfaces/botbuilder_ai.qnamakerclient.md)*

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:206*

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

*Defined in libraries/botbuilder-ai/lib/qnaMaker.d.ts:234*

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
