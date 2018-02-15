[Bot Builder SDK - Node](../README.md) > [FileStorage](../classes/botbuilder_node.filestorage.md)



# Class: FileStorage


Middleware that implements a file based storage provider for a bot.

**Extends BotContext:**

*   context.storage - Storage provider for storing and retrieving objects.

**Usage Example**

    bot.use(new FileStorage({
         path: path.join(__dirname, 'storage')
    }));

## Hierarchy


↳  [StorageMiddleware]()[FileStorageSettings](../interfaces/botbuilder_node.filestoragesettings.md)

**↳ FileStorage**







## Implements

* [Middleware]()
* [Storage]()

## Index

### Constructors

* [constructor](botbuilder_node.filestorage.md#constructor)


### Properties

* [instance](botbuilder_node.filestorage.md#instance)
* [name](botbuilder_node.filestorage.md#name)
* [settings](botbuilder_node.filestorage.md#settings)


### Methods

* [contextCreated](botbuilder_node.filestorage.md#contextcreated)
* [delete](botbuilder_node.filestorage.md#delete)
* [getService](botbuilder_node.filestorage.md#getservice)
* [getStorage](botbuilder_node.filestorage.md#getstorage)
* [read](botbuilder_node.filestorage.md#read)
* [write](botbuilder_node.filestorage.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new FileStorage**(settings?: *[FileStorageSettings](../interfaces/botbuilder_node.filestoragesettings.md)*): [FileStorage](botbuilder_node.filestorage.md)


*Overrides StorageMiddleware.constructor*

*Defined in [libraries/botbuilder-node/lib/fileStorage.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-node/lib/fileStorage.d.ts#L32)*



Creates a new instance of the storage provider.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [FileStorageSettings](../interfaces/botbuilder_node.filestoragesettings.md)   |  (Optional) setting to configure the provider. |





**Returns:** [FileStorage](botbuilder_node.filestorage.md)

---


## Properties
<a id="instance"></a>

### «Protected» instance

**●  instance**:  *[Storage]()⎮`undefined`* 

*Inherited from BotService.instance*

*Defined in libraries/botbuilder-node/node_modules/botbuilder/lib/botService.d.ts:22*





___

<a id="name"></a>

### «Protected» name

**●  name**:  *`string`* 

*Inherited from BotService.name*

*Defined in libraries/botbuilder-node/node_modules/botbuilder/lib/botService.d.ts:21*





___

<a id="settings"></a>

###  settings

**●  settings**:  *[FileStorageSettings](../interfaces/botbuilder_node.filestoragesettings.md)* 

*Inherited from StorageMiddleware.settings*

*Defined in libraries/botbuilder-node/node_modules/botbuilder/lib/storageMiddleware.d.ts:18*



Settings that configure the various features of the storage provider.




___


## Methods
<a id="contextcreated"></a>

###  contextCreated

► **contextCreated**(context: *[BotContext]()*, next: *`function`*): `Promise`.<`void`>



*Inherited from BotService.contextCreated*

*Defined in libraries/botbuilder-node/node_modules/botbuilder/lib/botService.d.ts:32*



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

*Defined in [libraries/botbuilder-node/lib/fileStorage.d.ts:56](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-node/lib/fileStorage.d.ts#L56)*



Removes store items from storage


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| keys | `string`[]   |  Array of item keys to remove from the store. |





**Returns:** `Promise`.<`void`>





___

<a id="getservice"></a>

### «Protected» getService

► **getService**(context: *[BotContext]()*): [Storage]()



*Inherited from StorageMiddleware.getService*

*Overrides BotService.getService*

*Defined in libraries/botbuilder-node/node_modules/botbuilder/lib/storageMiddleware.d.ts:25*



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

*Defined in [libraries/botbuilder-node/lib/fileStorage.d.ts:58](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-node/lib/fileStorage.d.ts#L58)*



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

*Defined in [libraries/botbuilder-node/lib/fileStorage.d.ts:44](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-node/lib/fileStorage.d.ts#L44)*



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

*Defined in [libraries/botbuilder-node/lib/fileStorage.d.ts:50](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-node/lib/fileStorage.d.ts#L50)*



Saves store items to storage.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | [StoreItems]()   |  Map of items to write to storage. |





**Returns:** `Promise`.<`void`>





___


