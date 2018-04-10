[Bot Builder SDK - Azure](../README.md) > [BlobServiceAsync](../interfaces/botbuilder_azure.blobserviceasync.md)



# Interface: BlobServiceAsync

## Hierarchy


 `any`

**↳ BlobServiceAsync**








## Methods
<a id="createblockblobfromtextasync"></a>

###  createBlockBlobFromTextAsync

► **createBlockBlobFromTextAsync**(container: *`string`*, blob: *`string`*, text: *`string`⎮[Buffer]()*, options: *`azure.BlobService.CreateBlobRequestOptions`*): `Promise`.<`azure.BlobService.BlobResult`>



*Defined in [libraries/botbuilder-azure/lib/blobStorage.d.ts:61](https://github.com/Microsoft/botbuilder-js/blob/75dd775/libraries/botbuilder-azure/lib/blobStorage.d.ts#L61)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| container | `string`   |  - |
| blob | `string`   |  - |
| text | `string`⎮[Buffer]()   |  - |
| options | `azure.BlobService.CreateBlobRequestOptions`   |  - |





**Returns:** `Promise`.<`azure.BlobService.BlobResult`>





___

<a id="createcontainerifnotexistsasync"></a>

###  createContainerIfNotExistsAsync

► **createContainerIfNotExistsAsync**(container: *`string`*): `Promise`.<`azure.BlobService.ContainerResult`>



*Defined in [libraries/botbuilder-azure/lib/blobStorage.d.ts:59](https://github.com/Microsoft/botbuilder-js/blob/75dd775/libraries/botbuilder-azure/lib/blobStorage.d.ts#L59)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| container | `string`   |  - |





**Returns:** `Promise`.<`azure.BlobService.ContainerResult`>





___

<a id="deleteblobifexistsasync"></a>

###  deleteBlobIfExistsAsync

► **deleteBlobIfExistsAsync**(container: *`string`*, blob: *`string`*): `Promise`.<`boolean`>



*Defined in [libraries/botbuilder-azure/lib/blobStorage.d.ts:64](https://github.com/Microsoft/botbuilder-js/blob/75dd775/libraries/botbuilder-azure/lib/blobStorage.d.ts#L64)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| container | `string`   |  - |
| blob | `string`   |  - |





**Returns:** `Promise`.<`boolean`>





___

<a id="deletecontainerifexistsasync"></a>

###  deleteContainerIfExistsAsync

► **deleteContainerIfExistsAsync**(container: *`string`*): `Promise`.<`boolean`>



*Defined in [libraries/botbuilder-azure/lib/blobStorage.d.ts:60](https://github.com/Microsoft/botbuilder-js/blob/75dd775/libraries/botbuilder-azure/lib/blobStorage.d.ts#L60)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| container | `string`   |  - |





**Returns:** `Promise`.<`boolean`>





___

<a id="getblobmetadataasync"></a>

###  getBlobMetadataAsync

► **getBlobMetadataAsync**(container: *`string`*, blob: *`string`*): `Promise`.<`azure.BlobService.BlobResult`>



*Defined in [libraries/botbuilder-azure/lib/blobStorage.d.ts:62](https://github.com/Microsoft/botbuilder-js/blob/75dd775/libraries/botbuilder-azure/lib/blobStorage.d.ts#L62)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| container | `string`   |  - |
| blob | `string`   |  - |





**Returns:** `Promise`.<`azure.BlobService.BlobResult`>





___

<a id="getblobtotextasync"></a>

###  getBlobToTextAsync

► **getBlobToTextAsync**(container: *`string`*, blob: *`string`*): `Promise`.<`azure.BlobService.BlobToText`>



*Defined in [libraries/botbuilder-azure/lib/blobStorage.d.ts:63](https://github.com/Microsoft/botbuilder-js/blob/75dd775/libraries/botbuilder-azure/lib/blobStorage.d.ts#L63)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| container | `string`   |  - |
| blob | `string`   |  - |





**Returns:** `Promise`.<`azure.BlobService.BlobToText`>





___


