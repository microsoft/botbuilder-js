[Bot Builder SDK - Core](../README.md) > [IntentRecognizerSet](../classes/botbuilder.intentrecognizerset.md)



# Class: IntentRecognizerSet


Optimizes the execution of multiple intent recognizers. An intent recognizer set can be configured to execute its recognizers either in parallel (the default) or in series. The output of the set will be a single intent that had the highest score.

The intent recognizer set is itself an intent recognizer which means that it can be conditionally disabled or have its output filtered just like any other recognizer. It can even be composed into other recognizer sets allowing for sophisticated recognizer hierarchies to be created.

**Usage Example**

    // Define RegExp's for well known commands.
    const recognizer = new RegExpRecognizer({ minScore: 1.0 })
         .addIntent('HelpIntent', /^help/i)
         .addIntent('CancelIntent', /^cancel/i);

    // Create a set that will only call LUIS for unknown commands.
    const recognizerSet = new IntentRecognizerSet({ recognizeOrder: RecognizeOrder.series })
         .add(recognizer)
         .add(new LuisRecognizer('Model ID', 'Subscription Key'));

    // Add set to bot.
    const bot = new Bot(adapter)
         .use(recognizerSet)
         .onReceive((context) => {
             if (context.ifIntent('HelpIntent')) {
                 // ... help
             } else if (context.ifIntent('CancelIntent')) {
                 // ... cancel
             } else {
                 // ... default logic
             }
         });

## Hierarchy


 [IntentRecognizer](botbuilder.intentrecognizer.md)

**↳ IntentRecognizerSet**







## Implements

* [Middleware](../interfaces/botbuilder.middleware.md)

## Index

### Constructors

* [constructor](botbuilder.intentrecognizerset.md#constructor)


### Methods

* [add](botbuilder.intentrecognizerset.md#add)
* [onEnabled](botbuilder.intentrecognizerset.md#onenabled)
* [onFilter](botbuilder.intentrecognizerset.md#onfilter)
* [onRecognize](botbuilder.intentrecognizerset.md#onrecognize)
* [receiveActivity](botbuilder.intentrecognizerset.md#receiveactivity)
* [recognize](botbuilder.intentrecognizerset.md#recognize)
* [findTopIntent](botbuilder.intentrecognizerset.md#findtopintent)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new IntentRecognizerSet**(settings?: *[IntentRecognizerSetSettings](../interfaces/botbuilder.intentrecognizersetsettings.md)*): [IntentRecognizerSet](botbuilder.intentrecognizerset.md)


*Defined in [libraries/botbuilder/lib/intentRecognizerSet.d.ts:66](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/intentRecognizerSet.d.ts#L66)*



Creates a new instance of a recognizer set.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [IntentRecognizerSetSettings](../interfaces/botbuilder.intentrecognizersetsettings.md)   |  (Optional) settings to customize the sets execution strategy. |





**Returns:** [IntentRecognizerSet](botbuilder.intentrecognizerset.md)

---


## Methods
<a id="add"></a>

###  add

► **add**(...recognizers: *[IntentRecognizer](botbuilder.intentrecognizer.md)[]*): `this`



*Defined in [libraries/botbuilder/lib/intentRecognizerSet.d.ts:79](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/intentRecognizerSet.d.ts#L79)*



Adds recognizer(s) to the set. Recognizers will be evaluated in the order they're added to the set.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| recognizers | [IntentRecognizer](botbuilder.intentrecognizer.md)[]   |  One or more recognizers to add to the set. |





**Returns:** `this`





___

<a id="onenabled"></a>

###  onEnabled

► **onEnabled**(handler: *`function`*): `this`



*Inherited from [IntentRecognizer](botbuilder.intentrecognizer.md).[onEnabled](botbuilder.intentrecognizer.md#onenabled)*

*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:48](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/intentRecognizer.d.ts#L48)*



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



*Inherited from [IntentRecognizer](botbuilder.intentrecognizer.md).[onFilter](botbuilder.intentrecognizer.md#onfilter)*

*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/intentRecognizer.d.ts#L68)*



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



*Inherited from [IntentRecognizer](botbuilder.intentrecognizer.md).[onRecognize](botbuilder.intentrecognizer.md#onrecognize)*

*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:56](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/intentRecognizer.d.ts#L56)*



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



*Inherited from [IntentRecognizer](botbuilder.intentrecognizer.md).[receiveActivity](botbuilder.intentrecognizer.md#receiveactivity)*

*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:33](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/intentRecognizer.d.ts#L33)*



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



*Inherited from [IntentRecognizer](botbuilder.intentrecognizer.md).[recognize](botbuilder.intentrecognizer.md#recognize)*

*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:39](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/intentRecognizer.d.ts#L39)*



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



*Inherited from [IntentRecognizer](botbuilder.intentrecognizer.md).[findTopIntent](botbuilder.intentrecognizer.md#findtopintent)*

*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:77](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/intentRecognizer.d.ts#L77)*



Finds the top scoring intent given a set of intents.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| intents | [Intent](../interfaces/botbuilder.intent.md)[]   |  Array of intents to filter. |





**Returns:** `Promise`.<[Intent](../interfaces/botbuilder.intent.md)⎮`undefined`>





___


