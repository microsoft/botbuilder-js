[Bot Builder SDK - Core](../README.md) > [Activity](../interfaces/botbuilder.activity.md)



# Interface: Activity

*__interface__*: An interface representing Activity. An Activity is the basic communication type for the Bot Framework 3.0 protocol



## Properties
<a id="action"></a>

### «Optional» action

**●  action**:  *`undefined`⎮`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:404*


*__member__*: {string} [action] ContactAdded/Removed action





___

<a id="attachmentlayout"></a>

### «Optional» attachmentLayout

**●  attachmentLayout**:  *[AttachmentLayoutTypes](../enums/botbuilder.attachmentlayouttypes.md)⎮`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:330*


*__member__*: {AttachmentLayoutTypes} [attachmentLayout] Hint for how to deal with multiple attachments. Default:list. Possible values include: 'list', 'carousel'





___

<a id="attachments"></a>

### «Optional» attachments

**●  attachments**:  *[Attachment](botbuilder.attachment.md)[]* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:391*


*__member__*: {Attachment[]} [attachments] Attachments





___

<a id="channeldata"></a>

### «Optional» channelData

**●  channelData**:  *`any`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:400*


*__member__*: {any} [channelData] Channel-specific payload





___

<a id="channelid"></a>

###  channelId

**●  channelId**:  *`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:306*


*__member__*: {string} [channelId] ID of the channel where the activity was sent





___

<a id="code"></a>

### «Optional» code

**●  code**:  *[EndOfConversationCodes](../enums/botbuilder.endofconversationcodes.md)⎮`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:429*


*__member__*: {EndOfConversationCodes} [code] Code indicating why the conversation has ended. Possible values include: 'unknown', 'completedSuccessfully', 'userCancelled', 'botTimedOut', 'botIssuedInvalidMessage', 'channelFailed'





___

<a id="conversation"></a>

###  conversation

**●  conversation**:  *[ConversationAccount](botbuilder.conversationaccount.md)* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:314*


*__member__*: {ConversationAccount} [conversation] Conversation





___

<a id="deliverymode"></a>

### «Optional» deliveryMode

**●  deliveryMode**:  *`undefined`⎮`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:447*


*__member__*: {string} [deliveryMode] Hint to describe how this activity should be delivered. Currently: null or "Default" = default delivery "Notification" = notification semantics





___

<a id="entities"></a>

### «Optional» entities

**●  entities**:  *[Entity](botbuilder.entity.md)[]* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:396*


*__member__*: {Entity[]} [entities] Collection of Entity objects, each of which contains metadata about this activity. Each Entity object is typed.





___

<a id="expiration"></a>

### «Optional» expiration

**●  expiration**:  *[Date]()* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:434*


*__member__*: {Date} [expiration] DateTime to expire the activity as ISO 8601 encoded datetime





___

<a id="from"></a>

###  from

**●  from**:  *[ChannelAccount](botbuilder.channelaccount.md)* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:310*


*__member__*: {ChannelAccount} [from] Sender address





___

<a id="historydisclosed"></a>

### «Optional» historyDisclosed

**●  historyDisclosed**:  *`undefined`⎮`true`⎮`false`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:359*


*__member__*: {boolean} [historyDisclosed] True if prior history of the channel is disclosed





___

<a id="id"></a>

### «Optional» id

**●  id**:  *`undefined`⎮`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:288*


*__member__*: {string} [id] ID of this activity





___

<a id="importance"></a>

### «Optional» importance

**●  importance**:  *`undefined`⎮`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:440*


*__member__*: {string} [importance] Importance of this activity {Low|Normal|High}, null value indicates Normal importance see ActivityImportance)





___

<a id="inputhint"></a>

### «Optional» inputHint

**●  inputHint**:  *[InputHints](../enums/botbuilder.inputhints.md)⎮`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:377*


*__member__*: {InputHints} [inputHint] Input hint to the channel on what the bot is expecting. Possible values include: 'acceptingInput', 'ignoringInput', 'expectingInput'





___

<a id="localtimestamp"></a>

### «Optional» localTimestamp

**●  localTimestamp**:  *[Date]()* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:297*


*__member__*: {Date} [localTimestamp] Local time when message was sent (set by client, Ex: 2016-09-23T13:07:49.4714686-07:00)





___

<a id="locale"></a>

### «Optional» locale

**●  locale**:  *`undefined`⎮`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:363*


*__member__*: {string} [locale] The language code of the Text field





___

<a id="membersadded"></a>

### «Optional» membersAdded

**●  membersAdded**:  *[ChannelAccount](botbuilder.channelaccount.md)[]* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:335*


*__member__*: {ChannelAccount[]} [membersAdded] Members added to the conversation





___

<a id="membersremoved"></a>

### «Optional» membersRemoved

**●  membersRemoved**:  *[ChannelAccount](botbuilder.channelaccount.md)[]* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:340*


*__member__*: {ChannelAccount[]} [membersRemoved] Members removed from the conversation





___

<a id="name"></a>

### «Optional» name

**●  name**:  *`undefined`⎮`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:417*


*__member__*: {string} [name] Name of the operation to invoke or the name of the event





___

<a id="reactionsadded"></a>

### «Optional» reactionsAdded

**●  reactionsAdded**:  *[MessageReaction](botbuilder.messagereaction.md)[]* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:345*


*__member__*: {MessageReaction[]} [reactionsAdded] Reactions added to the activity





___

<a id="reactionsremoved"></a>

### «Optional» reactionsRemoved

**●  reactionsRemoved**:  *[MessageReaction](botbuilder.messagereaction.md)[]* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:350*


*__member__*: {MessageReaction[]} [reactionsRemoved] Reactions removed from the activity





___

<a id="recipient"></a>

###  recipient

**●  recipient**:  *[ChannelAccount](botbuilder.channelaccount.md)* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:319*


*__member__*: {ChannelAccount} [recipient] (Outbound to bot only) Bot's address that received the message





___

<a id="relatesto"></a>

### «Optional» relatesTo

**●  relatesTo**:  *[ConversationReference](botbuilder.conversationreference.md)* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:422*


*__member__*: {ConversationReference} [relatesTo] Reference to another conversation or activity





___

<a id="replytoid"></a>

### «Optional» replyToId

**●  replyToId**:  *`undefined`⎮`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:408*


*__member__*: {string} [replyToId] The original ID this message is a response to





___

<a id="serviceurl"></a>

###  serviceUrl

**●  serviceUrl**:  *`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:302*


*__member__*: {string} [serviceUrl] Service endpoint where operations concerning the activity may be performed





___

<a id="speak"></a>

### «Optional» speak

**●  speak**:  *`undefined`⎮`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:371*


*__member__*: {string} [speak] SSML Speak for TTS audio response





___

<a id="suggestedactions"></a>

### «Optional» suggestedActions

**●  suggestedActions**:  *[SuggestedActions](botbuilder.suggestedactions.md)* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:387*


*__member__*: {SuggestedActions} [suggestedActions] SuggestedActions are used to provide keyboard/quickreply like behavior in many clients





___

<a id="summary"></a>

### «Optional» summary

**●  summary**:  *`undefined`⎮`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:382*


*__member__*: {string} [summary] Text to display if the channel cannot render cards





___

<a id="text"></a>

###  text

**●  text**:  *`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:367*


*__member__*: {string} [text] Content for the message





___

<a id="textformat"></a>

### «Optional» textFormat

**●  textFormat**:  *[TextFormatTypes](../enums/botbuilder.textformattypes.md)⎮`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:324*


*__member__*: {TextFormatTypes} [textFormat] Format of text fields Default:markdown. Possible values include: 'markdown', 'plain', 'xml'





___

<a id="texthighlights"></a>

### «Optional» textHighlights

**●  textHighlights**:  *[TextHighlight](botbuilder.texthighlight.md)[]* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:452*


*__member__*: {TextHighlight[]} [textHighlights] TextHighlight in the activity represented in the ReplyToId property





___

<a id="timestamp"></a>

### «Optional» timestamp

**●  timestamp**:  *[Date]()* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:292*


*__member__*: {Date} [timestamp] UTC Time when message was sent (set by service)





___

<a id="topicname"></a>

### «Optional» topicName

**●  topicName**:  *`undefined`⎮`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:354*


*__member__*: {string} [topicName] The conversation's updated topic name





___

<a id="type"></a>

###  type

**●  type**:  *[ActivityTypes](../enums/botbuilder.activitytypes.md)⎮`string`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:284*


*__member__*: {ActivityTypes} [type] The type of the activity. Possible values include: 'message', 'contactRelationUpdate', 'conversationUpdate', 'typing', 'ping', 'endOfConversation', 'event', 'invoke', 'deleteUserData', 'messageUpdate', 'messageDelete', 'installationUpdate', 'messageReaction', 'suggestion'





___

<a id="value"></a>

### «Optional» value

**●  value**:  *`any`* 

*Defined in libraries/botbuilder/node_modules/botframework-schema/lib/index.d.ts:412*


*__member__*: {any} [value] Open-ended value





___


