[Bot Builder SDK](../README.md) > [MemoryStorage](../classes/botbuilder.memorystorage.md)



# Class: MemoryStorage


:package: **botbuilder-core-extensions**

Memory based storage provider for a bot. This provider is most useful for simulating production storage when running locally against the emulator or as part of a unit test. It has the following characteristics:

*   Starts off completely empty when the bot is run.
*   Anything written to the store will be forgotten when the process exits.
*   Object that are read and written to the store are cloned to properly simulate network based storage providers.
*   Cloned objects serialized using `JSON.stringify()` to catch any possible serialization related issues that might occur when using a network based storage provider.

**Usage Example**

    const { MemoryStorage } = require('botbuilder');

    const storage = new MemoryStorage();

## Hierarchy

**MemoryStorage**

↳  [BrowserLocalStorage](botbuilder.browserlocalstorage.md)




↳  [BrowserSessionStorage](botbuilder.browsersessionstorage.md)








## Implements

* [Storage](../interfaces/botbuilder.storage.md)

## Index

### Constructors

* [constructor](botbuilder.memorystorage.md#constructor)


### Properties

* [etag](botbuilder.memorystorage.md#etag)
* [memory](botbuilder.memorystorage.md#memory)


### Methods

* [delete](botbuilder.memorystorage.md#delete)
* [read](botbuilder.memorystorage.md#read)
* [write](botbuilder.memorystorage.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new MemoryStorage**(memory?: *`object`*): [MemoryStorage](botbuilder.memorystorage.md)


*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:35](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L35)*



Creates a new MemoryStorage instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| memory | `object`   |  (Optional) memory to use for storing items. By default it will create an empty JSON object `{}`. |





**Returns:** [MemoryStorage](botbuilder.memorystorage.md)

---


## Properties
<a id="etag"></a>

### «Protected» etag

**●  etag**:  *`number`* 

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:35](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L35)*





___

<a id="memory"></a>

### «Protected» memory

**●  memory**:  *`object`* 

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L32)*


#### Type declaration


[k: `string`]: `string`






___


## Methods
<a id="delete"></a>

###  delete

► **delete**(keys: *`string`[]*): `Promise`.<`void`>



*Implementation of [Storage](../interfaces/botbuilder.storage.md).[delete](../interfaces/botbuilder.storage.md#delete)*

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:45](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L45)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| keys | `string`[]   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="read"></a>

###  read

► **read**(keys: *`string`[]*): `Promise`.<[StoreItems](../interfaces/botbuilder.storeitems.md)>



*Implementation of [Storage](../interfaces/botbuilder.storage.md).[read](../interfaces/botbuilder.storage.md#read)*

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:43](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L43)*



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

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:44](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L44)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | [StoreItems](../interfaces/botbuilder.storeitems.md)   |  - |





**Returns:** `Promise`.<`void`>





___


