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


*Defined in [libraries/botbuilder-node/lib/consoleAdapter.d.ts:25](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-node/lib/consoleAdapter.d.ts#L25)*





**Returns:** [ConsoleAdapter](botbuilder_node.consoleadapter.md)

---


## Properties
<a id="onreceive"></a>

###  onReceive

**●  onReceive**:  *`function`* 

*Implementation of ActivityAdapter.onReceive*

*Defined in [libraries/botbuilder-node/lib/consoleAdapter.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-node/lib/consoleAdapter.d.ts#L28)*



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



*Defined in [libraries/botbuilder-node/lib/consoleAdapter.d.ts:35](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-node/lib/consoleAdapter.d.ts#L35)*



Begins listening to console input. The listener will call [receive()](#receive) after parsing input from the user.




**Returns:** `this`





___

<a id="post"></a>

###  post

► **post**(activities: *[Partial]()[Activity]()[]*): `Promise`.<[ResourceResponse]()[]>



*Implementation of ActivityAdapter.post*

*Defined in [libraries/botbuilder-node/lib/consoleAdapter.d.ts:30](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-node/lib/consoleAdapter.d.ts#L30)*



INTERNAL implementation of `Adapter.post()`.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()[Activity]()[]   |  - |





**Returns:** `Promise`.<[ResourceResponse]()[]>





___

<a id="receive"></a>

###  receive

► **receive**(text: *`string`*): `this`



*Defined in [libraries/botbuilder-node/lib/consoleAdapter.d.ts:41](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-node/lib/consoleAdapter.d.ts#L41)*



Processes input received from the user.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| text | `string`   |  The users utterance. |





**Returns:** `this`





___


