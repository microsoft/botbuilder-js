[Bot Builder SDK - Node](../README.md) > [ConsoleAdapter](../classes/botbuilder_node.consoleadapter.md)



# Class: ConsoleAdapter


Lets a user communicate with a bot from a console window.

**Usage Example**

    const adapter = new ConsoleAdapter().listen();
    const bot = new Bot(adapter)
         .onReceive((context) => {
             context.reply(`Hello World!`);
         });

## Implements

* [ActivityAdapter]()

## Index

### Constructors

* [constructor](botbuilder_node.consoleadapter.md#constructor)


### Properties

* [onReceive](botbuilder_node.consoleadapter.md#onreceive)


### Methods

* [listen](botbuilder_node.consoleadapter.md#listen)
* [post](botbuilder_node.consoleadapter.md#post)
* [receive](botbuilder_node.consoleadapter.md#receive)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new ConsoleAdapter**(): [ConsoleAdapter](botbuilder_node.consoleadapter.md)


*Defined in [libraries/botbuilder-node/lib/consoleAdapter.d.ts:24](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-node/lib/consoleAdapter.d.ts#L24)*





**Returns:** [ConsoleAdapter](botbuilder_node.consoleadapter.md)

---


## Properties
<a id="onreceive"></a>

###  onReceive

**●  onReceive**:  *`function`* 

*Implementation of ActivityAdapter.onReceive*

*Defined in [libraries/botbuilder-node/lib/consoleAdapter.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-node/lib/consoleAdapter.d.ts#L27)*



INTERNAL implementation of `Adapter.onReceive`.

#### Type declaration
►(activity: *[Activity]()*): `Promise`.<`void`>



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Activity]()   |  - |





**Returns:** `Promise`.<`void`>






___


## Methods
<a id="listen"></a>

###  listen

► **listen**(): `this`



*Defined in [libraries/botbuilder-node/lib/consoleAdapter.d.ts:34](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-node/lib/consoleAdapter.d.ts#L34)*



Begins listening to console input. The listener will call [receive()](#receive) after parsing input from the user.




**Returns:** `this`





___

<a id="post"></a>

###  post

► **post**(activities: *[Partial]()[Activity]()[]*): `Promise`.<[ConversationResourceResponse]()[]>



*Implementation of ActivityAdapter.post*

*Defined in [libraries/botbuilder-node/lib/consoleAdapter.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-node/lib/consoleAdapter.d.ts#L29)*



INTERNAL implementation of `Adapter.post()`.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()[Activity]()[]   |  - |





**Returns:** `Promise`.<[ConversationResourceResponse]()[]>





___

<a id="receive"></a>

###  receive

► **receive**(text: *`string`*): `this`



*Defined in [libraries/botbuilder-node/lib/consoleAdapter.d.ts:40](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-node/lib/consoleAdapter.d.ts#L40)*



Processes input received from the user.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| text | `string`   |  The users utterance. |





**Returns:** `this`





___


