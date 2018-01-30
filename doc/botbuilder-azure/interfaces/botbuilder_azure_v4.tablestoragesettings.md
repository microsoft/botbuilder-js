[Bot Builder SDK - Azure](../README.md) > [botbuilder-azure-v4](../modules/botbuilder_azure_v4.md) > [TableStorageSettings](../interfaces/botbuilder_azure_v4.tablestoragesettings.md)



# Interface: TableStorageSettings


Additional settings for configuring an instance of [TableStorage](../classes/botbuilder_azure_v4.tablestorage.html).

## Hierarchy


 [StorageSettings](botbuilder.storagesettings.md)

**↳ TableStorageSettings**








## Properties
<a id="host"></a>

### «Optional» host

**●  host**:  *`azure.StorageHost`* 

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:16](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-azure/lib/tableStorage.d.ts#L16)*



(Optional) azure storage host.




___

<a id="optimizewrites"></a>

###  optimizeWrites

**●  optimizeWrites**:  *`boolean`* 

*Inherited from [StorageSettings](botbuilder.storagesettings.md).[optimizeWrites](botbuilder.storagesettings.md#optimizewrites)*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/storage.d.ts:33*



If true the storage provider will optimize the writing of objects such that any read object which hasn't changed won't be actually written. The default value for all storage providers is true.




___

<a id="storageaccesskey"></a>

### «Optional» storageAccessKey

**●  storageAccessKey**:  *`undefined`⎮`string`* 

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:12](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-azure/lib/tableStorage.d.ts#L12)*



Storage access key.




___

<a id="storageaccountorconnectionstring"></a>

### «Optional» storageAccountOrConnectionString

**●  storageAccountOrConnectionString**:  *`undefined`⎮`string`* 

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:14](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-azure/lib/tableStorage.d.ts#L14)*



(Optional) storage account to use or connection string.




___

<a id="tablename"></a>

###  tableName

**●  tableName**:  *`string`* 

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:10](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-azure/lib/tableStorage.d.ts#L10)*



Name of the table to use for storage.




___


