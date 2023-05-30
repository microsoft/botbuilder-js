**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / LuisAdaptiveRecognizer

# Class: LuisAdaptiveRecognizer

Class that represents an adaptive LUIS recognizer.

## Hierarchy

* any

  ↳ **LuisAdaptiveRecognizer**

## Implements

* [LuisAdaptiveRecognizerConfiguration](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md)

## Index

### Properties

* [applicationId](botbuilder_ai.luisadaptiverecognizer.md#applicationid)
* [dynamicLists](botbuilder_ai.luisadaptiverecognizer.md#dynamiclists)
* [endpoint](botbuilder_ai.luisadaptiverecognizer.md#endpoint)
* [endpointKey](botbuilder_ai.luisadaptiverecognizer.md#endpointkey)
* [externalEntityRecognizer](botbuilder_ai.luisadaptiverecognizer.md#externalentityrecognizer)
* [logPersonalInformation](botbuilder_ai.luisadaptiverecognizer.md#logpersonalinformation)
* [predictionOptions](botbuilder_ai.luisadaptiverecognizer.md#predictionoptions)
* [version](botbuilder_ai.luisadaptiverecognizer.md#version)
* [$kind](botbuilder_ai.luisadaptiverecognizer.md#$kind)

### Methods

* [fillRecognizerResultTelemetryProperties](botbuilder_ai.luisadaptiverecognizer.md#fillrecognizerresulttelemetryproperties)
* [getConverter](botbuilder_ai.luisadaptiverecognizer.md#getconverter)
* [recognize](botbuilder_ai.luisadaptiverecognizer.md#recognize)
* [recognizerOptions](botbuilder_ai.luisadaptiverecognizer.md#recognizeroptions)

## Properties

### applicationId

•  **applicationId**: StringExpression

*Implementation of [LuisAdaptiveRecognizerConfiguration](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md).[applicationId](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md#applicationid)*

*Defined in libraries/botbuilder-ai/lib/luisAdaptiveRecognizer.d.ts:45*

LUIS application ID.

___

### dynamicLists

•  **dynamicLists**: ArrayExpression\<[DynamicList](../README.md#dynamiclist)>

*Implementation of [LuisAdaptiveRecognizerConfiguration](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md).[dynamicLists](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md#dynamiclists)*

*Defined in libraries/botbuilder-ai/lib/luisAdaptiveRecognizer.d.ts:71*

LUIS dynamic list.

___

### endpoint

•  **endpoint**: StringExpression

*Implementation of [LuisAdaptiveRecognizerConfiguration](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md).[endpoint](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md#endpoint)*

*Defined in libraries/botbuilder-ai/lib/luisAdaptiveRecognizer.d.ts:56*

LUIS endpoint to query.

**`summary`** 
For example: "https://westus.api.cognitive.microsoft.com"

___

### endpointKey

•  **endpointKey**: StringExpression

*Implementation of [LuisAdaptiveRecognizerConfiguration](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md).[endpointKey](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md#endpointkey)*

*Defined in libraries/botbuilder-ai/lib/luisAdaptiveRecognizer.d.ts:60*

Key used to talk to a LUIS endpoint.

___

### externalEntityRecognizer

•  **externalEntityRecognizer**: Recognizer

*Implementation of [LuisAdaptiveRecognizerConfiguration](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md).[externalEntityRecognizer](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md#externalentityrecognizer)*

*Defined in libraries/botbuilder-ai/lib/luisAdaptiveRecognizer.d.ts:67*

External entity recognizer.

**`summary`** 
This recognizer is run before calling LUIS and the results are passed to LUIS.

___

### logPersonalInformation

•  **logPersonalInformation**: BoolExpression

*Implementation of [LuisAdaptiveRecognizerConfiguration](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md).[logPersonalInformation](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md#logpersonalinformation)*

*Defined in libraries/botbuilder-ai/lib/luisAdaptiveRecognizer.d.ts:79*

The flag to indicate in personal information should be logged in telemetry.

___

### predictionOptions

•  **predictionOptions**: [LuisAdaptivePredictionOptions](../interfaces/botbuilder_ai.luisadaptivepredictionoptions.md)

*Implementation of [LuisAdaptiveRecognizerConfiguration](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md).[predictionOptions](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md#predictionoptions)*

*Defined in libraries/botbuilder-ai/lib/luisAdaptiveRecognizer.d.ts:75*

LUIS prediction options.

___

### version

•  **version**: StringExpression

*Implementation of [LuisAdaptiveRecognizerConfiguration](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md).[version](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md#version)*

*Defined in libraries/botbuilder-ai/lib/luisAdaptiveRecognizer.d.ts:49*

LUIS application version.

___

### $kind

▪ `Static` **$kind**: string

*Defined in libraries/botbuilder-ai/lib/luisAdaptiveRecognizer.d.ts:41*

## Methods

### fillRecognizerResultTelemetryProperties

▸ `Protected`**fillRecognizerResultTelemetryProperties**(`recognizerResult`: RecognizerResult, `telemetryProperties`: { [key:string]: string;  }, `dialogContext`: DialogContext): object

*Defined in libraries/botbuilder-ai/lib/luisAdaptiveRecognizer.d.ts:111*

Fills the event properties for LuisResult event for telemetry.
These properties are logged when the recognizer is called.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`recognizerResult` | RecognizerResult | Last activity sent from user. |
`telemetryProperties` | { [key:string]: string;  } | Additional properties to be logged to telemetry with the LuisResult event. |
`dialogContext` | DialogContext | Dialog context. |

**Returns:** object

A dictionary that is sent as properties to BotTelemetryClient.trackEvent method for the LuisResult event.

___

### getConverter

▸ **getConverter**(`property`: keyof [LuisAdaptiveRecognizerConfiguration](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md)): Converter \| ConverterFactory

*Defined in libraries/botbuilder-ai/lib/luisAdaptiveRecognizer.d.ts:84*

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`property` | keyof [LuisAdaptiveRecognizerConfiguration](../interfaces/botbuilder_ai.luisadaptiverecognizerconfiguration.md) | Properties that extend RecognizerConfiguration. |

**Returns:** Converter \| ConverterFactory

Expression converter.

___

### recognize

▸ **recognize**(`dialogContext`: DialogContext, `activity`: Activity, `telemetryProperties?`: Record\<string, string>, `telemetryMetrics?`: Record\<string, number>): Promise\<RecognizerResult>

*Defined in libraries/botbuilder-ai/lib/luisAdaptiveRecognizer.d.ts:94*

To recognize intents and entities in a users utterance.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`dialogContext` | DialogContext | The [DialogContext](xref:botbuilder-dialogs.DialogContext). |
`activity` | Activity | The [Activity](xref:botbuilder-core.Activity). |
`telemetryProperties?` | Record\<string, string> | Optional. Additional properties to be logged to telemetry with event. |
`telemetryMetrics?` | Record\<string, number> | Optional. Additional metrics to be logged to telemetry with event. |

**Returns:** Promise\<RecognizerResult>

A promise resolving to the recognizer result.

___

### recognizerOptions

▸ **recognizerOptions**(`dialogContext`: DialogContext): [LuisRecognizerOptionsV3](../interfaces/botbuilder_ai.luisrecognizeroptionsv3.md)

*Defined in libraries/botbuilder-ai/lib/luisAdaptiveRecognizer.d.ts:101*

Construct V3 recognizer options from the current dialog context.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`dialogContext` | DialogContext | Current dialog context. |

**Returns:** [LuisRecognizerOptionsV3](../interfaces/botbuilder_ai.luisrecognizeroptionsv3.md)

luis recognizer options
