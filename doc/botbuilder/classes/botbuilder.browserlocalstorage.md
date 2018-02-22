[Bot Builder SDK - Core](../README.md) > [BrowserLocalStorage](../classes/botbuilder.browserlocalstorage.md)



# Class: BrowserLocalStorage


Storage middleware that uses browser local storage.

**Extends BotContext:**

*   context.storage - Storage provider for storing and retrieving objects.

**Usage Example**

    const bot = new Bot(adapter)
         .use(new BrowserLocalStorage())
         .use(new BotStateManage())
         .onReceive((context) => {
             context.reply(`Hello World`);
         })

## Hierarchy


↳  [MemoryStorage](botbuilder.memorystorage.md)

**↳ BrowserLocalStorage**







## Implements

* [Middleware](../interfaces/botbuilder.middleware.md)
* [Storage](../interfaces/botbuilder.storage.md)

## Index

### Constructors

* [constructor](botbuilder.browserlocalstorage.md#constructor)


### Properties

* [etag](botbuilder.browserlocalstorage.md#etag)
* [instance](botbuilder.browserlocalstorage.md#instance)
* [memory](botbuilder.browserlocalstorage.md#memory)
* [name](botbuilder.browserlocalstorage.md#name)
* [settings](botbuilder.browserlocalstorage.md#settings)


### Methods

* [contextCreated](botbuilder.browserlocalstorage.md#contextcreated)
* [delete](botbuilder.browserlocalstorage.md#delete)
* [getService](botbuilder.browserlocalstorage.md#getservice)
* [getStorage](botbuilder.browserlocalstorage.md#getstorage)
* [read](botbuilder.browserlocalstorage.md#read)
* [write](botbuilder.browserlocalstorage.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BrowserLocalStorage**(options?: *[StorageSettings](../interfaces/botbuilder.storagesettings.md)*): [BrowserLocalStorage](botbuilder.browserlocalstorage.md)


*Overrides [MemoryStorage](botbuilder.memorystorage.md).[constructor](botbuilder.memorystorage.md#constructor)*

*Defined in [libraries/botbuilder/lib/browserStorage.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/browserStorage.d.ts#L27)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [StorageSettings](../interfaces/botbuilder.storagesettings.md)   |  - |





**Returns:** [BrowserLocalStorage](botbuilder.browserlocalstorage.md)

---


## Properties
<a id="etag"></a>

### «Protected» etag

**●  etag**:  *`number`* 

*Inherited from [MemoryStorage](botbuilder.memorystorage.md).[etag](botbuilder.memorystorage.md#etag)*

*Defined in [libraries/botbuilder/lib/memoryStorage.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/memoryStorage.d.ts#L31)*





___

<a id="instance"></a>

### «Protected» instance

**●  instance**:  *[Storage](../interfaces/botbuilder.storage.md)⎮`undefined`* 

*Inherited from [BotService](botbuilder.botservice.md).[instance](botbuilder.botservice.md#instance)*

*Defined in [libraries/botbuilder/lib/botService.d.ts:22](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botService.d.ts#L22)*





___

<a id="memory"></a>

### «Protected» memory

**●  memory**:  *`object`* 

*Inherited from [MemoryStorage](botbuilder.memorystorage.md).[memory](botbuilder.memorystorage.md#memory)*

*Defined in [libraries/botbuilder/lib/memoryStorage.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/memoryStorage.d.ts#L28)*


#### Type declaration


[k: `string`]: `string`






___

<a id="name"></a>

### «Protected» name

**●  name**:  *`string`* 

*Inherited from [BotService](botbuilder.botservice.md).[name](botbuilder.botservice.md#name)*

*Defined in [libraries/botbuilder/lib/botService.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botService.d.ts#L21)*





___

<a id="settings"></a>

###  settings

**●  settings**:  *[StorageSettings](../interfaces/botbuilder.storagesettings.md)* 

*Inherited from [StorageMiddleware](botbuilder.storagemiddleware.md).[settings](botbuilder.storagemiddleware.md#settings)*

*Defined in [libraries/botbuilder/lib/storageMiddleware.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/storageMiddleware.d.ts#L18)*



Settings that configure the various features of the storage provider.




___


## Methods
<a id="contextcreated"></a>

###  contextCreated

► **contextCreated**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Inherited from [BotService](botbuilder.botservice.md).[contextCreated](botbuilder.botservice.md#contextcreated)*

*Defined in [libraries/botbuilder/lib/botService.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botService.d.ts#L32)*



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

*Defined in [libraries/botbuilder/lib/memoryStorage.d.ts:43](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/memoryStorage.d.ts#L43)*



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

*Defined in [libraries/botbuilder/lib/storageMiddleware.d.ts:25](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/storageMiddleware.d.ts#L25)*



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

*Defined in [libraries/botbuilder/lib/memoryStorage.d.ts:44](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/memoryStorage.d.ts#L44)*



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

*Defined in [libraries/botbuilder/lib/memoryStorage.d.ts:41](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/memoryStorage.d.ts#L41)*



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

*Defined in [libraries/botbuilder/lib/memoryStorage.d.ts:42](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/memoryStorage.d.ts#L42)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | [StoreItems](../interfaces/botbuilder.storeitems.md)   |  - |





**Returns:** `Promise`.<`void`>





___


