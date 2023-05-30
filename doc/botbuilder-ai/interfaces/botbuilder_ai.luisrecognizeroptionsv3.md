**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / LuisRecognizerOptionsV3

# Interface: LuisRecognizerOptionsV3

## Hierarchy

* [LuisRecognizerOptions](botbuilder_ai.luisrecognizeroptions.md)

  ↳ **LuisRecognizerOptionsV3**

## Index

### Properties

* [apiVersion](botbuilder_ai.luisrecognizeroptionsv3.md#apiversion)
* [datetimeReference](botbuilder_ai.luisrecognizeroptionsv3.md#datetimereference)
* [dynamicLists](botbuilder_ai.luisrecognizeroptionsv3.md#dynamiclists)
* [externalEntities](botbuilder_ai.luisrecognizeroptionsv3.md#externalentities)
* [externalEntityRecognizer](botbuilder_ai.luisrecognizeroptionsv3.md#externalentityrecognizer)
* [includeAPIResults](botbuilder_ai.luisrecognizeroptionsv3.md#includeapiresults)
* [includeAllIntents](botbuilder_ai.luisrecognizeroptionsv3.md#includeallintents)
* [includeInstanceData](botbuilder_ai.luisrecognizeroptionsv3.md#includeinstancedata)
* [log](botbuilder_ai.luisrecognizeroptionsv3.md#log)
* [logPersonalInformation](botbuilder_ai.luisrecognizeroptionsv3.md#logpersonalinformation)
* [preferExternalEntities](botbuilder_ai.luisrecognizeroptionsv3.md#preferexternalentities)
* [slot](botbuilder_ai.luisrecognizeroptionsv3.md#slot)
* [telemetryClient](botbuilder_ai.luisrecognizeroptionsv3.md#telemetryclient)
* [version](botbuilder_ai.luisrecognizeroptionsv3.md#version)

## Properties

### apiVersion

•  **apiVersion**: \"v3\"

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:116*

(Optional) Luis Api endpoint version.

___

### datetimeReference

• `Optional` **datetimeReference**: string

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:148*

(Optional) Timezone applied to datetimeV2 entities.

___

### dynamicLists

• `Optional` **dynamicLists**: Array\<[DynamicList](botbuilder_ai.dynamiclist.md)>

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:136*

(Optional) Dynamic lists of things like contact names to recognize at query time..

___

### externalEntities

• `Optional` **externalEntities**: Array\<[ExternalEntity](botbuilder_ai.externalentity.md)>

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:140*

(Optional) External entities recognized in query.

___

### externalEntityRecognizer

• `Optional` **externalEntityRecognizer**: Recognizer

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:120*

(Optional) External recognizer to recognize external entities to pass to LUIS.

___

### includeAPIResults

• `Optional` **includeAPIResults**: boolean

*Inherited from [LuisRecognizerOptions](botbuilder_ai.luisrecognizeroptions.md).[includeAPIResults](botbuilder_ai.luisrecognizeroptions.md#includeapiresults)*

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:110*

(Optional) Force the inclusion of LUIS Api call in results returned by [recognize()](#recognize). Defaults to a value of `false`

___

### includeAllIntents

• `Optional` **includeAllIntents**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:124*

(Optional) Determine if all intents come back or only the top one.

___

### includeInstanceData

• `Optional` **includeInstanceData**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:128*

(Optional) A value indicating whether or not instance data should be included in response.

___

### log

• `Optional` **log**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:132*

(Optional) If queries should be logged in LUIS.

___

### logPersonalInformation

• `Optional` **logPersonalInformation**: boolean

*Inherited from [LuisRecognizerOptions](botbuilder_ai.luisrecognizeroptions.md).[logPersonalInformation](botbuilder_ai.luisrecognizeroptions.md#logpersonalinformation)*

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:106*

(Optional) Designates whether personal information should be logged in telemetry.

___

### preferExternalEntities

• `Optional` **preferExternalEntities**: boolean

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:144*

(Optional) Boolean for if external entities should be preferred to the results from LUIS models.

___

### slot

• `Optional` **slot**: \"production\" \| \"staging\"

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:153*

(Optional) By default this uses the production slot.  You can find other standard slots in <see cref="LuisSlot"/>.
 If you specify a Version, then a private version of the application is used instead of a slot.

___

### telemetryClient

• `Optional` **telemetryClient**: BotTelemetryClient

*Inherited from [LuisRecognizerOptions](botbuilder_ai.luisrecognizeroptions.md).[telemetryClient](botbuilder_ai.luisrecognizeroptions.md#telemetryclient)*

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:102*

(Optional) Telemetry Client.

___

### version

• `Optional` **version**: string

*Defined in libraries/botbuilder-ai/lib/luisRecognizer.d.ts:158*

(Optional) LUIS supports versions and this is the version to use instead of a slot.
If this is specified, then the <see cref="Slot"/> is ignored..
