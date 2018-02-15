[Bot Builder SDK - AI](../README.md) > [LuisRecognizer](../classes/botbuilder_ai.luisrecognizer.md)



# Class: LuisRecognizer

## Hierarchy


 [IntentRecognizer]()

**↳ LuisRecognizer**







## Implements

* [Middleware]()

## Index

### Constructors

* [constructor](botbuilder_ai.luisrecognizer.md#constructor)


### Methods

* [onEnabled](botbuilder_ai.luisrecognizer.md#onenabled)
* [onFilter](botbuilder_ai.luisrecognizer.md#onfilter)
* [onRecognize](botbuilder_ai.luisrecognizer.md#onrecognize)
* [receiveActivity](botbuilder_ai.luisrecognizer.md#receiveactivity)
* [recognize](botbuilder_ai.luisrecognizer.md#recognize)
* [findTopIntent](botbuilder_ai.luisrecognizer.md#findtopintent)
* [recognize](botbuilder_ai.luisrecognizer.md#recognize-1)
* [recognizeAndMap](botbuilder_ai.luisrecognizer.md#recognizeandmap)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new LuisRecognizer**(options: *[LuisRecognizerOptions](../interfaces/botbuilder_ai.luisrecognizeroptions.md)*): [LuisRecognizer](botbuilder_ai.luisrecognizer.md)


### ⊕ **new LuisRecognizer**(appId: *`string`*, subscriptionKey: *`string`*): [LuisRecognizer](botbuilder_ai.luisrecognizer.md)


*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L31)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [LuisRecognizerOptions](../interfaces/botbuilder_ai.luisrecognizeroptions.md)   |  - |





**Returns:** [LuisRecognizer](botbuilder_ai.luisrecognizer.md)

*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L32)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| appId | `string`   |  - |
| subscriptionKey | `string`   |  - |





**Returns:** [LuisRecognizer](botbuilder_ai.luisrecognizer.md)

---


## Methods
<a id="onenabled"></a>

###  onEnabled

► **onEnabled**(handler: *`function`*): `this`



*Inherited from IntentRecognizer.onEnabled*

*Defined in libraries/botbuilder-ai/node_modules/botbuilder/lib/intentRecognizer.d.ts:48*



Adds a handler that lets you conditionally determine if a recognizer should run. Multiple handlers can be registered and they will be called in the reverse order they are added so the last handler added will be the first called.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| handler | `function`   |  Function that will be called anytime the recognizer is run. If the handlerreturns true the recognizer will be run. Returning false disables the recognizer. |





**Returns:** `this`





___

<a id="onfilter"></a>

###  onFilter

► **onFilter**(handler: *`function`*): `this`



*Inherited from IntentRecognizer.onFilter*

*Defined in libraries/botbuilder-ai/node_modules/botbuilder/lib/intentRecognizer.d.ts:68*



Adds a handler that will be called post recognition to filter the output of the recognizer. The filter receives all of the intents that were recognized and can return a subset, or additional, or even all new intents as its response. This filtering adds a convenient second layer of processing to intent recognition. Multiple handlers can be registered and they will be called in the order they are added.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| handler | `function`   |  Function that will be called to filter the output intents. If an array is returnedthat will become the new set of output intents passed on to the next filter. The final filter inthe chain will reduce the output set of intents to a single top scoring intent. |





**Returns:** `this`





___

<a id="onrecognize"></a>

###  onRecognize

► **onRecognize**(handler: *`function`*): `this`



*Inherited from IntentRecognizer.onRecognize*

*Defined in libraries/botbuilder-ai/node_modules/botbuilder/lib/intentRecognizer.d.ts:56*



Adds a handler that will be called to recognize the users intent. Multiple handlers can be registered and they will be called in the reverse order they are added so the last handler added will be the first called.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| handler | `function`   |  Function that will be called to recognize a users intent. |





**Returns:** `this`





___

<a id="receiveactivity"></a>

###  receiveActivity

► **receiveActivity**(context: *[BotContext]()*, next: *`function`*): `Promise`.<`void`>



*Inherited from IntentRecognizer.receiveActivity*

*Defined in libraries/botbuilder-ai/node_modules/botbuilder/lib/intentRecognizer.d.ts:33*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="recognize"></a>

###  recognize

► **recognize**(context: *[BotContext]()*): `Promise`.<[Intent]()[]>



*Inherited from IntentRecognizer.recognize*

*Defined in libraries/botbuilder-ai/node_modules/botbuilder/lib/intentRecognizer.d.ts:39*



Recognizes intents for the current context. The return value is 0 or more recognized intents.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  Context for the current turn of the conversation. |





**Returns:** `Promise`.<[Intent]()[]>





___

<a id="findtopintent"></a>

### «Static» findTopIntent

► **findTopIntent**(intents: *[Intent]()[]*): `Promise`.<[Intent]()⎮`undefined`>



*Inherited from IntentRecognizer.findTopIntent*

*Defined in libraries/botbuilder-ai/node_modules/botbuilder/lib/intentRecognizer.d.ts:77*



Finds the top scoring intent given a set of intents.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| intents | [Intent]()[]   |  Array of intents to filter. |





**Returns:** `Promise`.<[Intent]()⎮`undefined`>





___

<a id="recognize-1"></a>

### «Static» recognize

► **recognize**(utterance: *`string`*, options: *[LuisRecognizerOptions](../interfaces/botbuilder_ai.luisrecognizeroptions.md)*): `Promise`.<[Intent]()>



*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:34](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L34)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| utterance | `string`   |  - |
| options | [LuisRecognizerOptions](../interfaces/botbuilder_ai.luisrecognizeroptions.md)   |  - |





**Returns:** `Promise`.<[Intent]()>





___

<a id="recognizeandmap"></a>

### «Static»«Protected» recognizeAndMap

► **recognizeAndMap**(client: *[LuisClient]()*, utterance: *`string`*, options: *[LuisRecognizerOptions](../interfaces/botbuilder_ai.luisrecognizeroptions.md)*): `Promise`.<[Intent]()>



*Defined in [libraries/botbuilder-ai/lib/luisRecognizer.d.ts:35](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-ai/lib/luisRecognizer.d.ts#L35)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| client | [LuisClient]()   |  - |
| utterance | `string`   |  - |
| options | [LuisRecognizerOptions](../interfaces/botbuilder_ai.luisrecognizeroptions.md)   |  - |





**Returns:** `Promise`.<[Intent]()>





___


