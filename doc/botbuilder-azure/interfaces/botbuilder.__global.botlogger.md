[Bot Builder SDK - Azure](../README.md) > [botbuilder](../modules/botbuilder.md) > [__global](../modules/botbuilder.__global.md) > [BotLogger](../interfaces/botbuilder.__global.botlogger.md)



# Interface: BotLogger


Extensible logging interface.


## Methods
<a id="flush"></a>

###  flush

► **flush**(): `Promise`.<`void`>



*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botbuilder.d.ts:276*





**Returns:** `Promise`.<`void`>





___

<a id="log"></a>

###  log

► **log**(message: *`string`*, traceLevel?: *[TraceLevel](../enums/botbuilder.__global.tracelevel.md)*, properties?: *`undefined`⎮`object`*): `void`



*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botbuilder.d.ts:299*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| message | `string`   |  - |
| traceLevel | [TraceLevel](../enums/botbuilder.__global.tracelevel.md)   |  - |
| properties | `undefined`⎮`object`   |  - |





**Returns:** `void`





___

<a id="logavailability"></a>

###  logAvailability

► **logAvailability**(name: *`string`*, timeStamp: *`Date`*, duration: *`number`*, runLocation: *`string`*, success: *`boolean`*, message?: *`undefined`⎮`string`*, properties?: *`undefined`⎮`object`*, metrics?: *`undefined`⎮`object`*): `void`



*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botbuilder.d.ts:281*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string`   |  - |
| timeStamp | `Date`   |  - |
| duration | `number`   |  - |
| runLocation | `string`   |  - |
| success | `boolean`   |  - |
| message | `undefined`⎮`string`   |  - |
| properties | `undefined`⎮`object`   |  - |
| metrics | `undefined`⎮`object`   |  - |





**Returns:** `void`





___

<a id="logdependency"></a>

###  logDependency

► **logDependency**(dependencyName: *`string`*, commandName: *`string`*, startTime: *`Date`*, duration: *`number`*, success: *`boolean`*, dependencyTypeName?: *`undefined`⎮`string`*, target?: *`undefined`⎮`string`*, data?: *`undefined`⎮`string`*, resultCode?: *`undefined`⎮`string`*): `void`



*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botbuilder.d.ts:279*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dependencyName | `string`   |  - |
| commandName | `string`   |  - |
| startTime | `Date`   |  - |
| duration | `number`   |  - |
| success | `boolean`   |  - |
| dependencyTypeName | `undefined`⎮`string`   |  - |
| target | `undefined`⎮`string`   |  - |
| data | `undefined`⎮`string`   |  - |
| resultCode | `undefined`⎮`string`   |  - |





**Returns:** `void`





___

<a id="logevent"></a>

###  logEvent

► **logEvent**(eventName: *`string`*, properties?: *`undefined`⎮`object`*, metrics?: *`undefined`⎮`object`*): `void`



*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botbuilder.d.ts:286*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| eventName | `string`   |  - |
| properties | `undefined`⎮`object`   |  - |
| metrics | `undefined`⎮`object`   |  - |





**Returns:** `void`





___

<a id="logexception"></a>

###  logException

► **logException**(exception: *`Error`*, message?: *`undefined`⎮`string`*, properties?: *`undefined`⎮`object`*, metrics?: *`undefined`⎮`object`*): `void`



*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botbuilder.d.ts:291*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| exception | `Error`   |  - |
| message | `undefined`⎮`string`   |  - |
| properties | `undefined`⎮`object`   |  - |
| metrics | `undefined`⎮`object`   |  - |





**Returns:** `void`





___

<a id="logmetric"></a>

###  logMetric

► **logMetric**(name: *`string`*, value: *`number`*, properties?: *`undefined`⎮`object`*): `void`



*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botbuilder.d.ts:296*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string`   |  - |
| value | `number`   |  - |
| properties | `undefined`⎮`object`   |  - |





**Returns:** `void`





___

<a id="logrequest"></a>

###  logRequest

► **logRequest**(name: *`string`*, startTime: *`Date`*, duration: *`number`*, responseCode: *`string`*, success: *`boolean`*): `void`



*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botbuilder.d.ts:277*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string`   |  - |
| startTime | `Date`   |  - |
| duration | `number`   |  - |
| responseCode | `string`   |  - |
| success | `boolean`   |  - |





**Returns:** `void`





___

<a id="startdependency"></a>

###  startDependency

► **startDependency**(dependencyName: *`string`*, commandName: *`string`*, startTime: *`Date`*, dependencyTypeName?: *`undefined`⎮`string`*, target?: *`undefined`⎮`string`*, data?: *`undefined`⎮`string`*): [BotLoggerOperation](botbuilder.__global.botloggeroperation.md)



*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botbuilder.d.ts:280*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dependencyName | `string`   |  - |
| commandName | `string`   |  - |
| startTime | `Date`   |  - |
| dependencyTypeName | `undefined`⎮`string`   |  - |
| target | `undefined`⎮`string`   |  - |
| data | `undefined`⎮`string`   |  - |





**Returns:** [BotLoggerOperation](botbuilder.__global.botloggeroperation.md)





___

<a id="startrequest"></a>

###  startRequest

► **startRequest**(name: *`string`*, startTime?: *[Date](_node_modules__types_node_index_d_.nodejs.global.md#date)*): [BotLoggerOperation](botbuilder.__global.botloggeroperation.md)



*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botbuilder.d.ts:278*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string`   |  - |
| startTime | [Date](_node_modules__types_node_index_d_.nodejs.global.md#date)   |  - |





**Returns:** [BotLoggerOperation](botbuilder.__global.botloggeroperation.md)





___


