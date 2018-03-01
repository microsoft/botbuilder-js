[Bot Builder SDK](../README.md) > [MemoryStorage](../classes/botbuilder.memorystorage.md)



# Class: MemoryStorage


Memory based storage provider for a bot.

<table>

<thead>

<tr>

<th>package</th>

<th style="text-align:center">middleware</th>

</tr>

</thead>

<tbody>

<tr>

<td>botbuilder-core-extensions</td>

<td style="text-align:center">no</td>

</tr>

</tbody>

</table>

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


*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:20](https://github.com/Microsoft/botbuilder-js/blob/0bfecb6/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L20)*



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

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:20](https://github.com/Microsoft/botbuilder-js/blob/0bfecb6/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L20)*





___

<a id="memory"></a>

### «Protected» memory

**●  memory**:  *`object`* 

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:17](https://github.com/Microsoft/botbuilder-js/blob/0bfecb6/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L17)*


#### Type declaration


[k: `string`]: `string`






___


## Methods
<a id="delete"></a>

###  delete

► **delete**(keys: *`string`[]*): `Promise`.<`void`>



*Implementation of [Storage](../interfaces/botbuilder.storage.md).[delete](../interfaces/botbuilder.storage.md#delete)*

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:30](https://github.com/Microsoft/botbuilder-js/blob/0bfecb6/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L30)*



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

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/0bfecb6/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L28)*



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

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/0bfecb6/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L29)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | [StoreItems](../interfaces/botbuilder.storeitems.md)   |  - |





**Returns:** `Promise`.<`void`>





___


