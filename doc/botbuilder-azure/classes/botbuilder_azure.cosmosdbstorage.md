[Bot Builder SDK - Azure](../README.md) > [CosmosDbStorage](../classes/botbuilder_azure.cosmosdbstorage.md)



# Class: CosmosDbStorage


Middleware that implements a CosmosDB based storage provider for a bot.

## Implements

* `any`

## Index

### Constructors

* [constructor](botbuilder_azure.cosmosdbstorage.md#constructor)


### Methods

* [delete](botbuilder_azure.cosmosdbstorage.md#delete)
* [read](botbuilder_azure.cosmosdbstorage.md#read)
* [write](botbuilder_azure.cosmosdbstorage.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new CosmosDbStorage**(settings: *[CosmosDbStorageSettings](../interfaces/botbuilder_azure.cosmosdbstoragesettings.md)*, connectionPolicyConfigurator?: *`function`*): [CosmosDbStorage](botbuilder_azure.cosmosdbstorage.md)


*Defined in [libraries/botbuilder-azure/lib/cosmosDbStorage.d.ts:27](https://github.com/Microsoft/BotBuilder-JS/blob/9bedd85/libraries/botbuilder-azure/lib/cosmosDbStorage.d.ts#L27)*



Creates a new instance of the storage provider.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [CosmosDbStorageSettings](../interfaces/botbuilder_azure.cosmosdbstoragesettings.md)   |  Setting to configure the provider. |
| connectionPolicyConfigurator | `function`   |  (Optional) An optional delegate that accepts a ConnectionPolicy for customizing policies. |





**Returns:** [CosmosDbStorage](botbuilder_azure.cosmosdbstorage.md)

---


## Methods
<a id="delete"></a>

###  delete

► **delete**(keys: *`string`[]*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-azure/lib/cosmosDbStorage.d.ts:52](https://github.com/Microsoft/BotBuilder-JS/blob/9bedd85/libraries/botbuilder-azure/lib/cosmosDbStorage.d.ts#L52)*



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



*Defined in [libraries/botbuilder-azure/lib/cosmosDbStorage.d.ts:40](https://github.com/Microsoft/BotBuilder-JS/blob/9bedd85/libraries/botbuilder-azure/lib/cosmosDbStorage.d.ts#L40)*



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



*Defined in [libraries/botbuilder-azure/lib/cosmosDbStorage.d.ts:46](https://github.com/Microsoft/BotBuilder-JS/blob/9bedd85/libraries/botbuilder-azure/lib/cosmosDbStorage.d.ts#L46)*



Saves store items to storage.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | `StoreItems`   |  Map of items to write to storage. |





**Returns:** `Promise`.<`void`>





___


