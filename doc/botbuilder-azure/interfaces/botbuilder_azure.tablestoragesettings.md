[Bot Builder SDK - Azure](../README.md) > [TableStorageSettings](../interfaces/botbuilder_azure.tablestoragesettings.md)



# Interface: TableStorageSettings


Additional settings for configuring an instance of [TableStorage](../classes/botbuilder_azure_v4.tablestorage.html).

## Hierarchy


 [StorageSettings]()

**↳ TableStorageSettings**








## Properties
<a id="host"></a>

### «Optional» host

**●  host**:  *`azure.StorageHost`* 

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-azure/lib/tableStorage.d.ts#L19)*



(Optional) azure storage host.




___

<a id="optimizewrites"></a>

### «Optional» optimizeWrites

**●  optimizeWrites**:  *`undefined`⎮`true`⎮`false`* 

*Inherited from StorageSettings.optimizeWrites*

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/storage.d.ts:36*



(Optional) If true the storage provider will optimize the writing of objects such that any read object which hasn't changed won't be actually written. The default value for all storage providers is true.




___

<a id="storageaccesskey"></a>

### «Optional» storageAccessKey

**●  storageAccessKey**:  *`undefined`⎮`string`* 

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-azure/lib/tableStorage.d.ts#L15)*



Storage access key.




___

<a id="storageaccountorconnectionstring"></a>

### «Optional» storageAccountOrConnectionString

**●  storageAccountOrConnectionString**:  *`undefined`⎮`string`* 

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:17](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-azure/lib/tableStorage.d.ts#L17)*



(Optional) storage account to use or connection string.




___

<a id="tablename"></a>

###  tableName

**●  tableName**:  *`string`* 

*Defined in [libraries/botbuilder-azure/lib/tableStorage.d.ts:13](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder-azure/lib/tableStorage.d.ts#L13)*



Name of the table to use for storage.




___


