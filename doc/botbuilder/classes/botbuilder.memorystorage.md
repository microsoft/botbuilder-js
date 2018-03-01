[Bot Builder SDK](../README.md) > [MemoryStorage](../classes/botbuilder.memorystorage.md)



# Class: MemoryStorage


:package: **botbuilder-core-extensions**

Memory based storage provider for a bot.

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


### ⊕ **new MemoryStorage**(memory?: *`undefined`⎮`object`*): [MemoryStorage](botbuilder.memorystorage.md)


*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/8495ddc/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L18)*



Creates a new instance of the storage provider.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| memory | `undefined`⎮`object`   |  (Optional) memory to use for storing items. |





**Returns:** [MemoryStorage](botbuilder.memorystorage.md)

---


## Properties
<a id="etag"></a>

### «Protected» etag

**●  etag**:  *`number`* 

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/8495ddc/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L18)*





___

<a id="memory"></a>

### «Protected» memory

**●  memory**:  *`object`* 

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/8495ddc/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L15)*


#### Type declaration


[k: `string`]: `string`






___


## Methods
<a id="delete"></a>

###  delete

► **delete**(keys: *`string`[]*): `Promise`.<`void`>



*Implementation of [Storage](../interfaces/botbuilder.storage.md).[delete](../interfaces/botbuilder.storage.md#delete)*

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/8495ddc/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L28)*



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

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:26](https://github.com/Microsoft/botbuilder-js/blob/8495ddc/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L26)*



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

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/8495ddc/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L27)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | [StoreItems](../interfaces/botbuilder.storeitems.md)   |  - |





**Returns:** `Promise`.<`void`>





___


