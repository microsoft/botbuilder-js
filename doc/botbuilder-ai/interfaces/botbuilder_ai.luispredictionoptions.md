**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / LuisPredictionOptions

# Interface: LuisPredictionOptions

Options per LUIS prediction.

## Hierarchy

* any

  ↳ **LuisPredictionOptions**

## Index

### Properties

* [bingSpellCheckSubscriptionKey](botbuilder_ai.luispredictionoptions.md#bingspellchecksubscriptionkey)
* [includeAllIntents](botbuilder_ai.luispredictionoptions.md#includeallintents)
* [includeInstanceData](botbuilder_ai.luispredictionoptions.md#includeinstancedata)
* [log](botbuilder_ai.luispredictionoptions.md#log)
* [logPersonalInformation](botbuilder_ai.luispredictionoptions.md#logpersonalinformation)
* [spellCheck](botbuilder_ai.luispredictionoptions.md#spellcheck)
* [staging](botbuilder_ai.luispredictionoptions.md#staging)
* [telemetryClient](botbuilder_ai.luispredictionoptions.md#telemetryclient)
* [timezoneOffset](botbuilder_ai.luispredictionoptions.md#timezoneoffset)

## Properties

### bingSpellCheckSubscriptionKey

• `Optional` **bingSpellCheckSubscriptionKey**: string

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:38*

(Optional) Bing Spell Check subscription key.

___

### includeAllIntents

• `Optional` **includeAllIntents**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:42*

(Optional) Determine if all intents come back or only the top one.

___

### includeInstanceData

• `Optional` **includeInstanceData**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:46*

(Optional) A value indicating whether or not instance data should be included in response.

___

### log

• `Optional` **log**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:50*

(Optional) If queries should be logged in LUIS.

___

### logPersonalInformation

• `Optional` **logPersonalInformation**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:70*

(Optional) Designates whether personal information should be logged in telemetry.

___

### spellCheck

• `Optional` **spellCheck**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:54*

(Optional) Whether to spell check query.

___

### staging

• `Optional` **staging**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:58*

(Optional) Whether to use the staging endpoint.

___

### telemetryClient

• `Optional` **telemetryClient**: BotTelemetryClient

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:66*

(Optional) Telemetry Client.

___

### timezoneOffset

• `Optional` **timezoneOffset**: number

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:62*

(Optional) The time zone offset for resolving datetimes.
