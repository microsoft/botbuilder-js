[Bot Builder SDK - Core](../README.md) > [__global](../modules/botbuilder.__global.md) > [BotContext](../interfaces/botbuilder.__global.botcontext.md)



# Interface: BotContext


Context object for the current turn of a conversation with a user.


## Properties
<a id="bot"></a>

###  bot

**●  bot**:  *[Bot](../classes/botbuilder.bot.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:42](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L42)*



The Bot object for this context.




___

<a id="conversationreference"></a>

###  conversationReference

**●  conversationReference**:  *[ConversationReference](botbuilder.conversationreference.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:50](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L50)*



The calculated conversation reference for this request.




___

<a id="logger"></a>

###  logger

**●  logger**:  *[BotLogger](botbuilder.__global.botlogger.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:58](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L58)*



Logger to trace messages and telemetry data.




___

<a id="request"></a>

###  request

**●  request**:  *[Activity](botbuilder.activity.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:44](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L44)*



The received activity.




___

<a id="responded"></a>

###  responded

**●  responded**:  *`boolean`* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:48](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L48)*



If true at least one response has been sent for the current turn of conversation.




___

<a id="responses"></a>

###  responses

**●  responses**:  *[Partial]()[Activity](botbuilder.activity.md)[]* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:46](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L46)*



Queue of responses to send to the user.




___

<a id="state"></a>

###  state

**●  state**:  *[BotState](botbuilder.__global.botstate.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:54](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L54)*



Persisted state related to the request.




___

<a id="storage"></a>

### «Optional» storage

**●  storage**:  *[Storage](botbuilder.storage.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:62](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L62)*



(Optional) storage service for storing JSON based object.




___

<a id="templatemanager"></a>

###  templateManager

**●  templateManager**:  *[TemplateManager]()* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:72](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L72)*



tempalmtemanager for registering template engines




___

<a id="topintent"></a>

### «Optional» topIntent

**●  topIntent**:  *[Intent](botbuilder.intent.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L68)*



(Optional) a named "intent" object representing the current best understanding of what the user is attempting to do. This can be populated by either an `IntentRecognizer` or a `Router` like `ifRegExp()`.




___


## Methods
<a id="begin"></a>

###  begin

► **begin**(promptOrDialog: *[BeginDialog](botbuilder.__global.begindialog.md)*): `Promise`.<`any`>⎮`any`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:84](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L84)*



Starts a prompt or other type of dialog.

**Usage Example**

    context.prompt(namePrompt.reply(`Hi. What's your name?`));


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| promptOrDialog | [BeginDialog](botbuilder.__global.begindialog.md)   |  An instance of a prompt or dialog to start. |





**Returns:** `Promise`.<`any`>⎮`any`





___

<a id="clone"></a>

###  clone

► **clone**(): `this`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:88](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L88)*



Returns a clone that's a shallow copy of the context object.




**Returns:** `this`





___

<a id="delay"></a>

###  delay

► **delay**(duration: *`number`*): `this`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:111](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L111)*



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



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:116](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L116)*



INTERNAL disposes of the context object, making it unusable. Calling any methods off a disposed context will result in an exception being thrown;




**Returns:** `void`





___

<a id="endofconversation"></a>

###  endOfConversation

► **endOfConversation**(code?: *`undefined`⎮`string`*): `this`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:132](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L132)*



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

<a id="findentities"></a>

###  findEntities

► **findEntities**T(intent: *[Intent](botbuilder.intent.md)*, type: *`string`⎮`RegExp`*): [EntityObject](botbuilder.entityobject.md)`T`[]

► **findEntities**T(type: *`string`⎮`RegExp`*): [EntityObject](botbuilder.entityobject.md)`T`[]



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:154](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L154)*



Finds all entities of a given type on the [topIntent](#topintent).

**Usage Example**

    function sendMessage(context) {
         const text = context.getEntity('text');
         const recipients = context.findEntities('recipient') || [];
         recipients.forEach((entity) => {
             name = entity.value;
             // ... send text to recipient ...
         });
    }


**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| intent | [Intent](botbuilder.intent.md)   |  (Optional) intent that should be searched over. This will override the useof `topIntent`. |
| type | `string`⎮`RegExp`   |  The type of entities to return. If this is a RegExp, then any type matchingthe specified pattern will be returned. |





**Returns:** [EntityObject](botbuilder.entityobject.md)`T`[]



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:155](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L155)*



**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| type | `string`⎮`RegExp`   |  - |





**Returns:** [EntityObject](botbuilder.entityobject.md)`T`[]





___

<a id="getentity"></a>

###  getEntity

► **getEntity**T(intent: *[Intent](botbuilder.intent.md)*, type: *`string`⎮`RegExp`*, occurrence?: *`undefined`⎮`number`*): `T`⎮`undefined`

► **getEntity**T(type: *`string`⎮`RegExp`*, occurrence?: *`undefined`⎮`number`*): `T`⎮`undefined`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:178](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L178)*



Returns the value of an individual entity of a specified type.

**Usage Example**

    const helpIntent = context.ifRegExp(/help .*with (.*)/i, ['topic']);

    if (helpIntent) {
         const topic = context.getEntity(helpIntent, 'topic');
         // ... return help for topic ...
    }


**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| intent | [Intent](botbuilder.intent.md)   |  (Optional) intent that should be searched over. This will override the useof `topIntent`. |
| type | `string`⎮`RegExp`   |  The type of entity to return. If this is a RegExp, then any type matchingthe specified pattern will be returned. |
| occurrence | `undefined`⎮`number`   |  (Optional) a zero based index of the entity to return when there aremultiple occurrences of same entity type. The default value is `0` meaning the firstoccurrence will be returned. |





**Returns:** `T`⎮`undefined`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:179](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L179)*



**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| type | `string`⎮`RegExp`   |  - |
| occurrence | `undefined`⎮`number`   |  - |





**Returns:** `T`⎮`undefined`





___

<a id="ifintent"></a>

###  ifIntent

► **ifIntent**(filter: *`string`⎮`RegExp`*): `boolean`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:184](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L184)*



Returns `true` if the context has a [topIntent](#topintent) that matches the specified filter.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| filter | `string`⎮`RegExp`   |  The name of the intent or a regular expression to match against the intent. |





**Returns:** `boolean`





___

<a id="ifregexp"></a>

###  ifRegExp

► **ifRegExp**(filter: *`RegExp`*): `boolean`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:189](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L189)*



Returns `true` in the specified expression matches the users utterance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| filter | `RegExp`   |  The expression to match against the users utterance. |





**Returns:** `boolean`





___

<a id="reply"></a>

###  reply

► **reply**(textOrActivity: *`string`*, speak: *`string`*, additional?: *[Partial]()[Activity](botbuilder.activity.md)*): `this`

► **reply**(textOrActivity: *`string`*, additional?: *[Partial]()[Activity](botbuilder.activity.md)*): `this`

► **reply**(textOrActivity: *[Partial]()[Activity](botbuilder.activity.md)*): `this`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:203](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L203)*



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



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:204](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L204)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| textOrActivity | `string`   |  - |
| additional | [Partial]()[Activity](botbuilder.activity.md)   |  - |





**Returns:** `this`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:205](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L205)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| textOrActivity | [Partial]()[Activity](botbuilder.activity.md)   |  - |





**Returns:** `this`





___

<a id="replywith"></a>

###  replyWith

► **replyWith**(id: *`string`*, data: *`any`*): `this`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:218](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L218)*



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

<a id="sendresponses"></a>

###  sendResponses

► **sendResponses**(): `Promise`.<[ConversationResourceResponse](botbuilder.conversationresourceresponse.md)[]>



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:238](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L238)*



Sends any queued up responses to the user. **Usage Example**

    function search(context) {
         const query = context.request.text;
         return context.reply(`Please wait while I find that...`)
                       .showTyping()
                       .sendResponses()
                       .then(() => runQuery(query))
                       .then((results) => resultsAsActivity(results))
                       .then((activity) => {
                           context.reply(`Here's what I found...`)
                                  .reply(activity);
                       });
    }




**Returns:** `Promise`.<[ConversationResourceResponse](botbuilder.conversationresourceresponse.md)[]>





___

<a id="showtyping"></a>

###  showTyping

► **showTyping**(): `this`



*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:253](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L253)*



Queues a new "typing" activity to the [responses](#responses) array. On supported channels this will display a typing indicator which can be used to convey to the user that activity is occurring within the bot. This indicator is typically only displayed to the user for 3 - 5 seconds so the bot should periodically send additional "typing" activities for longer running operations.

**Usage Example**

    context.showTyping(1000)
           .reply(`It was a dark and stormy night.`);




**Returns:** `this`





___


