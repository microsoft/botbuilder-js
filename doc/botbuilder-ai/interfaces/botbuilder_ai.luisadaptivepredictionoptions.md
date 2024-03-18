**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / LuisAdaptivePredictionOptions

# Interface: LuisAdaptivePredictionOptions

Optional parameters for a LUIS prediction request.

## Hierarchy

* **LuisAdaptivePredictionOptions**

## Index

### Properties

* [dateTimeReference](botbuilder_ai.luisadaptivepredictionoptions.md#datetimereference)
* [externalEntities](botbuilder_ai.luisadaptivepredictionoptions.md#externalentities)
* [includeAPIResults](botbuilder_ai.luisadaptivepredictionoptions.md#includeapiresults)
* [includeAllIntents](botbuilder_ai.luisadaptivepredictionoptions.md#includeallintents)
* [includeInstanceData](botbuilder_ai.luisadaptivepredictionoptions.md#includeinstancedata)
* [log](botbuilder_ai.luisadaptivepredictionoptions.md#log)
* [preferExternalEntities](botbuilder_ai.luisadaptivepredictionoptions.md#preferexternalentities)
* [slot](botbuilder_ai.luisadaptivepredictionoptions.md#slot)

## Properties

### dateTimeReference

• `Optional` **dateTimeReference**: StringExpression

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:91*

Gets or sets datetimeV2 offset. The format for the datetimeReference is ISO 8601.

___

### externalEntities

• `Optional` **externalEntities**: ArrayExpression\<[ExternalEntity](botbuilder_ai.externalentity.md)>

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:83*

Gets or sets external entities recognized in the query.

___

### includeAPIResults

• `Optional` **includeAPIResults**: BoolExpression

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:75*

Gets or sets a value indicating whether API results should be included.

___

### includeAllIntents

• `Optional` **includeAllIntents**: BoolExpression

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:67*

Gets or sets a value indicating whether all intents come back or only the top one.

___

### includeInstanceData

• `Optional` **includeInstanceData**: BoolExpression

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:71*

Gets or sets a value indicating whether or not instance data should be included in response.

___

### log

• `Optional` **log**: BoolExpression

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:79*

Gets or sets a value indicating whether queries should be logged in LUIS.

___

### preferExternalEntities

• `Optional` **preferExternalEntities**: BoolExpression

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:87*

Gets or sets a value indicating whether external entities should override other means of recognizing entities.

___

### slot

• `Optional` **slot**: StringExpression

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:95*

Gets or sets the LUIS slot to use for the application.
