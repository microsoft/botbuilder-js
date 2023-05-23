**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / LuisRecognizerOptionsV2

# Interface: LuisRecognizerOptionsV2

## Hierarchy

* [LuisRecognizerOptions](botbuilder_ai.luisrecognizeroptions.md)

  ↳ **LuisRecognizerOptionsV2**

## Index

### Properties

* [apiVersion](botbuilder_ai.luisrecognizeroptionsv2.md#apiversion)
* [bingSpellCheckSubscriptionKey](botbuilder_ai.luisrecognizeroptionsv2.md#bingspellchecksubscriptionkey)
* [includeAPIResults](botbuilder_ai.luisrecognizeroptionsv2.md#includeapiresults)
* [includeAllIntents](botbuilder_ai.luisrecognizeroptionsv2.md#includeallintents)
* [includeInstanceData](botbuilder_ai.luisrecognizeroptionsv2.md#includeinstancedata)
* [log](botbuilder_ai.luisrecognizeroptionsv2.md#log)
* [logPersonalInformation](botbuilder_ai.luisrecognizeroptionsv2.md#logpersonalinformation)
* [spellCheck](botbuilder_ai.luisrecognizeroptionsv2.md#spellcheck)
* [staging](botbuilder_ai.luisrecognizeroptionsv2.md#staging)
* [telemetryClient](botbuilder_ai.luisrecognizeroptionsv2.md#telemetryclient)
* [timezoneOffset](botbuilder_ai.luisrecognizeroptionsv2.md#timezoneoffset)

## Properties

### apiVersion

•  **apiVersion**: \"v2\"

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:164*

Luis Api endpoint version.

___

### bingSpellCheckSubscriptionKey

• `Optional` **bingSpellCheckSubscriptionKey**: string

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:168*

(Optional) Bing Spell Check subscription key.

___

### includeAPIResults

• `Optional` **includeAPIResults**: boolean

*Inherited from [LuisRecognizerOptions](botbuilder_ai.luisrecognizeroptions.md).[includeAPIResults](botbuilder_ai.luisrecognizeroptions.md#includeapiresults)*

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:110*

(Optional) Force the inclusion of LUIS Api call in results returned by [recognize()](#recognize). Defaults to a value of `false`

___

### includeAllIntents

• `Optional` **includeAllIntents**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:172*

(Optional) Determine if all intents come back or only the top one.

___

### includeInstanceData

• `Optional` **includeInstanceData**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:176*

(Optional) A value indicating whether or not instance data should be included in response.

___

### log

• `Optional` **log**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:180*

(Optional) If queries should be logged in LUIS.

___

### logPersonalInformation

• `Optional` **logPersonalInformation**: boolean

*Inherited from [LuisRecognizerOptions](botbuilder_ai.luisrecognizeroptions.md).[logPersonalInformation](botbuilder_ai.luisrecognizeroptions.md#logpersonalinformation)*

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:106*

(Optional) Designates whether personal information should be logged in telemetry.

___

### spellCheck

• `Optional` **spellCheck**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:184*

(Optional) Whether to spell check query.

___

### staging

• `Optional` **staging**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:188*

(Optional) Whether to use the staging endpoint.

___

### telemetryClient

• `Optional` **telemetryClient**: BotTelemetryClient

*Inherited from [LuisRecognizerOptions](botbuilder_ai.luisrecognizeroptions.md).[telemetryClient](botbuilder_ai.luisrecognizeroptions.md#telemetryclient)*

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:102*

(Optional) Telemetry Client.

___

### timezoneOffset

• `Optional` **timezoneOffset**: number

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:192*

(Optional) The time zone offset for resolving datetimes.
