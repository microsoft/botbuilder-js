[Bot Builder SDK - Azure](../README.md) > [TableStorage](../classes/botbuilder_azure.tablestorage.md)



# Class: TableStorage


Middleware that implements an Azure Table based storage provider for a bot.

**Usage Example**

    const BotBuilderAzure = require('botbuilder-azure');
    const storage = new BotBuilderAzure.TableStorage({
        storageAccountOrConnectionString: 'UseDevelopmentStorage=true',
        tableName: 'mybotstate'
      });

    // Add state middleware
    const state = new BotStateManager(storage);
    adapter.use(state);

## Implements

* `any`

## Index

### Constructors

* [constructor](botbuilder_azure.tablestorage.md#constructor)


### Methods

* [delete](botbuilder_azure.tablestorage.md#delete)
* [read](botbuilder_azure.tablestorage.md#read)
* [write](botbuilder_azure.tablestorage.md#write)
* [SanitizeKey](botbuilder_azure.tablestorage.md#sanitizekey)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new TableStorage**(settings: *[TableStorageSettings](../interfaces/botbuilder_azure.tablestoragesettings.md)*): [TableStorage](botbuilder_azure.tablestorage.md)


*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:42](https://github.com/Microsoft/BotBuilder-JS/blob/ecd39de/libraries/botbuilder-azure/lib/tableStorage.d.ts#L42)*



Creates a new instance of the storage provider.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [TableStorageSettings](../interfaces/botbuilder_azure.tablestoragesettings.md)   |  Setting to configure the provider. |





**Returns:** [TableStorage](botbuilder_azure.tablestorage.md)

---


## Methods
<a id="delete"></a>

###  delete

► **delete**(keys: *`string`[]*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:66](https://github.com/Microsoft/BotBuilder-JS/blob/ecd39de/libraries/botbuilder-azure/lib/tableStorage.d.ts#L66)*



Removes store items from storage


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| keys | `string`[]   |  Array of item keys to remove from the store. |





**Returns:** `Promise`.<`void`>





___

<a id="read"></a>

###  read

► **read**(keys: *`string`[]*): `Promise`.<`StoreItems`>



*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:54](https://github.com/Microsoft/BotBuilder-JS/blob/ecd39de/libraries/botbuilder-azure/lib/tableStorage.d.ts#L54)*



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



*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:60](https://github.com/Microsoft/BotBuilder-JS/blob/ecd39de/libraries/botbuilder-azure/lib/tableStorage.d.ts#L60)*



Saves store items to storage.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | `StoreItems`   |  Map of items to write to storage. |





**Returns:** `Promise`.<`void`>





___

<a id="sanitizekey"></a>

### «Static» SanitizeKey

► **SanitizeKey**(key: *`string`*): `string`



*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:67](https://github.com/Microsoft/BotBuilder-JS/blob/ecd39de/libraries/botbuilder-azure/lib/tableStorage.d.ts#L67)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| key | `string`   |  - |





**Returns:** `string`





___


