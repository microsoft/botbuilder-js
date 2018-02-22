[Bot Builder SDK - Core](../README.md) > [RegExpRecognizer](../classes/botbuilder.regexprecognizer.md)



# Class: RegExpRecognizer


An intent recognizer for detecting the users intent using a series of regular expressions.

One of the primary advantages of using a RegExpRecognizer is that you can easily switch between the use of regular expressions and a LUIS model. This could be useful for running unit tests locally without having to make a cloud request.

The other advantage for non-LUIS bots is that it potentially lets your bot support multiple languages by providing a unique set of expressions for each language.

**Usage Example**

    import { RegExpRecognizer } from 'botbuilder';

    // Define RegExp's for well known commands.
    const recognizer = new RegExpRecognizer()
         .addIntent('HelpIntent', /^help/i)
         .addIntent('CancelIntent', /^cancel/i);

    // init bot and bind to adapter
    const bot = new Bot(adapter);
    // bind recognizer to bot
    bot.use(recognizer);
    // define bot's message handlers
    bot.onReceive((context) => {
        if (context.ifIntent('HelpIntent')) {
            // handle help intent
            context.reply('You selected HelpIntent');
        } else if (context.ifIntent('CancelIntent')) {
           // handle cancel intent
           context.reply('You selected CancelIntent');
        } else {
           // handle all other messages
           context.reply('Welcome to the RegExpRecognizer example. Type "help" for commands, "cancel" to quit');
        }
    });

## Hierarchy


 [IntentRecognizer](botbuilder.intentrecognizer.md)

**↳ RegExpRecognizer**







## Implements

* [Middleware](../interfaces/botbuilder.middleware.md)

## Index

### Constructors

* [constructor](botbuilder.regexprecognizer.md#constructor)


### Methods

* [addIntent](botbuilder.regexprecognizer.md#addintent)
* [onEnabled](botbuilder.regexprecognizer.md#onenabled)
* [onFilter](botbuilder.regexprecognizer.md#onfilter)
* [onRecognize](botbuilder.regexprecognizer.md#onrecognize)
* [receiveActivity](botbuilder.regexprecognizer.md#receiveactivity)
* [recognize](botbuilder.regexprecognizer.md#recognize)
* [findTopIntent](botbuilder.regexprecognizer.md#findtopintent)
* [recognize](botbuilder.regexprecognizer.md#recognize-1)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new RegExpRecognizer**(settings?: *[Partial]()[RegExpRecognizerSettings](../interfaces/botbuilder.regexprecognizersettings.md)*): [RegExpRecognizer](botbuilder.regexprecognizer.md)


*Defined in [libraries/botbuilder/lib/regExpRecognizer.d.ts:61](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/regExpRecognizer.d.ts#L61)*



Creates a new instance of the recognizer.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [Partial]()[RegExpRecognizerSettings](../interfaces/botbuilder.regexprecognizersettings.md)   |  (Optional) settings to customize the recognizer. |





**Returns:** [RegExpRecognizer](botbuilder.regexprecognizer.md)

---


## Methods
<a id="addintent"></a>

###  addIntent

► **addIntent**(name: *`string`*, expressions: *`RegExp`⎮`RegExp`[]⎮[RegExpLocaleMap](../interfaces/botbuilder.regexplocalemap.md)*): `this`



*Defined in [libraries/botbuilder/lib/regExpRecognizer.d.ts:107](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/regExpRecognizer.d.ts#L107)*



Adds a definition for a named intent to the recognizer.

**Usage Example**

    // init recognizer
    let foodRecognizer = new RegExpRecognizer();

    // add intents to recognizer
    foodRecognizer.addIntent('TacosIntent', /taco/i);
    foodRecognizer.addIntent('BurritosIntent', /burrito/i);
    foodRecognizer.addIntent('EnchiladasIntent', /enchiladas/i);

    // add recognizer to bot
    bot.use(foodRecognizer);
    bot.onRecognize((context) => {
        if (context.ifIntent('TacosIntent')) {
            // handle tacos intent
            context.reply('Added one taco to your order');
        }
        else if (context.ifIntent('BurritosIntent')) {
            // handle burritos intent
            context.reply('Added one burrito to your order');
        }
        else if (context.ifIntent('EnchiladasIntent')) {
            // handle enchiladas intent
            context.reply('Added one enchilada to your order');
        }
        else {
           // handle other messages
        }
    })


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string`   |  Name of the intent to return when one of the expression(s) is matched. |
| expressions | `RegExp`⎮`RegExp`[]⎮[RegExpLocaleMap](../interfaces/botbuilder.regexplocalemap.md)   |  Expression(s) to match for this intent. Passing a `RegExpLocaleMap` letsspecify an alternate set of expressions for each language that your bot supports. |





**Returns:** `this`





___

<a id="onenabled"></a>

###  onEnabled

► **onEnabled**(handler: *`function`*): `this`



*Inherited from [IntentRecognizer](botbuilder.intentrecognizer.md).[onEnabled](botbuilder.intentrecognizer.md#onenabled)*

*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:48](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/intentRecognizer.d.ts#L48)*



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

*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/intentRecognizer.d.ts#L68)*



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

*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:56](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/intentRecognizer.d.ts#L56)*



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

*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:33](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/intentRecognizer.d.ts#L33)*



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

*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:39](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/intentRecognizer.d.ts#L39)*



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

*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:77](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/intentRecognizer.d.ts#L77)*



Finds the top scoring intent given a set of intents.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| intents | [Intent](../interfaces/botbuilder.intent.md)[]   |  Array of intents to filter. |





**Returns:** `Promise`.<[Intent](../interfaces/botbuilder.intent.md)⎮`undefined`>





___

<a id="recognize-1"></a>

### «Static» recognize

► **recognize**(text: *`string`*, expression: *`RegExp`*, entityTypes?: *`string`[]*, minScore?: *`undefined`⎮`number`*): [Intent](../interfaces/botbuilder.intent.md)⎮`undefined`



*Defined in [libraries/botbuilder/lib/regExpRecognizer.d.ts:130](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/regExpRecognizer.d.ts#L130)*



Matches a text string using the given expression. If matched, an `Intent` will be returned containing a coverage score, from 0.0 to 1.0, indicating how much of the text matched the expression. The more of the text the matched the greater the score. The name of the intent will be the value of `expression.toString()` and any capture groups will be returned as individual entities of type `string`.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| text | `string`   |  The text string to match against. |
| expression | `RegExp`   |  The expression to match. |
| entityTypes | `string`[]   |  (Optional) array of types to assign to each entity returned for a numberedcapture group. As an example, for the expression `/flight from (.*) to (.*)/i` you couldpass a value of `['fromCity', 'toCity']`. The entity returned for the first capture group willhave a type of `fromCity` and the entity for the second capture group will have a type of`toCity`. The default entity type returned when not specified is `string`. |
| minScore | `undefined`⎮`number`   |  (Optional) minimum score to return for the coverage score. The default valueis 0.0 but if provided, the calculated coverage score will be scaled to a value between theminScore and 1.0\. For example, a expression that matches 50% of the text will result in abase coverage score of 0.5\. If the minScore supplied is also 0.5 the returned score will bescaled to be 0.75 or 50% between 0.5 and 1.0\. As another example, providing a minScore of 1.0will always result in a match returning a score of 1.0. |





**Returns:** [Intent](../interfaces/botbuilder.intent.md)⎮`undefined`





___


