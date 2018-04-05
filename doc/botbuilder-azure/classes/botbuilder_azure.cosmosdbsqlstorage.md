[Bot Builder SDK - Azure](../README.md) > [CosmosDbSqlStorage](../classes/botbuilder_azure.cosmosdbsqlstorage.md)



# Class: CosmosDbSqlStorage


Middleware that implements a CosmosDB SQL (DocumentDB) based storage provider for a bot.

## Implements

* `any`

## Index

### Constructors

* [constructor](botbuilder_azure.cosmosdbsqlstorage.md#constructor)


### Methods

* [delete](botbuilder_azure.cosmosdbsqlstorage.md#delete)
* [read](botbuilder_azure.cosmosdbsqlstorage.md#read)
* [write](botbuilder_azure.cosmosdbsqlstorage.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new CosmosDbSqlStorage**(settings: *[CosmosDbSqlStorageSettings](../interfaces/botbuilder_azure.cosmosdbsqlstoragesettings.md)*, connectionPolicyConfigurator?: *`function`*): [CosmosDbSqlStorage](botbuilder_azure.cosmosdbsqlstorage.md)


*Defined in [libraries/botbuilder-azure/lib/cosmosDbSqlStorage.d.ts:26](https://github.com/Microsoft/BotBuilder-JS/blob/0d615fe/libraries/botbuilder-azure/lib/cosmosDbSqlStorage.d.ts#L26)*



Creates a new instance of the storage provider.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [CosmosDbSqlStorageSettings](../interfaces/botbuilder_azure.cosmosdbsqlstoragesettings.md)   |  Setting to configure the provider. |
| connectionPolicyConfigurator | `function`   |  (Optional) An optional delegate that accepts a ConnectionPolicy for customizing policies. |





**Returns:** [CosmosDbSqlStorage](botbuilder_azure.cosmosdbsqlstorage.md)

---


## Methods
<a id="delete"></a>

###  delete

► **delete**(keys: *`string`[]*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-azure/lib/cosmosDbSqlStorage.d.ts:51](https://github.com/Microsoft/BotBuilder-JS/blob/0d615fe/libraries/botbuilder-azure/lib/cosmosDbSqlStorage.d.ts#L51)*



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



*Defined in [libraries/botbuilder-azure/lib/cosmosDbSqlStorage.d.ts:39](https://github.com/Microsoft/BotBuilder-JS/blob/0d615fe/libraries/botbuilder-azure/lib/cosmosDbSqlStorage.d.ts#L39)*



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



*Defined in [libraries/botbuilder-azure/lib/cosmosDbSqlStorage.d.ts:45](https://github.com/Microsoft/BotBuilder-JS/blob/0d615fe/libraries/botbuilder-azure/lib/cosmosDbSqlStorage.d.ts#L45)*



Saves store items to storage.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | `StoreItems`   |  Map of items to write to storage. |





**Returns:** `Promise`.<`void`>





___


