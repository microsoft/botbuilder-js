[Bot Builder SDK](../README.md) > [Activity](../interfaces/botbuilder.activity.md)



# Interface: Activity

*__interface__*: An interface representing Activity. An Activity is the basic communication type for the Bot Framework 3.0 protocol



## Properties
<a id="action"></a>

### «Optional» action

**●  action**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:436](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L436)*


*__member__*: {string} [action] ContactAdded/Removed action





___

<a id="attachmentlayout"></a>

### «Optional» attachmentLayout

**●  attachmentLayout**:  *[AttachmentLayoutTypes](../enums/botbuilder.attachmentlayouttypes.md)⎮`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:362](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L362)*


*__member__*: {AttachmentLayoutTypes} [attachmentLayout] Hint for how to deal with multiple attachments. Default:list. Possible values include: 'list', 'carousel'





___

<a id="attachments"></a>

### «Optional» attachments

**●  attachments**:  *[Attachment](botbuilder.attachment.md)[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:423](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L423)*


*__member__*: {Attachment[]} [attachments] Attachments





___

<a id="channeldata"></a>

### «Optional» channelData

**●  channelData**:  *`any`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:432](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L432)*


*__member__*: {any} [channelData] Channel-specific payload





___

<a id="channelid"></a>

###  channelId

**●  channelId**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:338](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L338)*


*__member__*: {string} [channelId] ID of the channel where the activity was sent





___

<a id="code"></a>

### «Optional» code

**●  code**:  *[EndOfConversationCodes](../enums/botbuilder.endofconversationcodes.md)⎮`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:470](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L470)*


*__member__*: {EndOfConversationCodes} [code] Code indicating why the conversation has ended. Possible values include: 'unknown', 'completedSuccessfully', 'userCancelled', 'botTimedOut', 'botIssuedInvalidMessage', 'channelFailed'





___

<a id="conversation"></a>

###  conversation

**●  conversation**:  *[ConversationAccount](botbuilder.conversationaccount.md)* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:346](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L346)*


*__member__*: {ConversationAccount} [conversation] Conversation





___

<a id="deliverymode"></a>

### «Optional» deliveryMode

**●  deliveryMode**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:488](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L488)*


*__member__*: {string} [deliveryMode] Hint to describe how this activity should be delivered. Currently: null or "Default" = default delivery "Notification" = notification semantics





___

<a id="entities"></a>

### «Optional» entities

**●  entities**:  *[Entity](botbuilder.entity.md)[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:428](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L428)*


*__member__*: {Entity[]} [entities] Collection of Entity objects, each of which contains metadata about this activity. Each Entity object is typed.





___

<a id="expiration"></a>

### «Optional» expiration

**●  expiration**:  *`Date`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:475](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L475)*


*__member__*: {Date} [expiration] DateTime to expire the activity as ISO 8601 encoded datetime





___

<a id="from"></a>

###  from

**●  from**:  *[ChannelAccount](botbuilder.channelaccount.md)* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:342](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L342)*


*__member__*: {ChannelAccount} [from] Sender address





___

<a id="historydisclosed"></a>

### «Optional» historyDisclosed

**●  historyDisclosed**:  *`boolean`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:391](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L391)*


*__member__*: {boolean} [historyDisclosed] True if prior history of the channel is disclosed





___

<a id="id"></a>

### «Optional» id

**●  id**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:320](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L320)*


*__member__*: {string} [id] ID of this activity





___

<a id="importance"></a>

### «Optional» importance

**●  importance**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:481](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L481)*


*__member__*: {string} [importance] Importance of this activity {Low|Normal|High}, null value indicates Normal importance see ActivityImportance)





___

<a id="inputhint"></a>

### «Optional» inputHint

**●  inputHint**:  *[InputHints](../enums/botbuilder.inputhints.md)⎮`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:409](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L409)*


*__member__*: {InputHints} [inputHint] Input hint to the channel on what the bot is expecting. Possible values include: 'acceptingInput', 'ignoringInput', 'expectingInput'





___

<a id="label"></a>

###  label

**●  label**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:444](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L444)*


*__member__*: {string} [label] Descriptive label





___

<a id="localtimestamp"></a>

### «Optional» localTimestamp

**●  localTimestamp**:  *`Date`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:329](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L329)*


*__member__*: {Date} [localTimestamp] Local time when message was sent (set by client, Ex: 2016-09-23T13:07:49.4714686-07:00)





___

<a id="locale"></a>

### «Optional» locale

**●  locale**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:395](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L395)*


*__member__*: {string} [locale] The language code of the Text field





___

<a id="membersadded"></a>

### «Optional» membersAdded

**●  membersAdded**:  *[ChannelAccount](botbuilder.channelaccount.md)[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:367](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L367)*


*__member__*: {ChannelAccount[]} [membersAdded] Members added to the conversation





___

<a id="membersremoved"></a>

### «Optional» membersRemoved

**●  membersRemoved**:  *[ChannelAccount](botbuilder.channelaccount.md)[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:372](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L372)*


*__member__*: {ChannelAccount[]} [membersRemoved] Members removed from the conversation





___

<a id="name"></a>

### «Optional» name

**●  name**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:458](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L458)*


*__member__*: {string} [name] Name of the operation to invoke or the name of the event





___

<a id="reactionsadded"></a>

### «Optional» reactionsAdded

**●  reactionsAdded**:  *[MessageReaction](botbuilder.messagereaction.md)[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:377](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L377)*


*__member__*: {MessageReaction[]} [reactionsAdded] Reactions added to the activity





___

<a id="reactionsremoved"></a>

### «Optional» reactionsRemoved

**●  reactionsRemoved**:  *[MessageReaction](botbuilder.messagereaction.md)[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:382](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L382)*


*__member__*: {MessageReaction[]} [reactionsRemoved] Reactions removed from the activity





___

<a id="recipient"></a>

###  recipient

**●  recipient**:  *[ChannelAccount](botbuilder.channelaccount.md)* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:351](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L351)*


*__member__*: {ChannelAccount} [recipient] (Outbound to bot only) Bot's address that received the message





___

<a id="relatesto"></a>

### «Optional» relatesTo

**●  relatesTo**:  *[ConversationReference](botbuilder.conversationreference.md)* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:463](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L463)*


*__member__*: {ConversationReference} [relatesTo] Reference to another conversation or activity





___

<a id="replytoid"></a>

### «Optional» replyToId

**●  replyToId**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:440](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L440)*


*__member__*: {string} [replyToId] The original ID this message is a response to





___

<a id="serviceurl"></a>

###  serviceUrl

**●  serviceUrl**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:334](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L334)*


*__member__*: {string} [serviceUrl] Service endpoint where operations concerning the activity may be performed





___

<a id="speak"></a>

### «Optional» speak

**●  speak**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:403](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L403)*


*__member__*: {string} [speak] SSML Speak for TTS audio response





___

<a id="suggestedactions"></a>

### «Optional» suggestedActions

**●  suggestedActions**:  *[SuggestedActions](botbuilder.suggestedactions.md)* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:419](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L419)*


*__member__*: {SuggestedActions} [suggestedActions] SuggestedActions are used to provide keyboard/quickreply like behavior in many clients





___

<a id="summary"></a>

### «Optional» summary

**●  summary**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:414](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L414)*


*__member__*: {string} [summary] Text to display if the channel cannot render cards





___

<a id="text"></a>

###  text

**●  text**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:399](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L399)*


*__member__*: {string} [text] Content for the message





___

<a id="textformat"></a>

### «Optional» textFormat

**●  textFormat**:  *[TextFormatTypes](../enums/botbuilder.textformattypes.md)⎮`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:356](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L356)*


*__member__*: {TextFormatTypes} [textFormat] Format of text fields Default:markdown. Possible values include: 'markdown', 'plain', 'xml'





___

<a id="texthighlights"></a>

### «Optional» textHighlights

**●  textHighlights**:  *[TextHighlight](botbuilder.texthighlight.md)[]* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:493](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L493)*


*__member__*: {TextHighlight[]} [textHighlights] TextHighlight in the activity represented in the ReplyToId property





___

<a id="timestamp"></a>

### «Optional» timestamp

**●  timestamp**:  *`Date`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:324](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L324)*


*__member__*: {Date} [timestamp] UTC Time when message was sent (set by service)





___

<a id="topicname"></a>

### «Optional» topicName

**●  topicName**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:386](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L386)*


*__member__*: {string} [topicName] The conversation's updated topic name





___

<a id="type"></a>

###  type

**●  type**:  *[ActivityTypes](../enums/botbuilder.activitytypes.md)⎮`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:316](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L316)*


*__member__*: {ActivityTypes} [type] The type of the activity. Possible values include: 'message', 'contactRelationUpdate', 'conversationUpdate', 'typing', 'ping', 'endOfConversation', 'event', 'invoke', 'deleteUserData', 'messageUpdate', 'messageDelete', 'installationUpdate', 'messageReaction', 'suggestion', 'trace'





___

<a id="value"></a>

### «Optional» value

**●  value**:  *`any`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:453](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L453)*


*__member__*: {any} [value] Open-ended value





___

<a id="valuetype"></a>

###  valueType

**●  valueType**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:449](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L449)*


*__member__*: {string} [valueType] Unique string which identifies the shape of the value object





___


