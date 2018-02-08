[Bot Builder SDK - Azure](../README.md) > [TableStorage](../classes/botbuilder_azure.tablestorage.md)



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


↳  [StorageMiddleware]()[TableStorageSettings](../interfaces/botbuilder_azure.tablestoragesettings.md)

**↳ TableStorage**







## Implements

* [Middleware]()
* [Storage]()

## Index

### Constructors

* [constructor](botbuilder_azure.tablestorage.md#constructor)


### Properties

* [instance](botbuilder_azure.tablestorage.md#instance)
* [name](botbuilder_azure.tablestorage.md#name)
* [settings](botbuilder_azure.tablestorage.md#settings)


### Methods

* [contextCreated](botbuilder_azure.tablestorage.md#contextcreated)
* [delete](botbuilder_azure.tablestorage.md#delete)
* [deleteTable](botbuilder_azure.tablestorage.md#deletetable)
* [ensureTable](botbuilder_azure.tablestorage.md#ensuretable)
* [getService](botbuilder_azure.tablestorage.md#getservice)
* [getStorage](botbuilder_azure.tablestorage.md#getstorage)
* [read](botbuilder_azure.tablestorage.md#read)
* [write](botbuilder_azure.tablestorage.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new TableStorage**(settings: *[TableStorageSettings](../interfaces/botbuilder_azure.tablestoragesettings.md)*): [TableStorage](botbuilder_azure.tablestorage.md)


*Overrides StorageMiddleware.constructor*

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:37](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-azure/lib/tableStorage.d.ts#L37)*



Creates a new instance of the storage provider.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [TableStorageSettings](../interfaces/botbuilder_azure.tablestoragesettings.md)   |  (Optional) setting to configure the provider. |





**Returns:** [TableStorage](botbuilder_azure.tablestorage.md)

---


## Properties
<a id="instance"></a>

### «Protected» instance

**●  instance**:  *[Storage]()⎮`undefined`* 

*Inherited from BotService.instance*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botService.d.ts:22*





___

<a id="name"></a>

### «Protected» name

**●  name**:  *`string`* 

*Inherited from BotService.name*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botService.d.ts:21*





___

<a id="settings"></a>

###  settings

**●  settings**:  *[TableStorageSettings](../interfaces/botbuilder_azure.tablestoragesettings.md)* 

*Inherited from StorageMiddleware.settings*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/storageMiddleware.d.ts:18*



Settings that configure the various features of the storage provider.




___


## Methods
<a id="contextcreated"></a>

###  contextCreated

► **contextCreated**(context: *[BotContext]()*, next: *`function`*): `Promise`.<`void`>



*Inherited from BotService.contextCreated*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botService.d.ts:32*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="delete"></a>

###  delete

► **delete**(keys: *`string`[]*): `Promise`.<`void`>



*Implementation of Storage.delete*

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:66](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-azure/lib/tableStorage.d.ts#L66)*



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



*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:48](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-azure/lib/tableStorage.d.ts#L48)*



Delete backing table (mostly used for unit testing.)




**Returns:** `Promise`.<`boolean`>





___

<a id="ensuretable"></a>

###  ensureTable

► **ensureTable**(): `Promise`.<`azure.TableService.TableResult`>



*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:46](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-azure/lib/tableStorage.d.ts#L46)*



Ensure the table is created.




**Returns:** `Promise`.<`azure.TableService.TableResult`>





___

<a id="getservice"></a>

### «Protected» getService

► **getService**(context: *[BotContext]()*): [Storage]()



*Inherited from StorageMiddleware.getService*

*Overrides BotService.getService*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/storageMiddleware.d.ts:25*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  - |





**Returns:** [Storage]()





___

<a id="getstorage"></a>

### «Protected» getStorage

► **getStorage**(context: *[BotContext]()*): [Storage]()



*Overrides StorageMiddleware.getStorage*

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-azure/lib/tableStorage.d.ts#L68)*



INTERNAL method that returns the storage instance to be added to the context object.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  - |





**Returns:** [Storage]()





___

<a id="read"></a>

###  read

► **read**(keys: *`string`[]*): `Promise`.<[StoreItems]()>



*Implementation of Storage.read*

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:54](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-azure/lib/tableStorage.d.ts#L54)*



Loads store items from storage


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| keys | `string`[]   |  Array of item keys to read from the store. |





**Returns:** `Promise`.<[StoreItems]()>





___

<a id="write"></a>

###  write

► **write**(changes: *[StoreItems]()*): `Promise`.<`void`>



*Implementation of Storage.write*

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:60](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-azure/lib/tableStorage.d.ts#L60)*



Saves store items to storage.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | [StoreItems]()   |  Map of items to write to storage. |





**Returns:** `Promise`.<`void`>





___


