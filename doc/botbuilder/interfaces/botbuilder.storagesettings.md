[Bot Builder SDK - Core](../README.md) > [StorageSettings](../interfaces/botbuilder.storagesettings.md)



# Interface: StorageSettings


Additional settings for a storage provider.


## Properties
<a id="optimizewrites"></a>

### «Optional» optimizeWrites

**●  optimizeWrites**:  *`undefined`⎮`true`⎮`false`* 

*Defined in [libraries/botbuilder/lib/storage.d.ts:36](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/storage.d.ts#L36)*



(Optional) If true the storage provider will optimize the writing of objects such that any read object which hasn't changed won't be actually written. The default value for all storage providers is true.




___


