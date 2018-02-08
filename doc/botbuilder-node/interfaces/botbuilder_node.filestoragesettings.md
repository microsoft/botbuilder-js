[Bot Builder SDK - Node](../README.md) > [FileStorageSettings](../interfaces/botbuilder_node.filestoragesettings.md)



# Interface: FileStorageSettings


Additional settings for configuring an instance of [FileStorage](../classes/botbuilder_node.filestorage.html).

## Hierarchy


 [StorageSettings]()

**↳ FileStorageSettings**








## Properties
<a id="optimizewrites"></a>

###  optimizeWrites

**●  optimizeWrites**:  *`boolean`* 

*Inherited from StorageSettings.optimizeWrites*

*Defined in libraries/botbuilder-node/node_modules/botbuilder/lib/storage.d.ts:36*



If true the storage provider will optimize the writing of objects such that any read object which hasn't changed won't be actually written. The default value for all storage providers is true.




___

<a id="path"></a>

### «Optional» path

**●  path**:  *`undefined`⎮`string`* 

*Defined in [libraries/botbuilder-node/lib/fileStorage.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-node/lib/fileStorage.d.ts#L15)*



(Optional) path to the backing folder. The default is to use a `storage` folder off the systems temporary directory.




___


