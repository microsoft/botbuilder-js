[Bot Builder SDK - Azure](../README.md) > [StoreItemContainer](../classes/botbuilder_azure.storeitemcontainer.md)



# Class: StoreItemContainer


Internal data structure for splitting items into smaller pieces and overcome Azure Table Row size limit. More info: [https://docs.microsoft.com/en-us/rest/api/storageservices/understanding-the-table-service-data-model#property-types](https://docs.microsoft.com/en-us/rest/api/storageservices/understanding-the-table-service-data-model#property-types)

## Index

### Constructors

* [constructor](botbuilder_azure.storeitemcontainer.md#constructor)


### Properties

* [eTag](botbuilder_azure.storeitemcontainer.md#etag)
* [key](botbuilder_azure.storeitemcontainer.md#key)
* [obj](botbuilder_azure.storeitemcontainer.md#obj)
* [MaxRowSize](botbuilder_azure.storeitemcontainer.md#maxrowsize)


### Methods

* [split](botbuilder_azure.storeitemcontainer.md#split)
* [join](botbuilder_azure.storeitemcontainer.md#join)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new StoreItemContainer**(key: *`string`*, obj: *`any`*): [StoreItemContainer](botbuilder_azure.storeitemcontainer.md)


*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:83](https://github.com/Microsoft/BotBuilder-JS/blob/ecd39de/libraries/botbuilder-azure/lib/tableStorage.d.ts#L83)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| key | `string`   |  - |
| obj | `any`   |  - |





**Returns:** [StoreItemContainer](botbuilder_azure.storeitemcontainer.md)

---


## Properties
<a id="etag"></a>

###  eTag

**●  eTag**:  *`string`* 

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:83](https://github.com/Microsoft/BotBuilder-JS/blob/ecd39de/libraries/botbuilder-azure/lib/tableStorage.d.ts#L83)*





___

<a id="key"></a>

###  key

**●  key**:  *`string`* 

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:81](https://github.com/Microsoft/BotBuilder-JS/blob/ecd39de/libraries/botbuilder-azure/lib/tableStorage.d.ts#L81)*





___

<a id="obj"></a>

###  obj

**●  obj**:  *`any`* 

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:82](https://github.com/Microsoft/BotBuilder-JS/blob/ecd39de/libraries/botbuilder-azure/lib/tableStorage.d.ts#L82)*





___

<a id="maxrowsize"></a>

### «Static» MaxRowSize

**●  MaxRowSize**:  *`number`* 

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:80](https://github.com/Microsoft/BotBuilder-JS/blob/ecd39de/libraries/botbuilder-azure/lib/tableStorage.d.ts#L80)*





___


## Methods
<a id="split"></a>

###  split

► **split**(): [StoreItemEntity](../interfaces/botbuilder_azure.storeitementity.md)[]



*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:85](https://github.com/Microsoft/BotBuilder-JS/blob/ecd39de/libraries/botbuilder-azure/lib/tableStorage.d.ts#L85)*





**Returns:** [StoreItemEntity](../interfaces/botbuilder_azure.storeitementity.md)[]





___

<a id="join"></a>

### «Static» join

► **join**(chunks: *[StoreItemEntity](../interfaces/botbuilder_azure.storeitementity.md)[]*): [StoreItemContainer](botbuilder_azure.storeitemcontainer.md)



*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:86](https://github.com/Microsoft/BotBuilder-JS/blob/ecd39de/libraries/botbuilder-azure/lib/tableStorage.d.ts#L86)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| chunks | [StoreItemEntity](../interfaces/botbuilder_azure.storeitementity.md)[]   |  - |





**Returns:** [StoreItemContainer](botbuilder_azure.storeitemcontainer.md)





___


