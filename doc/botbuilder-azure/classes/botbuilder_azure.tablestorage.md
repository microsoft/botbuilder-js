[Bot Builder SDK - Azure](../README.md) > [TableStorage](../classes/botbuilder_azure.tablestorage.md)



# Class: TableStorage


Middleware that implements an Azure Table based storage provider for a bot.

**Usage Example**

## Implements

* `any`

## Index

### Constructors

* [constructor](botbuilder_azure.tablestorage.md#constructor)


### Methods

* [delete](botbuilder_azure.tablestorage.md#delete)
* [deleteTable](botbuilder_azure.tablestorage.md#deletetable)
* [ensureTable](botbuilder_azure.tablestorage.md#ensuretable)
* [read](botbuilder_azure.tablestorage.md#read)
* [write](botbuilder_azure.tablestorage.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new TableStorage**(settings: *[TableStorageSettings](../interfaces/botbuilder_azure.tablestoragesettings.md)*): [TableStorage](botbuilder_azure.tablestorage.md)


*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-azure/lib/tableStorage.d.ts#L31)*



Creates a new instance of the storage provider.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [TableStorageSettings](../interfaces/botbuilder_azure.tablestoragesettings.md)   |  (Optional) setting to configure the provider. |





**Returns:** [TableStorage](botbuilder_azure.tablestorage.md)

---


## Methods
<a id="delete"></a>

###  delete

► **delete**(keys: *`string`[]*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:60](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-azure/lib/tableStorage.d.ts#L60)*



Removes store items from storage


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| keys | `string`[]   |  Array of item keys to remove from the store. |





**Returns:** `Promise`.<`void`>





___

<a id="deletetable"></a>

###  deleteTable

► **deleteTable**(): `Promise`.<`boolean`>



*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:42](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-azure/lib/tableStorage.d.ts#L42)*



Delete backing table (mostly used for unit testing.)




**Returns:** `Promise`.<`boolean`>





___

<a id="ensuretable"></a>

###  ensureTable

► **ensureTable**(): `Promise`.<`azure.TableService.TableResult`>



*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:40](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-azure/lib/tableStorage.d.ts#L40)*



Ensure the table is created.




**Returns:** `Promise`.<`azure.TableService.TableResult`>





___

<a id="read"></a>

###  read

► **read**(keys: *`string`[]*): `Promise`.<`StoreItems`>



*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:48](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-azure/lib/tableStorage.d.ts#L48)*



Loads store items from storage


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| keys | `string`[]   |  Array of item keys to read from the store. |





**Returns:** `Promise`.<`StoreItems`>





___

<a id="write"></a>

###  write

► **write**(changes: *`StoreItems`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:54](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-azure/lib/tableStorage.d.ts#L54)*



Saves store items to storage.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | `StoreItems`   |  Map of items to write to storage. |





**Returns:** `Promise`.<`void`>





___


