[Bot Builder SDK - Azure](../README.md) > [botbuilder](../modules/botbuilder.md) > [BrowserSessionStorage](../classes/botbuilder.browsersessionstorage.md)



# Class: BrowserSessionStorage


Storage middleware that uses browser session storage.

**Extends BotContext:**

*   context.storage - Storage provider for storing and retrieving objects.

**Usage Example**

    const bot = new Bot(adapter)
         .use(new BrowserSessionStorage())
         .use(new BotStateManage())
         .onReceive((context) => {
             context.reply(`Hello World`);
         })

## Hierarchy


↳  [MemoryStorage](botbuilder.memorystorage.md)

**↳ BrowserSessionStorage**







## Implements

* [Middleware](../interfaces/botbuilder.middleware.md)
* [Storage](../interfaces/botbuilder.storage.md)

## Index

### Constructors

* [constructor](botbuilder.browsersessionstorage.md#constructor)


### Properties

* [etag](botbuilder.browsersessionstorage.md#etag)
* [instance](botbuilder.browsersessionstorage.md#instance)
* [memory](botbuilder.browsersessionstorage.md#memory)
* [name](botbuilder.browsersessionstorage.md#name)
* [settings](botbuilder.browsersessionstorage.md#settings)


### Methods

* [contextCreated](botbuilder.browsersessionstorage.md#contextcreated)
* [delete](botbuilder.browsersessionstorage.md#delete)
* [getService](botbuilder.browsersessionstorage.md#getservice)
* [getStorage](botbuilder.browsersessionstorage.md#getstorage)
* [read](botbuilder.browsersessionstorage.md#read)
* [write](botbuilder.browsersessionstorage.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BrowserSessionStorage**(options?: *[StorageSettings](../interfaces/botbuilder.storagesettings.md)*): [BrowserSessionStorage](botbuilder.browsersessionstorage.md)


*Overrides [MemoryStorage](botbuilder.memorystorage.md).[constructor](botbuilder.memorystorage.md#constructor)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/browserStorage.d.ts:44*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [StorageSettings](../interfaces/botbuilder.storagesettings.md)   |  - |





**Returns:** [BrowserSessionStorage](botbuilder.browsersessionstorage.md)

---


## Properties
<a id="etag"></a>

### «Protected» etag

**●  etag**:  *`number`* 

*Inherited from [MemoryStorage](botbuilder.memorystorage.md).[etag](botbuilder.memorystorage.md#etag)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/memoryStorage.d.ts:28*





___

<a id="instance"></a>

### «Protected» instance

**●  instance**:  *[Storage](../interfaces/botbuilder.storage.md)⎮`undefined`* 

*Inherited from [BotService](botbuilder.botservice.md).[instance](botbuilder.botservice.md#instance)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botService.d.ts:19*





___

<a id="memory"></a>

### «Protected» memory

**●  memory**:  *`object`* 

*Inherited from [MemoryStorage](botbuilder.memorystorage.md).[memory](botbuilder.memorystorage.md#memory)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/memoryStorage.d.ts:25*


#### Type declaration


[k: `string`]: `string`






___

<a id="name"></a>

### «Protected» name

**●  name**:  *`string`* 

*Inherited from [BotService](botbuilder.botservice.md).[name](botbuilder.botservice.md#name)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botService.d.ts:18*





___

<a id="settings"></a>

###  settings

**●  settings**:  *[StorageSettings](../interfaces/botbuilder.storagesettings.md)* 

*Inherited from [StorageMiddleware](botbuilder.storagemiddleware.md).[settings](botbuilder.storagemiddleware.md#settings)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/storageMiddleware.d.ts:15*



Settings that configure the various features of the storage provider.




___


## Methods
<a id="contextcreated"></a>

###  contextCreated

► **contextCreated**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Inherited from [BotService](botbuilder.botservice.md).[contextCreated](botbuilder.botservice.md#contextcreated)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botService.d.ts:29*



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

*Inherited from [MemoryStorage](botbuilder.memorystorage.md).[delete](botbuilder.memorystorage.md#delete)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/memoryStorage.d.ts:40*



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

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/storageMiddleware.d.ts:22*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |





**Returns:** [Storage](../interfaces/botbuilder.storage.md)





___

<a id="getstorage"></a>

### «Protected» getStorage

► **getStorage**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*): [Storage](../interfaces/botbuilder.storage.md)



*Inherited from [MemoryStorage](botbuilder.memorystorage.md).[getStorage](botbuilder.memorystorage.md#getstorage)*

*Overrides [StorageMiddleware](botbuilder.storagemiddleware.md).[getStorage](botbuilder.storagemiddleware.md#getstorage)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/memoryStorage.d.ts:41*



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

*Inherited from [MemoryStorage](botbuilder.memorystorage.md).[read](botbuilder.memorystorage.md#read)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/memoryStorage.d.ts:38*



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

*Inherited from [MemoryStorage](botbuilder.memorystorage.md).[write](botbuilder.memorystorage.md#write)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/memoryStorage.d.ts:39*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | [StoreItems](../interfaces/botbuilder.storeitems.md)   |  - |





**Returns:** `Promise`.<`void`>





___


