[Bot Builder SDK - Core](../README.md) > [IntentRecognizer](../classes/botbuilder.intentrecognizer.md)



# Class: IntentRecognizer


Middleware that's the base class for all intent recognizers.

**Extends BotContext:**

*   context.topIntent - The top recognized `Intent` for the users utterance.

## Hierarchy

**IntentRecognizer**

↳  [AttachmentRecognizer](botbuilder.attachmentrecognizer.md)




↳  [IntentRecognizerSet](botbuilder.intentrecognizerset.md)




↳  [RegExpRecognizer](botbuilder.regexprecognizer.md)








## Implements

* [Middleware](../interfaces/botbuilder.middleware.md)

## Index

### Methods

* [onEnabled](botbuilder.intentrecognizer.md#onenabled)
* [onFilter](botbuilder.intentrecognizer.md#onfilter)
* [onRecognize](botbuilder.intentrecognizer.md#onrecognize)
* [receiveActivity](botbuilder.intentrecognizer.md#receiveactivity)
* [recognize](botbuilder.intentrecognizer.md#recognize)
* [findTopIntent](botbuilder.intentrecognizer.md#findtopintent)



---
## Methods
<a id="onenabled"></a>

###  onEnabled

► **onEnabled**(handler: *`function`*): `this`



*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:48](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/intentRecognizer.d.ts#L48)*



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



*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/intentRecognizer.d.ts#L68)*



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



*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:56](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/intentRecognizer.d.ts#L56)*



Adds a handler that will be called to recognize the users intent. Multiple handlers can be registered and they will be called in the reverse order they are added so the last handler added will be the first called.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| handler | `function`   |  Function that will be called to recognize a users intent. |





**Returns:** `this`





___

<a id="receiveactivity"></a>

###  receiveActivity

► **receiveActivity**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:33](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/intentRecognizer.d.ts#L33)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="recognize"></a>

###  recognize

► **recognize**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*): `Promise`.<[Intent](../interfaces/botbuilder.intent.md)[]>



*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:39](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/intentRecognizer.d.ts#L39)*



Recognizes intents for the current context. The return value is 0 or more recognized intents.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  Context for the current turn of the conversation. |





**Returns:** `Promise`.<[Intent](../interfaces/botbuilder.intent.md)[]>





___

<a id="findtopintent"></a>

### «Static» findTopIntent

► **findTopIntent**(intents: *[Intent](../interfaces/botbuilder.intent.md)[]*): `Promise`.<[Intent](../interfaces/botbuilder.intent.md)⎮`undefined`>



*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:77](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/intentRecognizer.d.ts#L77)*



Finds the top scoring intent given a set of intents.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| intents | [Intent](../interfaces/botbuilder.intent.md)[]   |  Array of intents to filter. |





**Returns:** `Promise`.<[Intent](../interfaces/botbuilder.intent.md)⎮`undefined`>





___


