[Bot Builder SDK - AI](../README.md) > [LuisRecognizer](../classes/botbuilder_ai.luisrecognizer.md)



# Class: LuisRecognizer

## Implements

* [Middleware]()

## Index

### Constructors

* [constructor](botbuilder_ai.luisrecognizer.md#constructor)


### Properties

* [nextInstance](botbuilder_ai.luisrecognizer.md#nextinstance)


### Methods

* [createLuisClient](botbuilder_ai.luisrecognizer.md#createluisclient)
* [get](botbuilder_ai.luisrecognizer.md#get)
* [getIntentsAndEntities](botbuilder_ai.luisrecognizer.md#getintentsandentities)
* [onProcessRequest](botbuilder_ai.luisrecognizer.md#onprocessrequest)
* [recognize](botbuilder_ai.luisrecognizer.md#recognize)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new LuisRecognizer**(settings: *[LuisRecognizerSettings](../interfaces/botbuilder_ai.luisrecognizersettings.md)*): [LuisRecognizer](botbuilder_ai.luisrecognizer.md)


*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:33](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L33)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [LuisRecognizerSettings](../interfaces/botbuilder_ai.luisrecognizersettings.md)   |  - |





**Returns:** [LuisRecognizer](botbuilder_ai.luisrecognizer.md)

---


## Properties
<a id="nextinstance"></a>

### «Static» nextInstance

**●  nextInstance**:  *`number`* 

*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L31)*





___


## Methods
<a id="createluisclient"></a>

### «Protected» createLuisClient

► **createLuisClient**(serviceEndpoint: *`string`*): [LuisClient]()



*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:39](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L39)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| serviceEndpoint | `string`   |  - |





**Returns:** [LuisClient]()





___

<a id="get"></a>

###  get

► **get**(context: *[BotContext]()*): [LuisResult]()⎮`undefined`



*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:37](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L37)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  - |





**Returns:** [LuisResult]()⎮`undefined`





___

<a id="getintentsandentities"></a>

###  getIntentsAndEntities

► **getIntentsAndEntities**(query: *`string`*): `Promise`.<[LuisResult]()>



*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:38](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L38)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| query | `string`   |  - |





**Returns:** `Promise`.<[LuisResult]()>





___

<a id="onprocessrequest"></a>

###  onProcessRequest

► **onProcessRequest**(context: *[BotContext]()*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:35](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L35)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="recognize"></a>

###  recognize

► **recognize**(context: *[BotContext]()*, force?: *`undefined`⎮`true`⎮`false`*): `Promise`.<[LuisResult]()>



*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:36](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L36)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  - |
| force | `undefined`⎮`true`⎮`false`   |  - |





**Returns:** `Promise`.<[LuisResult]()>





___


