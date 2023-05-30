**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / LuisAdaptivePredictionOptionsConfiguration

# Interface: LuisAdaptivePredictionOptionsConfiguration

## Hierarchy

* **LuisAdaptivePredictionOptionsConfiguration**

## Index

### Properties

* [dateTimeReference](botbuilder_ai.luisadaptivepredictionoptionsconfiguration.md#datetimereference)
* [externalEntities](botbuilder_ai.luisadaptivepredictionoptionsconfiguration.md#externalentities)
* [includeAPIResults](botbuilder_ai.luisadaptivepredictionoptionsconfiguration.md#includeapiresults)
* [includeAllIntents](botbuilder_ai.luisadaptivepredictionoptionsconfiguration.md#includeallintents)
* [includeInstanceData](botbuilder_ai.luisadaptivepredictionoptionsconfiguration.md#includeinstancedata)
* [log](botbuilder_ai.luisadaptivepredictionoptionsconfiguration.md#log)
* [preferExternalEntities](botbuilder_ai.luisadaptivepredictionoptionsconfiguration.md#preferexternalentities)
* [slot](botbuilder_ai.luisadaptivepredictionoptionsconfiguration.md#slot)

## Properties

### dateTimeReference

• `Optional` **dateTimeReference**: string \| Expression \| StringExpression

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:39*

Gets or sets datetimeV2 offset. The format for the datetimeReference is ISO 8601.

___

### externalEntities

• `Optional` **externalEntities**: [ExternalEntity](botbuilder_ai.externalentity.md)[] \| string \| Expression \| ArrayExpression\<[ExternalEntity](botbuilder_ai.externalentity.md)>

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:31*

Gets or sets external entities recognized in the query.

___

### includeAPIResults

• `Optional` **includeAPIResults**: boolean \| string \| Expression \| BoolExpression

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:23*

Gets or sets a value indicating whether API results should be included.

___

### includeAllIntents

• `Optional` **includeAllIntents**: boolean \| string \| Expression \| BoolExpression

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:15*

Gets or sets a value indicating whether all intents come back or only the top one.

___

### includeInstanceData

• `Optional` **includeInstanceData**: boolean \| string \| Expression \| BoolExpression

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:19*

Gets or sets a value indicating whether or not instance data should be included in response.

___

### log

• `Optional` **log**: boolean \| string \| Expression \| BoolExpression

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:27*

Gets or sets a value indicating whether queries should be logged in LUIS.

___

### preferExternalEntities

• `Optional` **preferExternalEntities**: boolean \| string \| Expression \| BoolExpression

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:35*

Gets or sets a value indicating whether external entities should override other means of recognizing entities.

___

### slot

• `Optional` **slot**: string \| Expression \| StringExpression

*Defined in libraries/botbuilder-ai/lib/luisAdaptivePredictionOptions.d.ts:43*

Gets or sets the LUIS slot to use for the application.
