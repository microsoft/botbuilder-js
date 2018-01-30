[Bot Builder SDK - Azure](../README.md) > [botbuilder](../modules/botbuilder.md) > [Storage](../interfaces/botbuilder.storage.md)



# Interface: Storage


Interface for a store provider that stores and retrieves objects

## Implemented by

* [BrowserLocalStorage](../classes/botbuilder.browserlocalstorage.md)
* [BrowserSessionStorage](../classes/botbuilder.browsersessionstorage.md)
* [MemoryStorage](../classes/botbuilder.memorystorage.md)
* [TableStorage](../classes/botbuilder_azure_v4.tablestorage.md)


## Methods
<a id="delete"></a>

###  delete

► **delete**(keys: *`string`[]*): `Promise`.<`void`>



*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/storage.d.ts:24*



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



*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/storage.d.ts:12*



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



*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/storage.d.ts:18*



Saves store items to storage.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | [StoreItems](botbuilder.storeitems.md)   |  Map of items to write to storage. |





**Returns:** `Promise`.<`void`>





___


