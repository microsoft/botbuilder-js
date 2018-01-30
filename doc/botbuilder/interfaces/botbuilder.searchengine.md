[Bot Builder SDK - Core](../README.md) > [SearchEngine](../interfaces/botbuilder.searchengine.md)



# Interface: SearchEngine


Interface for a search engine that manages catalogs


## Methods
<a id="createcatalog"></a>

###  createCatalog

► **createCatalog**(name: *`string`*, id: *`string`*, fields: *`string`[]*): `Promise`.<[SearchCatalog](botbuilder.searchcatalog.md)>



*Defined in [libraries/botbuilder/lib/search.d.ts:8](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/search.d.ts#L8)*



create a catalog


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string`   |  - |
| id | `string`   |  - |
| fields | `string`[]   |  - |





**Returns:** `Promise`.<[SearchCatalog](botbuilder.searchcatalog.md)>





___

<a id="deletecatalog"></a>

###  deleteCatalog

► **deleteCatalog**(name: *`string`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/search.d.ts:12](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/search.d.ts#L12)*



delete a catalog


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="getcatalog"></a>

###  getCatalog

► **getCatalog**(name: *`string`*): `Promise`.<[SearchCatalog](botbuilder.searchcatalog.md)>



*Defined in [libraries/botbuilder/lib/search.d.ts:10](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/search.d.ts#L10)*



get a catalog, returns null if no catalog yet


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string`   |  - |





**Returns:** `Promise`.<[SearchCatalog](botbuilder.searchcatalog.md)>





___

<a id="listcatalogs"></a>

###  listCatalogs

► **listCatalogs**(): `Promise`.<`string`[]>



*Defined in [libraries/botbuilder/lib/search.d.ts:14](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/search.d.ts#L14)*



List all catalogs




**Returns:** `Promise`.<`string`[]>





___


