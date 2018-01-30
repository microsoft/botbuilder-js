[Bot Builder SDK - Azure](../README.md) > [botbuilder-azure-v4](../modules/botbuilder_azure_v4.md) > [TableStorage](../classes/botbuilder_azure_v4.tablestorage.md)



# Class: TableStorage


Middleware that implements an Azure Table based storage provider for a bot.

**Extends BotContext:**

*   context.storage - Storage provider for storing and retrieving objects.

**Usage Example**

    bot.use(new TableStorage({
         tableName: 'storage',
         storageAccountOrConnectionString: 'UseDevelopmentStorage=true'
    }));

## Hierarchy


↳  [StorageMiddleware](botbuilder.storagemiddleware.md)[TableStorageSettings](../interfaces/botbuilder_azure_v4.tablestoragesettings.md)

**↳ TableStorage**







## Implements

* [Middleware](../interfaces/botbuilder.middleware.md)
* [Storage](../interfaces/botbuilder.storage.md)

## Index

### Constructors

* [constructor](botbuilder_azure_v4.tablestorage.md#constructor)


### Properties

* [instance](botbuilder_azure_v4.tablestorage.md#instance)
* [name](botbuilder_azure_v4.tablestorage.md#name)
* [settings](botbuilder_azure_v4.tablestorage.md#settings)


### Methods

* [contextCreated](botbuilder_azure_v4.tablestorage.md#contextcreated)
* [delete](botbuilder_azure_v4.tablestorage.md#delete)
* [deleteTable](botbuilder_azure_v4.tablestorage.md#deletetable)
* [ensureTable](botbuilder_azure_v4.tablestorage.md#ensuretable)
* [getService](botbuilder_azure_v4.tablestorage.md#getservice)
* [getStorage](botbuilder_azure_v4.tablestorage.md#getstorage)
* [read](botbuilder_azure_v4.tablestorage.md#read)
* [write](botbuilder_azure_v4.tablestorage.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new TableStorage**(settings: *[TableStorageSettings](../interfaces/botbuilder_azure_v4.tablestoragesettings.md)*): [TableStorage](botbuilder_azure_v4.tablestorage.md)


*Overrides [StorageMiddleware](botbuilder.storagemiddleware.md).[constructor](botbuilder.storagemiddleware.md#constructor)*

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:34](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-azure/lib/tableStorage.d.ts#L34)*



Creates a new instance of the storage provider.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [TableStorageSettings](../interfaces/botbuilder_azure_v4.tablestoragesettings.md)   |  (Optional) setting to configure the provider. |





**Returns:** [TableStorage](botbuilder_azure_v4.tablestorage.md)

---


## Properties
<a id="instance"></a>

### «Protected» instance

**●  instance**:  *[Storage](../interfaces/botbuilder.storage.md)⎮`undefined`* 

*Inherited from [BotService](botbuilder.botservice.md).[instance](botbuilder.botservice.md#instance)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botService.d.ts:19*





___

<a id="name"></a>

### «Protected» name

**●  name**:  *`string`* 

*Inherited from [BotService](botbuilder.botservice.md).[name](botbuilder.botservice.md#name)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botService.d.ts:18*





___

<a id="settings"></a>

###  settings

**●  settings**:  *[TableStorageSettings](../interfaces/botbuilder_azure_v4.tablestoragesettings.md)* 

*Inherited from [StorageMiddleware](botbuilder.storagemiddleware.md).[settings](botbuilder.storagemiddleware.md#settings)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/storageMiddleware.d.ts:15*



Settings that configure the various features of the storage provider.




___


## Methods
<a id="contextcreated"></a>

###  contextCreated

► **contextCreated**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Inherited from [BotService](botbuilder.botservice.md).[contextCreated](botbuilder.botservice.md#contextcreated)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botService.d.ts:29*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="delete"></a>

###  delete

► **delete**(keys: *`string`[]*): `Promise`.<`void`>



*Implementation of [Storage](../interfaces/botbuilder.storage.md).[delete](../interfaces/botbuilder.storage.md#delete)*

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:63](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-azure/lib/tableStorage.d.ts#L63)*



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



*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:45](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-azure/lib/tableStorage.d.ts#L45)*



Delete backing table (mostly used for unit testing.)




**Returns:** `Promise`.<`boolean`>





___

<a id="ensuretable"></a>

###  ensureTable

► **ensureTable**(): `Promise`.<`azure.TableService.TableResult`>



*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:43](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-azure/lib/tableStorage.d.ts#L43)*



Ensure the table is created.




**Returns:** `Promise`.<`azure.TableService.TableResult`>





___

<a id="getservice"></a>

### «Protected» getService

► **getService**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*): [Storage](../interfaces/botbuilder.storage.md)



*Inherited from [StorageMiddleware](botbuilder.storagemiddleware.md).[getService](botbuilder.storagemiddleware.md#getservice)*

*Overrides [BotService](botbuilder.botservice.md).[getService](botbuilder.botservice.md#getservice)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/storageMiddleware.d.ts:22*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |





**Returns:** [Storage](../interfaces/botbuilder.storage.md)





___

<a id="getstorage"></a>

### «Protected» getStorage

► **getStorage**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*): [Storage](../interfaces/botbuilder.storage.md)



*Overrides [StorageMiddleware](botbuilder.storagemiddleware.md).[getStorage](botbuilder.storagemiddleware.md#getstorage)*

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:65](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-azure/lib/tableStorage.d.ts#L65)*



INTERNAL method that returns the storage instance to be added to the context object.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |





**Returns:** [Storage](../interfaces/botbuilder.storage.md)





___

<a id="read"></a>

###  read

► **read**(keys: *`string`[]*): `Promise`.<[StoreItems](../interfaces/botbuilder.storeitems.md)>



*Implementation of [Storage](../interfaces/botbuilder.storage.md).[read](../interfaces/botbuilder.storage.md#read)*

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:51](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-azure/lib/tableStorage.d.ts#L51)*



Loads store items from storage


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| keys | `string`[]   |  Array of item keys to read from the store. |





**Returns:** `Promise`.<[StoreItems](../interfaces/botbuilder.storeitems.md)>





___

<a id="write"></a>

###  write

► **write**(changes: *[StoreItems](../interfaces/botbuilder.storeitems.md)*): `Promise`.<`void`>



*Implementation of [Storage](../interfaces/botbuilder.storage.md).[write](../interfaces/botbuilder.storage.md#write)*

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:57](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-azure/lib/tableStorage.d.ts#L57)*



Saves store items to storage.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | [StoreItems](../interfaces/botbuilder.storeitems.md)   |  Map of items to write to storage. |





**Returns:** `Promise`.<`void`>





___


