[Bot Builder SDK - Azure](../README.md) > [botbuilder](../modules/botbuilder.md) > [StorageSettings](../interfaces/botbuilder.storagesettings.md)



# Interface: StorageSettings


Additional settings for a storage provider.

## Hierarchy

**StorageSettings**

↳  [TableStorageSettings](botbuilder_azure_v4.tablestoragesettings.md)









## Properties
<a id="optimizewrites"></a>

###  optimizeWrites

**●  optimizeWrites**:  *`boolean`* 

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/storage.d.ts:33*



If true the storage provider will optimize the writing of objects such that any read object which hasn't changed won't be actually written. The default value for all storage providers is true.




___


