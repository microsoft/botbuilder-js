[Bot Builder SDK - Core](../README.md) > [Storage](../interfaces/botbuilder.storage.md)



# Interface: Storage


Interface for a store provider that stores and retrieves objects

## Implemented by

* [BrowserLocalStorage](../classes/botbuilder.browserlocalstorage.md)
* [BrowserSessionStorage](../classes/botbuilder.browsersessionstorage.md)
* [MemoryStorage](../classes/botbuilder.memorystorage.md)


## Methods
<a id="delete"></a>

###  delete

► **delete**(keys: *`string`[]*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/storage.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/storage.d.ts#L27)*



Removes store items from storage


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| keys | `string`[]   |  Array of item keys to remove from the store. |





**Returns:** `Promise`.<`void`>





___

<a id="read"></a>

###  read

► **read**(keys: *`string`[]*): `Promise`.<[StoreItems](botbuilder.storeitems.md)>



*Defined in [libraries/botbuilder/lib/storage.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/storage.d.ts#L15)*



Loads store items from storage


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| keys | `string`[]   |  Array of item keys to read from the store. |





**Returns:** `Promise`.<[StoreItems](botbuilder.storeitems.md)>





___

<a id="write"></a>

###  write

► **write**(changes: *[StoreItems](botbuilder.storeitems.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/storage.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/storage.d.ts#L21)*



Saves store items to storage.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | [StoreItems](botbuilder.storeitems.md)   |  Map of items to write to storage. |





**Returns:** `Promise`.<`void`>





___


