[Bot Builder SDK - Core](../README.md) > [__global](../modules/botbuilder.__global.md) > [BotContext](../interfaces/botbuilder.__global.botcontext.md)



# Interface: BotContext


Context object for the current turn of a conversation with a user.


## Properties
<a id="bot"></a>

###  bot

**●  bot**:  *[Bot](../classes/botbuilder.bot.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:43](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L43)*



The Bot object for this context.




___

<a id="conversationreference"></a>

###  conversationReference

**●  conversationReference**:  *[Partial]()[ConversationReference](botbuilder.conversationreference.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:51](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L51)*



The calculated conversation reference for this request.




___

<a id="request"></a>

###  request

**●  request**:  *[Partial]()[Activity](botbuilder.activity.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:45](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L45)*



The received activity.




___

<a id="responded"></a>

###  responded

**●  responded**:  *`boolean`* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:49](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L49)*



If true at least one response has been sent for the current turn of conversation.




___

<a id="responses"></a>

###  responses

**●  responses**:  *[Partial]()[Activity](botbuilder.activity.md)[]* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:47](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L47)*



Queue of responses to send to the user.




___

<a id="state"></a>

###  state

**●  state**:  *[BotState](botbuilder.__global.botstate.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L55)*



Persisted state related to the request.




___

<a id="storage"></a>

### «Optional» storage

**●  storage**:  *[Storage](botbuilder.storage.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:59](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L59)*



(Optional) storage service for storing JSON based object.




___

<a id="templatemanager"></a>

###  templateManager

**●  templateManager**:  *[TemplateManager](../classes/botbuilder.templatemanager.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:69](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L69)*



tempalmtemanager for registering template engines




___

<a id="topintent"></a>

### «Optional» topIntent

**●  topIntent**:  *[Intent](botbuilder.intent.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:65](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L65)*



(Optional) a named "intent" object representing the current best understanding of what the user is attempting to do. This can be populated by either an `IntentRecognizer` or a `Router` like `ifRegExp()`.




___


## Methods
<a id="delay"></a>

###  delay

► **delay**(duration: *`number`*): `this`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:92](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L92)*



Queues a new "delay" activity to the [responses](#responses) array. This will cause a pause to occur before delivering additional queued responses to the user.

If your bot send a message with images and then immediately sends a message without images, you run the risk of the client displaying your messages out of order. The reason being that most clients want to copy the images you sent to a CDN for faster rendering in the future.

You can often avoid out of order messages by inserting a delay between the message with images and the one without.

**Usage Example**

    context.reply(hotelsFound)
           .delay(2000)
           .reply(`Would you like to see more results?`);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| duration | `number`   |  Number of milliseconds to pause. |





**Returns:** `this`





___

<a id="dispose"></a>

###  dispose

► **dispose**(): `void`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:97](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L97)*



INTERNAL disposes of the context object, making it unusable. Calling any methods off a disposed context will result in an exception being thrown;




**Returns:** `void`





___

<a id="endofconversation"></a>

###  endOfConversation

► **endOfConversation**(code?: *`undefined`⎮`string`*): `this`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:113](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L113)*



Queues a new "endOfConversation" activity that will be sent to the channel. This is often used by skill based channels to signal that the skill is finished.

**Usage Example**

    context.reply(weatherForecast)
           .endOfConversation();


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | `undefined`⎮`string`   |  (Optional) code indicating the reason why the conversation is being ended.The default value is `EndOfConversationCodes.completedSuccessfully`. |





**Returns:** `this`





___

<a id="flushresponses"></a>

###  flushResponses

► **flushResponses**(): `Promise`.<[ResourceResponse](botbuilder.resourceresponse.md)[]>



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:162](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L162)*



Sends any queued up responses to the user. **Usage Example**

    function search(context) {
         const query = context.request.text;
         return context.reply(`Please wait while I find that...`)
                       .showTyping()
                       .flushResponses()
                       .then(() => runQuery(query))
                       .then((results) => resultsAsActivity(results))
                       .then((activity) => {
                           context.reply(`Here's what I found...`)
                                  .reply(activity);
                       });
    }




**Returns:** `Promise`.<[ResourceResponse](botbuilder.resourceresponse.md)[]>





___

<a id="reply"></a>

###  reply

► **reply**(textOrActivity: *`string`*, speak: *`string`*, additional?: *[Partial]()[Activity](botbuilder.activity.md)*): `this`

► **reply**(textOrActivity: *`string`*, additional?: *[Partial]()[Activity](botbuilder.activity.md)*): `this`

► **reply**(textOrActivity: *[Partial]()[Activity](botbuilder.activity.md)*): `this`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:127](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L127)*



Queues a new "message" or activity to the [responses](#responses) array.

**Usage Example**

    context.reply(`Let's flip a coin. Would you like heads or tails?`, `heads or tails?`);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| textOrActivity | `string`   |  Text of a message or an activity object to send to the user. |
| speak | `string`   |  (Optional) SSML that should be spoken to the user on channels that support speech. |
| additional | [Partial]()[Activity](botbuilder.activity.md)   |  (Optional) other activities fields, like attachments, that should be sent with the activity. |





**Returns:** `this`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:128](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L128)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| textOrActivity | `string`   |  - |
| additional | [Partial]()[Activity](botbuilder.activity.md)   |  - |





**Returns:** `this`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:129](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L129)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| textOrActivity | [Partial]()[Activity](botbuilder.activity.md)   |  - |





**Returns:** `this`





___

<a id="replywith"></a>

###  replyWith

► **replyWith**(id: *`string`*, data: *`any`*): `this`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:142](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L142)*



Queues a new "message" or activity to the [responses](#responses) array using the specified template.

**Usage Example**

    context.replyWith('greeting', { name:'joe'});


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| id | `string`   |  - |
| data | `any`   |  data object to bind to |





**Returns:** `this`





___

<a id="showtyping"></a>

###  showTyping

► **showTyping**(): `this`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:177](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botbuilder.d.ts#L177)*



Queues a new "typing" activity to the [responses](#responses) array. On supported channels this will display a typing indicator which can be used to convey to the user that activity is occurring within the bot. This indicator is typically only displayed to the user for 3 - 5 seconds so the bot should periodically send additional "typing" activities for longer running operations.

**Usage Example**

    context.showTyping(1000)
           .reply(`It was a dark and stormy night.`);




**Returns:** `this`





___


