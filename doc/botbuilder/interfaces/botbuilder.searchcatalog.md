[Bot Builder SDK - Core](../README.md) > [SearchCatalog](../interfaces/botbuilder.searchcatalog.md)



# Interface: SearchCatalog


interface for search catalog


## Methods
<a id="add"></a>

###  add

► **add**(document: *`object`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/search.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/search.d.ts#L28)*



add document to catalog


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| document | `object`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="delete"></a>

###  delete

► **delete**(id: *`string`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/search.d.ts:36](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/search.d.ts#L36)*



Delete document from catalog


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| id | `string`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="flush"></a>

###  flush

► **flush**(): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/search.d.ts:52](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/search.d.ts#L52)*



Flush pending changes




**Returns:** `Promise`.<`void`>





___

<a id="get"></a>

###  get

► **get**(id: *`string`*): `Promise`.<`any`>



*Defined in [libraries/botbuilder/lib/search.d.ts:40](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/search.d.ts#L40)*



Get document for Id


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| id | `string`   |  - |





**Returns:** `Promise`.<`any`>





___

<a id="getallids"></a>

###  getAllIds

► **getAllIds**(): `Promise`.<`string`[]>



*Defined in [libraries/botbuilder/lib/search.d.ts:44](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/search.d.ts#L44)*



Get all documents ids in the catalog




**Returns:** `Promise`.<`string`[]>





___

<a id="search"></a>

###  search

► **search**(query: *`string`⎮`any`*): `Promise`.<[SearchHit](botbuilder.searchhit.md)[]>



*Defined in [libraries/botbuilder/lib/search.d.ts:48](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/search.d.ts#L48)*



Search catalog for query string, or with filter object


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| query | `string`⎮`any`   |  - |





**Returns:** `Promise`.<[SearchHit](botbuilder.searchhit.md)[]>





___

<a id="update"></a>

###  update

► **update**(document: *`object`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/search.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/search.d.ts#L32)*



update document to catalog


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| document | `object`   |  - |





**Returns:** `Promise`.<`void`>





___


