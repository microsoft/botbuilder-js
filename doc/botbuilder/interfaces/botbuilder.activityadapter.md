[Bot Builder SDK - Core](../README.md) > [ActivityAdapter](../interfaces/botbuilder.activityadapter.md)



# Interface: ActivityAdapter


Implemented by activity adapters

## Implemented by

* [TestAdapter](../classes/botbuilder.testadapter.md)


## Properties
<a id="onreceive"></a>

###  onReceive

**●  onReceive**:  *`function`* 

*Defined in [libraries/botbuilder/lib/activityAdapter.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/activityAdapter.d.ts#L19)*



Handler that returns incoming activities to a single consumer. The `Bot` will set this when the adapter is passed to its constructor. Just keep in mind that should the bots adapter be replaced (like when running unit tests) this handler can end up being set back to undefined.

#### Type declaration
►(activity: *[Activity](botbuilder.activity.md)*): `Promise`.<`void`>



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Activity](botbuilder.activity.md)   |  - |





**Returns:** `Promise`.<`void`>






___


## Methods
<a id="post"></a>

###  post

► **post**(activities: *[Partial]()[Activity](botbuilder.activity.md)[]*): `Promise`.<[ConversationResourceResponse](botbuilder.conversationresourceresponse.md)[]⎮`undefined`>



*Defined in [libraries/botbuilder/lib/activityAdapter.d.ts:25](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/activityAdapter.d.ts#L25)*



Called by a consumer to send outgoing set of activities to a user.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()[Activity](botbuilder.activity.md)[]   |  The set of activities to send. |





**Returns:** `Promise`.<[ConversationResourceResponse](botbuilder.conversationresourceresponse.md)[]⎮`undefined`>





___


