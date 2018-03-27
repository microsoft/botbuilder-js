[Bot Builder SDK - AI](../README.md) > [LuisRecognizer](../classes/botbuilder_ai.luisrecognizer.md)



# Class: LuisRecognizer

## Implements

* `any`

## Index

### Constructors

* [constructor](botbuilder_ai.luisrecognizer.md#constructor)


### Methods

* [createClient](botbuilder_ai.luisrecognizer.md#createclient)
* [get](botbuilder_ai.luisrecognizer.md#get)
* [onProcessRequest](botbuilder_ai.luisrecognizer.md#onprocessrequest)
* [recognize](botbuilder_ai.luisrecognizer.md#recognize)
* [topIntent](botbuilder_ai.luisrecognizer.md#topintent)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new LuisRecognizer**(settings: *[LuisRecognizerSettings](../interfaces/botbuilder_ai.luisrecognizersettings.md)*): [LuisRecognizer](botbuilder_ai.luisrecognizer.md)


*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:43](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L43)*



Creates a new LuisRecognizer instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [LuisRecognizerSettings](../interfaces/botbuilder_ai.luisrecognizersettings.md)   |  Settings used to configure the instance. |





**Returns:** [LuisRecognizer](botbuilder_ai.luisrecognizer.md)

---


## Methods
<a id="createclient"></a>

### «Protected» createClient

► **createClient**(baseUri: *`string`*): `LuisClient`



*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:71](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L71)*



Called internally to create a LuisClient instance. This is exposed to enable better unit testing of teh recognizer.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| baseUri | `string`   |  Service endpoint being called. |





**Returns:** `LuisClient`





___

<a id="get"></a>

###  get

► **get**(context: *`BotContext`*): [LuisRecognizerResult](../interfaces/botbuilder_ai.luisrecognizerresult.md)⎮`undefined`



*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:56](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L56)*



Returns the results cached from a previous call to [recognize()](#recognize) for the current turn with the user. This will return `undefined` if recognize() hasn't been called for the current turn.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  Context for the current turn of conversation with the use. |





**Returns:** [LuisRecognizerResult](../interfaces/botbuilder_ai.luisrecognizerresult.md)⎮`undefined`





___

<a id="onprocessrequest"></a>

###  onProcessRequest

► **onProcessRequest**(context: *`BotContext`*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:49](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L49)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="recognize"></a>

###  recognize

► **recognize**(context: *`BotContext`*, force?: *`boolean`*): `Promise`.<[LuisRecognizerResult](../interfaces/botbuilder_ai.luisrecognizerresult.md)>



*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:65](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L65)*



Calls LUIS to recognize intents and entities in a users utterance. The results of the call will be cached to the context object for the turn and future calls to recognize() for the same context object will result in the cached value being returned. This behavior can be overridden using the `force` parameter.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  Context for the current turn of conversation with the use. |
| force | `boolean`   |  (Optional) flag that if `true` will force the call to LUIS even if a cached result exists. Defaults to a value of `false`. |





**Returns:** `Promise`.<[LuisRecognizerResult](../interfaces/botbuilder_ai.luisrecognizerresult.md)>





___

<a id="topintent"></a>

### «Static» topIntent

► **topIntent**(results: *[LuisRecognizerResult](../interfaces/botbuilder_ai.luisrecognizerresult.md)⎮`undefined`*, defaultIntent?: *`string`*, minScore?: *`number`*): `string`



*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:78](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L78)*



Returns the name of the top scoring intent from a set of LUIS results.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| results | [LuisRecognizerResult](../interfaces/botbuilder_ai.luisrecognizerresult.md)⎮`undefined`   |  Result set to be searched. |
| defaultIntent | `string`   |  (Optional) intent name to return should a top intent be found. Defaults to a value of `None`. |
| minScore | `number`   |  (Optional) minimum score needed for an intent to be considered as a top intent. If all intents in the set are below this threshold then the `defaultIntent` will be returned. Defaults to a value of `0.0`. |





**Returns:** `string`





___


