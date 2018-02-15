[Bot Builder SDK - Core](../README.md) > [StorageMiddleware](../classes/botbuilder.storagemiddleware.md)



# Class: StorageMiddleware


Abstract base class for all storage middleware.

## Type parameters
#### SETTINGS :  [StorageSettings](../interfaces/botbuilder.storagesettings.md)

(Optional) settings to configure additional features of the storage provider.

## Hierarchy


 [BotService](botbuilder.botservice.md)[Storage](../interfaces/botbuilder.storage.md)

**↳ StorageMiddleware**

↳  [MemoryStorage](botbuilder.memorystorage.md)










## Implements

* [Middleware](../interfaces/botbuilder.middleware.md)

## Index

### Constructors

* [constructor](botbuilder.storagemiddleware.md#constructor)


### Properties

* [instance](botbuilder.storagemiddleware.md#instance)
* [name](botbuilder.storagemiddleware.md#name)
* [settings](botbuilder.storagemiddleware.md#settings)


### Methods

* [contextCreated](botbuilder.storagemiddleware.md#contextcreated)
* [getService](botbuilder.storagemiddleware.md#getservice)
* [getStorage](botbuilder.storagemiddleware.md#getstorage)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new StorageMiddleware**(settings?: *[Partial]()`SETTINGS`*): [StorageMiddleware](botbuilder.storagemiddleware.md)


*Overrides [BotService](botbuilder.botservice.md).[constructor](botbuilder.botservice.md#constructor)*

*Defined in [libraries/botbuilder/lib/storageMiddleware.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/storageMiddleware.d.ts#L18)*



Creates a new instance of the storage provider.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [Partial]()`SETTINGS`   |  (Optional) settings to configure additional features of the storage provider. |





**Returns:** [StorageMiddleware](botbuilder.storagemiddleware.md)

---


## Properties
<a id="instance"></a>

### «Protected» instance

**●  instance**:  *[Storage](../interfaces/botbuilder.storage.md)⎮`undefined`* 

*Inherited from [BotService](botbuilder.botservice.md).[instance](botbuilder.botservice.md#instance)*

*Defined in [libraries/botbuilder/lib/botService.d.ts:22](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/botService.d.ts#L22)*





___

<a id="name"></a>

### «Protected» name

**●  name**:  *`string`* 

*Inherited from [BotService](botbuilder.botservice.md).[name](botbuilder.botservice.md#name)*

*Defined in [libraries/botbuilder/lib/botService.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/botService.d.ts#L21)*





___

<a id="settings"></a>

###  settings

**●  settings**:  *`SETTINGS`* 

*Defined in [libraries/botbuilder/lib/storageMiddleware.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/storageMiddleware.d.ts#L18)*



Settings that configure the various features of the storage provider.




___


## Methods
<a id="contextcreated"></a>

###  contextCreated

► **contextCreated**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Inherited from [BotService](botbuilder.botservice.md).[contextCreated](botbuilder.botservice.md#contextcreated)*

*Defined in [libraries/botbuilder/lib/botService.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/botService.d.ts#L32)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="getservice"></a>

### «Protected» getService

► **getService**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*): [Storage](../interfaces/botbuilder.storage.md)



*Overrides [BotService](botbuilder.botservice.md).[getService](botbuilder.botservice.md#getservice)*

*Defined in [libraries/botbuilder/lib/storageMiddleware.d.ts:25](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/storageMiddleware.d.ts#L25)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |





**Returns:** [Storage](../interfaces/botbuilder.storage.md)





___

<a id="getstorage"></a>

### «Protected» getStorage

► **getStorage**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*): [Storage](../interfaces/botbuilder.storage.md)



*Defined in [libraries/botbuilder/lib/storageMiddleware.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/storageMiddleware.d.ts#L32)*



Overriden by derived classes to dynamically provide a storage provider instance for a given request.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  Context for the current turn of the conversation. |





**Returns:** [Storage](../interfaces/botbuilder.storage.md)





___


