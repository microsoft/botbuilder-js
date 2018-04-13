[Bot Builder SDK - Azure](../README.md) > [BlobStorage](../classes/botbuilder_azure.blobstorage.md)



# Class: BlobStorage


Middleware that implements a BlobStorage based storage provider for a bot.

## Implements

* `any`

## Index

### Constructors

* [constructor](botbuilder_azure.blobstorage.md#constructor)


### Methods

* [createBlobService](botbuilder_azure.blobstorage.md#createblobservice)
* [delete](botbuilder_azure.blobstorage.md#delete)
* [read](botbuilder_azure.blobstorage.md#read)
* [write](botbuilder_azure.blobstorage.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BlobStorage**(settings: *[BlobStorageSettings](../interfaces/botbuilder_azure.blobstoragesettings.md)*): [BlobStorage](botbuilder_azure.blobstorage.md)


*Defined in [libraries/botbuilder-azure/lib/blobStorage.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/75dd775/libraries/botbuilder-azure/lib/blobStorage.d.ts#L32)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [BlobStorageSettings](../interfaces/botbuilder_azure.blobstoragesettings.md)   |  - |





**Returns:** [BlobStorage](botbuilder_azure.blobstorage.md)

---


## Methods
<a id="createblobservice"></a>

### «Protected» createBlobService

► **createBlobService**(storageAccountOrConnectionString: *`string`*, storageAccessKey: *`string`*, host: *`any`*): [BlobServiceAsync](../interfaces/botbuilder_azure.blobserviceasync.md)



*Defined in [libraries/botbuilder-azure/lib/blobStorage.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/75dd775/libraries/botbuilder-azure/lib/blobStorage.d.ts#L55)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| storageAccountOrConnectionString | `string`   |  - |
| storageAccessKey | `string`   |  - |
| host | `any`   |  - |





**Returns:** [BlobServiceAsync](../interfaces/botbuilder_azure.blobserviceasync.md)





___

<a id="delete"></a>

###  delete

► **delete**(keys: *`string`[]*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-azure/lib/blobStorage.d.ts:51](https://github.com/Microsoft/botbuilder-js/blob/75dd775/libraries/botbuilder-azure/lib/blobStorage.d.ts#L51)*



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



*Defined in [libraries/botbuilder-azure/lib/blobStorage.d.ts:39](https://github.com/Microsoft/botbuilder-js/blob/75dd775/libraries/botbuilder-azure/lib/blobStorage.d.ts#L39)*



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



*Defined in [libraries/botbuilder-azure/lib/blobStorage.d.ts:45](https://github.com/Microsoft/botbuilder-js/blob/75dd775/libraries/botbuilder-azure/lib/blobStorage.d.ts#L45)*



Saves store items to storage.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| changes | `StoreItems`   |  Map of items to write to storage. |





**Returns:** `Promise`.<`void`>





___


