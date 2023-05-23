**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / QnAMakerTelemetryClient

# Interface: QnAMakerTelemetryClient

Interface for adding telemetry logging capabilities to QnAMaker.

## Hierarchy

* **QnAMakerTelemetryClient**

## Implemented by

* [CustomQuestionAnswering](../classes/botbuilder_ai.customquestionanswering.md)

## Index

### Properties

* [logPersonalInformation](botbuilder_ai.qnamakertelemetryclient-1.md#logpersonalinformation)
* [telemetryClient](botbuilder_ai.qnamakertelemetryclient-1.md#telemetryclient)

### Methods

* [getAnswers](botbuilder_ai.qnamakertelemetryclient-1.md#getanswers)

## Properties

### logPersonalInformation

• `Readonly` **logPersonalInformation**: boolean

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:59*

Gets a value indicating whether determines whether to log personal information that came from the user.

___

### telemetryClient

• `Readonly` **telemetryClient**: BotTelemetryClient

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:63*

Gets the currently configured botTelemetryClient that logs the events.

## Methods

### getAnswers

▸ **getAnswers**(`context`: TurnContext, `options?`: QnAMakerOptions, `telemetryProperties?`: { [key:string]: string;  }, `telemetryMetrics?`: { [key:string]: number;  }): Promise\<QnAMakerResult[]>

*Defined in libraries/botbuilder-ai/lib/customQuestionAnswering.d.ts:79*

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
