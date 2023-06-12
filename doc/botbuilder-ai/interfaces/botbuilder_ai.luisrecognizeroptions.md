**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / LuisRecognizerOptions

# Interface: LuisRecognizerOptions

## Hierarchy

* **LuisRecognizerOptions**

  ↳ [LuisRecognizerOptionsV3](botbuilder_ai.luisrecognizeroptionsv3.md)

  ↳ [LuisRecognizerOptionsV2](botbuilder_ai.luisrecognizeroptionsv2.md)

## Index

### Properties

* [includeAPIResults](botbuilder_ai.luisrecognizeroptions.md#includeapiresults)
* [logPersonalInformation](botbuilder_ai.luisrecognizeroptions.md#logpersonalinformation)
* [telemetryClient](botbuilder_ai.luisrecognizeroptions.md#telemetryclient)

## Properties

### includeAPIResults

• `Optional` **includeAPIResults**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:110*

(Optional) Force the inclusion of LUIS Api call in results returned by [recognize()](#recognize). Defaults to a value of `false`

___

### logPersonalInformation

• `Optional` **logPersonalInformation**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:106*

(Optional) Designates whether personal information should be logged in telemetry.

___

### telemetryClient

• `Optional` **telemetryClient**: BotTelemetryClient

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:102*

(Optional) Telemetry Client.
