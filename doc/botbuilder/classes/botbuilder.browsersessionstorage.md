[Bot Builder SDK](../README.md) > [BrowserSessionStorage](../classes/botbuilder.browsersessionstorage.md)



# Class: BrowserSessionStorage


Storage provider that uses browser session storage.

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


 [MemoryStorage](botbuilder.memorystorage.md)

**↳ BrowserSessionStorage**







## Implements

* [Storage](../interfaces/botbuilder.storage.md)

## Index

### Constructors

* [constructor](botbuilder.browsersessionstorage.md#constructor)


### Properties

* [etag](botbuilder.browsersessionstorage.md#etag)
* [memory](botbuilder.browsersessionstorage.md#memory)


### Methods

* [delete](botbuilder.browsersessionstorage.md#delete)
* [read](botbuilder.browsersessionstorage.md#read)
* [write](botbuilder.browsersessionstorage.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BrowserSessionStorage**(): [BrowserSessionStorage](botbuilder.browsersessionstorage.md)


*Overrides [MemoryStorage](botbuilder.memorystorage.md).[constructor](botbuilder.memorystorage.md#constructor)*

*Defined in [libraries/botbuilder-core-extensions/lib/browserStorage.d.ts:26](https://github.com/Microsoft/botbuilder-js/blob/b68a82a/libraries/botbuilder-core-extensions/lib/browserStorage.d.ts#L26)*





**Returns:** [BrowserSessionStorage](botbuilder.browsersessionstorage.md)

---


## Properties
<a id="etag"></a>

### «Protected» etag

**●  etag**:  *`number`* 

*Inherited from [MemoryStorage](botbuilder.memorystorage.md).[etag](botbuilder.memorystorage.md#etag)*

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:20](https://github.com/Microsoft/botbuilder-js/blob/b68a82a/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L20)*





___

<a id="memory"></a>

### «Protected» memory

**●  memory**:  *`object`* 

*Inherited from [MemoryStorage](botbuilder.memorystorage.md).[memory](botbuilder.memorystorage.md#memory)*

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:17](https://github.com/Microsoft/botbuilder-js/blob/b68a82a/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L17)*


#### Type declaration


[k: `string`]: `string`






___


## Methods
<a id="delete"></a>

###  delete

► **delete**(keys: *`string`[]*): `Promise`.<`void`>



*Implementation of [Storage](../interfaces/botbuilder.storage.md).[delete](../interfaces/botbuilder.storage.md#delete)*

*Inherited from [MemoryStorage](botbuilder.memorystorage.md).[delete](botbuilder.memorystorage.md#delete)*

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:30](https://github.com/Microsoft/botbuilder-js/blob/b68a82a/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L30)*



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

*Inherited from [MemoryStorage](botbuilder.memorystorage.md).[read](botbuilder.memorystorage.md#read)*

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/b68a82a/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L28)*



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

*Defined in [libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/b68a82a/libraries/botbuilder-core-extensions/lib/memoryStorage.d.ts#L29)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | [StoreItems](../interfaces/botbuilder.storeitems.md)   |  - |





**Returns:** `Promise`.<`void`>





___


