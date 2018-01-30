[Bot Builder SDK - Core](../README.md) > [BotService](../classes/botbuilder.botservice.md)



# Class: BotService


Middleware that simplifies adding a new service to the BotContext. Services expose themselves as a new property of the BotContext and this class formalizes that process.

This class is typically derived from but can also be used like `bot.use(new BotService('myService', new MyService()));`. The registered service would be accessible globally by developers through `context.myService`.

**Extends BotContext:**

*   context. <service name="">- New service</service>

## Type parameters
#### T 
## Hierarchy

**BotService**

↳  [StorageMiddleware](botbuilder.storagemiddleware.md)








## Implements

* [Middleware](../interfaces/botbuilder.middleware.md)

## Index

### Constructors

* [constructor](botbuilder.botservice.md#constructor)


### Properties

* [instance](botbuilder.botservice.md#instance)
* [name](botbuilder.botservice.md#name)


### Methods

* [contextCreated](botbuilder.botservice.md#contextcreated)
* [getService](botbuilder.botservice.md#getservice)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BotService**(name: *`string`*, instance?: *`T`⎮`undefined`*): [BotService](botbuilder.botservice.md)


*Defined in [libraries/botbuilder/lib/botService.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botService.d.ts#L19)*



Creates a new instance of a service definition.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string`   |  Name of the service being registered. This is the property off the context objectthat will be used by developers to access the service. |
| instance | `T`⎮`undefined`   |  (Optional) singleton instance of the service to add to the context object.Dynamic instances can be added by implementing [getService()](#getservice). |





**Returns:** [BotService](botbuilder.botservice.md)

---


## Properties
<a id="instance"></a>

### «Protected» instance

**●  instance**:  *`T`⎮`undefined`* 

*Defined in [libraries/botbuilder/lib/botService.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botService.d.ts#L19)*





___

<a id="name"></a>

### «Protected» name

**●  name**:  *`string`* 

*Defined in [libraries/botbuilder/lib/botService.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botService.d.ts#L18)*





___


## Methods
<a id="contextcreated"></a>

###  contextCreated

► **contextCreated**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botService.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botService.d.ts#L29)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="getservice"></a>

### «Protected» getService

► **getService**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*): `T`



*Defined in [libraries/botbuilder/lib/botService.d.ts:35](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botService.d.ts#L35)*



Overrided by derived classes to register a dynamic instance of the service.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  Context for the current turn of the conversation. |





**Returns:** `T`





___


