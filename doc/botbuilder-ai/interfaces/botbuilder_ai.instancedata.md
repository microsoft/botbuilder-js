**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / InstanceData

# Interface: InstanceData

Strongly typed information corresponding to a LUIS `$instance` value.

## Hierarchy

* **InstanceData**

## Indexable

▪ [propName: string]: any

Any extra properties.

## Index

### Properties

* [endIndex](botbuilder_ai.instancedata.md#endindex)
* [score](botbuilder_ai.instancedata.md#score)
* [startIndex](botbuilder_ai.instancedata.md#startindex)
* [text](botbuilder_ai.instancedata.md#text)

## Properties

### endIndex

•  **endIndex**: number

*Defined in libraries/botbuilder-ai/lib/instanceData.d.ts:19*

 0-based index of the first character beyond the recognized entity.

___

### score

• `Optional` **score**: number

*Defined in libraries/botbuilder-ai/lib/instanceData.d.ts:27*

(Optional) Confidence in the recognition on a scale from 0.0 - 1.0.

___

### startIndex

•  **startIndex**: number

*Defined in libraries/botbuilder-ai/lib/instanceData.d.ts:15*

0-based index in the analyzed text representing the start of the recognized entity

___

### text

•  **text**: string

*Defined in libraries/botbuilder-ai/lib/instanceData.d.ts:23*

Word broken and normalized text for the entity.
