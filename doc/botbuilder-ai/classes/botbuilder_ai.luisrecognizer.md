**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / LuisRecognizer

# Class: LuisRecognizer

Recognize intents in a user utterance using a configured LUIS model.

**`summary`** 
This class is used to recognize intents and extract entities from incoming messages.
See this class in action [in this sample application](https://github.com/microsoft/BotBuilder-Samples/tree/main/samples/javascript_nodejs/14.nlp-with-dispatch).

This component can be used within your bots logic by calling [recognize()](#recognize).

## Hierarchy

* **LuisRecognizer**

## Implements

* [LuisRecognizerTelemetryClient](../interfaces/botbuilder_ai.luisrecognizertelemetryclient.md)

## Index

### Constructors

* [constructor](botbuilder_ai.luisrecognizer.md#constructor)

### Accessors

* [logPersonalInformation](botbuilder_ai.luisrecognizer.md#logpersonalinformation)
* [telemetryClient](botbuilder_ai.luisrecognizer.md#telemetryclient)

### Methods

* [fillTelemetryProperties](botbuilder_ai.luisrecognizer.md#filltelemetryproperties)
* [onRecognizerResults](botbuilder_ai.luisrecognizer.md#onrecognizerresults)
* [recognize](botbuilder_ai.luisrecognizer.md#recognize)
* [sortedIntents](botbuilder_ai.luisrecognizer.md#sortedintents)
* [topIntent](botbuilder_ai.luisrecognizer.md#topintent)

## Constructors

### constructor

\+ **new LuisRecognizer**(`application`: string, `options?`: [LuisPredictionOptions](../interfaces/botbuilder_ai.luispredictionoptions.md), `includeApiResults?`: boolean): [LuisRecognizer](botbuilder_ai.luisrecognizer.md)

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:209*

Creates a new [LuisRecognizer](xref:botbuilder-ai.LuisRecognizer) instance.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`application` | string | The LUIS application endpoint, usually retrieved from https://luis.ai. |
`options?` | [LuisPredictionOptions](../interfaces/botbuilder_ai.luispredictionoptions.md) | Optional. Options object used to control predictions. Should conform to the [LuisPredictionOptions](xref:botbuilder-ai.LuisPredictionOptions) definition. |
`includeApiResults?` | boolean | (Deprecated) Flag that if set to `true` will force the inclusion of LUIS Api call in results returned by the [LuisRecognizer.recognize](xref:botbuilder-ai.LuisRecognizer.recognize) method. Defaults to a value of `false`.  |

**Returns:** [LuisRecognizer](botbuilder_ai.luisrecognizer.md)

\+ **new LuisRecognizer**(`application`: [LuisApplication](../interfaces/botbuilder_ai.luisapplication.md), `options?`: [LuisPredictionOptions](../interfaces/botbuilder_ai.luispredictionoptions.md), `includeApiResults?`: boolean): [LuisRecognizer](botbuilder_ai.luisrecognizer.md)

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:217*

Creates a new [LuisRecognizer](xref:botbuilder-ai.LuisRecognizer) instance.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`application` | [LuisApplication](../interfaces/botbuilder_ai.luisapplication.md) | The LUIS application endpoint, usually retrieved from https://luis.ai. |
`options?` | [LuisPredictionOptions](../interfaces/botbuilder_ai.luispredictionoptions.md) | Optional. Options object used to control predictions. Should conform to the [LuisPredictionOptions](xref:botbuilder-ai.LuisPredictionOptions) definition. |
`includeApiResults?` | boolean | (Deprecated) Flag that if set to `true` will force the inclusion of LUIS Api call in results returned by the [LuisRecognizer.recognize](xref:botbuilder-ai.LuisRecognizer.recognize) method. Defaults to a value of `false`.  |

**Returns:** [LuisRecognizer](botbuilder_ai.luisrecognizer.md)

\+ **new LuisRecognizer**(`application`: [LuisApplication](../interfaces/botbuilder_ai.luisapplication.md) \| string, `options?`: [LuisRecognizerOptionsV3](../interfaces/botbuilder_ai.luisrecognizeroptionsv3.md) \| [LuisRecognizerOptionsV2](../interfaces/botbuilder_ai.luisrecognizeroptionsv2.md)): [LuisRecognizer](botbuilder_ai.luisrecognizer.md)

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:225*

Creates a new [LuisRecognizer](xref:botbuilder-ai.LuisRecognizer) instance.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`application` | [LuisApplication](../interfaces/botbuilder_ai.luisapplication.md) \| string | The LUIS application endpoint, usually retrieved from https://luis.ai. |
`options?` | [LuisRecognizerOptionsV3](../interfaces/botbuilder_ai.luisrecognizeroptionsv3.md) \| [LuisRecognizerOptionsV2](../interfaces/botbuilder_ai.luisrecognizeroptionsv2.md) | Optional. Options object used to control predictions. Should conform to the [LuisPredictionOptions](xref:botbuilder-ai.LuisPredictionOptions) definition. |

**Returns:** [LuisRecognizer](botbuilder_ai.luisrecognizer.md)

## Accessors

### logPersonalInformation

• get **logPersonalInformation**(): boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:238*

Gets a value indicating whether determines whether to log personal information that came from the user.

**Returns:** boolean

True if will log personal information into the BotTelemetryClient.TrackEvent method; otherwise the properties will be filtered.

___

### telemetryClient

• get **telemetryClient**(): BotTelemetryClient

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:244*

Gets the currently configured BotTelemetryClient that logs the events.

**Returns:** BotTelemetryClient

Currently configured BotTelemetryClient that logs the LuisResult event.

## Methods

### fillTelemetryProperties

▸ `Protected`**fillTelemetryProperties**(`recognizerResult`: RecognizerResult, `turnContext`: TurnContext, `telemetryProperties?`: { [key:string]: string;  }): Promise\<{ [key:string]: string;  }>

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:329*

Fills the event properties for LuisResult event for telemetry. These properties are logged when the recognizer is called.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`recognizerResult` | RecognizerResult | Last activity sent from user. |
`turnContext` | TurnContext | Context object containing information for a single turn of conversation with a user. |
`telemetryProperties?` | { [key:string]: string;  } | Additional properties to be logged to telemetry with the LuisResult event. |

**Returns:** Promise\<{ [key:string]: string;  }>

A dictionary that is sent as properties to BotTelemetryClient.trackEvent method for the LuisResult event.

___

### onRecognizerResults

▸ `Protected`**onRecognizerResults**(`recognizerResult`: RecognizerResult, `turnContext`: TurnContext, `telemetryProperties?`: { [key:string]: string;  }, `telemetryMetrics?`: { [key:string]: number;  }): Promise\<void>

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:316*

Invoked prior to a LuisResult Event being logged.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`recognizerResult` | RecognizerResult | The Luis Results for the call. |
`turnContext` | TurnContext | Context object containing information for a single turn of conversation with a user. |
`telemetryProperties?` | { [key:string]: string;  } | Additional properties to be logged to telemetry with the LuisResult event. |
`telemetryMetrics?` | { [key:string]: number;  } | Additional metrics to be logged to telemetry with the LuisResult event.  |

**Returns:** Promise\<void>

___

### recognize

▸ **recognize**(`context`: DialogContext \| TurnContext, `telemetryProperties?`: Record\<string, string>, `telemetryMetrics?`: Record\<string, number>, `options?`: [LuisRecognizerOptionsV2](../interfaces/botbuilder_ai.luisrecognizeroptionsv2.md) \| [LuisRecognizerOptionsV3](../interfaces/botbuilder_ai.luisrecognizeroptionsv3.md) \| [LuisPredictionOptions](../interfaces/botbuilder_ai.luispredictionoptions.md)): Promise\<RecognizerResult>

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:300*

Calls LUIS to recognize intents and entities in a users utterance.

**`summary`** 
Returns a [RecognizerResult](../botbuilder-core/recognizerresult) containing any intents and entities recognized by LUIS.

In addition to returning the results from LUIS, [recognize()](#recognize) will also
emit a trace activity that contains the LUIS results.

Here is an example of recognize being used within a bot's turn handler: to interpret an incoming message:

```javascript
async onTurn(context) {
    if (turnContext.activity.type === ActivityTypes.Message) {
        const results = await luisRecognizer.recognize(turnContext);
        const topIntent = LuisRecognizer.topIntent(results);
        switch (topIntent) {
            case 'MyIntent':
                // ... handle intent ...
                break;
            case 'None':
                // ... handle intent ...
                break;
        }
    }
}
```

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`context` | DialogContext \| TurnContext | Context for the current turn of conversation with the use. |
`telemetryProperties?` | Record\<string, string> | Additional properties to be logged to telemetry with the LuisResult event. |
`telemetryMetrics?` | Record\<string, number> | Additional metrics to be logged to telemetry with the LuisResult event. |
`options?` | [LuisRecognizerOptionsV2](../interfaces/botbuilder_ai.luisrecognizeroptionsv2.md) \| [LuisRecognizerOptionsV3](../interfaces/botbuilder_ai.luisrecognizeroptionsv3.md) \| [LuisPredictionOptions](../interfaces/botbuilder_ai.luispredictionoptions.md) | (Optional) options object used to override control predictions. Should conform to the [LuisRecognizerOptionsV2] or [LuisRecognizerOptionsV3] definition. |

**Returns:** Promise\<RecognizerResult>

A promise that resolved to the recognizer result.

▸ **recognize**(`utterance`: string, `options?`: [LuisRecognizerOptionsV2](../interfaces/botbuilder_ai.luisrecognizeroptionsv2.md) \| [LuisRecognizerOptionsV3](../interfaces/botbuilder_ai.luisrecognizeroptionsv3.md) \| [LuisPredictionOptions](../interfaces/botbuilder_ai.luispredictionoptions.md)): Promise\<RecognizerResult>

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:307*

Calls LUIS to recognize intents and entities in a users utterance.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`utterance` | string | The utterance to be recognized. |
`options?` | [LuisRecognizerOptionsV2](../interfaces/botbuilder_ai.luisrecognizeroptionsv2.md) \| [LuisRecognizerOptionsV3](../interfaces/botbuilder_ai.luisrecognizeroptionsv3.md) \| [LuisPredictionOptions](../interfaces/botbuilder_ai.luispredictionoptions.md) | (Optional) options object used to override control predictions. Should conform to the [LuisRecognizerOptionsV2] or [LuisRecognizerOptionsV3] definition.  |

**Returns:** Promise\<RecognizerResult>

___

### sortedIntents

▸ `Static`**sortedIntents**(`result?`: RecognizerResult, `minScore?`: number): Array\<{ intent: string ; score: number  }>

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:262*

Sorts recognizer result intents in ascending order by score, filtering those that
have scores less that `minScore`.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`result?` | RecognizerResult | recognizer result to be sorted and filtered |
`minScore?` | number | minimum score threshold, lower score results will be filtered |

**Returns:** Array\<{ intent: string ; score: number  }>

>} sorted result intents

___

### topIntent

▸ `Static`**topIntent**(`results?`: RecognizerResult, `defaultIntent?`: string, `minScore?`: number): string

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:253*

Returns the name of the top scoring intent from a set of LUIS results.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`results?` | RecognizerResult | Result set to be searched. |
`defaultIntent?` | string | (Optional) intent name to return should a top intent be found. Defaults to a value of `None`. |
`minScore?` | number | (Optional) minimum score needed for an intent to be considered as a top intent. If all intents in the set are below this threshold then the `defaultIntent` will be returned.  Defaults to a value of `0.0`. |

**Returns:** string

the top intent
