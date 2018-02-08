[Bot Builder SDK - Core](../README.md) > [MemoryStorage](../classes/botbuilder.memorystorage.md)



# Class: MemoryStorage


Middleware that implements an in memory based storage provider for a bot.

**Extends BotContext:**

*   context.storage - Storage provider for storing and retrieving objects.

**Usage Example**

    const bot = new Bot(adapter)
         .use(new MemoryStorage())
         .use(new BotStateManage())
         .onReceive((context) => {
             context.reply(`Hello World`);
         })

## Hierarchy


↳  [StorageMiddleware](botbuilder.storagemiddleware.md)[StorageSettings](../interfaces/botbuilder.storagesettings.md)

**↳ MemoryStorage**

↳  [BrowserLocalStorage](botbuilder.browserlocalstorage.md)




↳  [BrowserSessionStorage](botbuilder.browsersessionstorage.md)










## Implements

* [Middleware](../interfaces/botbuilder.middleware.md)
* [Storage](../interfaces/botbuilder.storage.md)

## Index

### Constructors

* [constructor](botbuilder.memorystorage.md#constructor)


### Properties

* [etag](botbuilder.memorystorage.md#etag)
* [instance](botbuilder.memorystorage.md#instance)
* [memory](botbuilder.memorystorage.md#memory)
* [name](botbuilder.memorystorage.md#name)
* [settings](botbuilder.memorystorage.md#settings)


### Methods

* [contextCreated](botbuilder.memorystorage.md#contextcreated)
* [delete](botbuilder.memorystorage.md#delete)
* [getService](botbuilder.memorystorage.md#getservice)
* [getStorage](botbuilder.memorystorage.md#getstorage)
* [read](botbuilder.memorystorage.md#read)
* [write](botbuilder.memorystorage.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new MemoryStorage**(settings?: *[Partial]()[StorageSettings](../interfaces/botbuilder.storagesettings.md)*, memory?: *`undefined`⎮`object`*): [MemoryStorage](botbuilder.memorystorage.md)


*Overrides [StorageMiddleware](botbuilder.storagemiddleware.md).[constructor](botbuilder.storagemiddleware.md#constructor)*

*Defined in [libraries/botbuilder/lib/memoryStorage.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/memoryStorage.d.ts#L31)*



Creates a new instance of the storage provider.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [Partial]()[StorageSettings](../interfaces/botbuilder.storagesettings.md)   |  (Optional) setting to configure the provider. |
| memory | `undefined`⎮`object`   |  (Optional) memory to use for storing items. |





**Returns:** [MemoryStorage](botbuilder.memorystorage.md)

---


## Properties
<a id="etag"></a>

### «Protected» etag

**●  etag**:  *`number`* 

*Defined in [libraries/botbuilder/lib/memoryStorage.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/memoryStorage.d.ts#L31)*





___

<a id="instance"></a>

### «Protected» instance

**●  instance**:  *[Storage](../interfaces/botbuilder.storage.md)⎮`undefined`* 

*Inherited from [BotService](botbuilder.botservice.md).[instance](botbuilder.botservice.md#instance)*

*Defined in [libraries/botbuilder/lib/botService.d.ts:22](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/botService.d.ts#L22)*





___

<a id="memory"></a>

### «Protected» memory

**●  memory**:  *`object`* 

*Defined in [libraries/botbuilder/lib/memoryStorage.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/memoryStorage.d.ts#L28)*


#### Type declaration


[k: `string`]: `string`






___

<a id="name"></a>

### «Protected» name

**●  name**:  *`string`* 

*Inherited from [BotService](botbuilder.botservice.md).[name](botbuilder.botservice.md#name)*

*Defined in [libraries/botbuilder/lib/botService.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/botService.d.ts#L21)*





___

<a id="settings"></a>

###  settings

**●  settings**:  *[StorageSettings](../interfaces/botbuilder.storagesettings.md)* 

*Inherited from [StorageMiddleware](botbuilder.storagemiddleware.md).[settings](botbuilder.storagemiddleware.md#settings)*

*Defined in [libraries/botbuilder/lib/storageMiddleware.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/storageMiddleware.d.ts#L18)*



Settings that configure the various features of the storage provider.




___


## Methods
<a id="contextcreated"></a>

###  contextCreated

► **contextCreated**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Inherited from [BotService](botbuilder.botservice.md).[contextCreated](botbuilder.botservice.md#contextcreated)*

*Defined in [libraries/botbuilder/lib/botService.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/botService.d.ts#L32)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="delete"></a>

###  delete

► **delete**(keys: *`string`[]*): `Promise`.<`void`>



*Implementation of [Storage](../interfaces/botbuilder.storage.md).[delete](../interfaces/botbuilder.storage.md#delete)*

*Defined in [libraries/botbuilder/lib/memoryStorage.d.ts:43](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/memoryStorage.d.ts#L43)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| keys | `string`[]   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="getservice"></a>

### «Protected» getService

► **getService**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*): [Storage](../interfaces/botbuilder.storage.md)



*Inherited from [StorageMiddleware](botbuilder.storagemiddleware.md).[getService](botbuilder.storagemiddleware.md#getservice)*

*Overrides [BotService](botbuilder.botservice.md).[getService](botbuilder.botservice.md#getservice)*

*Defined in [libraries/botbuilder/lib/storageMiddleware.d.ts:25](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/storageMiddleware.d.ts#L25)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |





**Returns:** [Storage](../interfaces/botbuilder.storage.md)





___

<a id="getstorage"></a>

### «Protected» getStorage

► **getStorage**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*): [Storage](../interfaces/botbuilder.storage.md)



*Overrides [StorageMiddleware](botbuilder.storagemiddleware.md).[getStorage](botbuilder.storagemiddleware.md#getstorage)*

*Defined in [libraries/botbuilder/lib/memoryStorage.d.ts:44](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/memoryStorage.d.ts#L44)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |





**Returns:** [Storage](../interfaces/botbuilder.storage.md)





___

<a id="read"></a>

###  read

► **read**(keys: *`string`[]*): `Promise`.<[StoreItems](../interfaces/botbuilder.storeitems.md)>



*Implementation of [Storage](../interfaces/botbuilder.storage.md).[read](../interfaces/botbuilder.storage.md#read)*

*Defined in [libraries/botbuilder/lib/memoryStorage.d.ts:41](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/memoryStorage.d.ts#L41)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| keys | `string`[]   |  - |





**Returns:** `Promise`.<[StoreItems](../interfaces/botbuilder.storeitems.md)>





___

<a id="write"></a>

###  write

► **write**(changes: *[StoreItems](../interfaces/botbuilder.storeitems.md)*): `Promise`.<`void`>



*Implementation of [Storage](../interfaces/botbuilder.storage.md).[write](../interfaces/botbuilder.storage.md#write)*

*Defined in [libraries/botbuilder/lib/memoryStorage.d.ts:42](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/memoryStorage.d.ts#L42)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | [StoreItems](../interfaces/botbuilder.storeitems.md)   |  - |





**Returns:** `Promise`.<`void`>





___


