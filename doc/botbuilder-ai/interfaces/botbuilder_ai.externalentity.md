**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / ExternalEntity

# Interface: ExternalEntity\<T>

Defines a user predicted entity that extends an already existing one.

## Type parameters

Name | Default |
------ | ------ |
`T` | unknown |

## Hierarchy

* **ExternalEntity**

## Index

### Properties

* [entityLength](botbuilder_ai.externalentity.md#entitylength)
* [entityName](botbuilder_ai.externalentity.md#entityname)
* [resolution](botbuilder_ai.externalentity.md#resolution)
* [startIndex](botbuilder_ai.externalentity.md#startindex)

## Properties

### entityLength

• `Optional` **entityLength**: number

*Defined in libraries/botbuilder-ai/lib/externalEntity.d.ts:23*

The length of the predicted entity.

___

### entityName

• `Optional` **entityName**: string

*Defined in libraries/botbuilder-ai/lib/externalEntity.d.ts:15*

The name of the entity to extend.

___

### resolution

• `Optional` **resolution**: T

*Defined in libraries/botbuilder-ai/lib/externalEntity.d.ts:27*

A user supplied custom resolution to return as the entity's prediction.

___

### startIndex

• `Optional` **startIndex**: number

*Defined in libraries/botbuilder-ai/lib/externalEntity.d.ts:19*

The start character index of the predicted entity.
