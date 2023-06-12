**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / LuisRecognizerTelemetryClient

# Interface: LuisRecognizerTelemetryClient

## Hierarchy

* **LuisRecognizerTelemetryClient**

## Implemented by

* [LuisRecognizer](../classes/botbuilder_ai.luisrecognizer.md)

## Index

### Properties

* [logPersonalInformation](botbuilder_ai.luisrecognizertelemetryclient.md#logpersonalinformation)
* [telemetryClient](botbuilder_ai.luisrecognizertelemetryclient.md#telemetryclient)

### Methods

* [recognize](botbuilder_ai.luisrecognizertelemetryclient.md#recognize)

## Properties

### logPersonalInformation

• `Readonly` **logPersonalInformation**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:76*

Gets a value indicating whether determines whether to log personal information that came from the user.

___

### telemetryClient

• `Readonly` **telemetryClient**: BotTelemetryClient

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:80*

Gets the currently configured botTelemetryClient that logs the events.

## Methods

### recognize

▸ **recognize**(`context`: TurnContext, `telemetryProperties?`: { [key:string]: string;  }, `telemetryMetrics?`: { [key:string]: number;  }): Promise\<RecognizerResult>

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:92*

Calls LUIS to recognize intents and entities in a users utterance.

**`summary`** 
Returns a [RecognizerResult](../botbuilder-core/recognizerresult) containing any intents and entities recognized by LUIS.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`context` | TurnContext | Context for the current turn of conversation with the use. |
`telemetryProperties?` | { [key:string]: string;  } | Additional properties to be logged to telemetry with the LuisResult event. |
`telemetryMetrics?` | { [key:string]: number;  } | Additional metrics to be logged to telemetry with the LuisResult event. |

**Returns:** Promise\<RecognizerResult>

A promise that resolves to the recognizer result.
