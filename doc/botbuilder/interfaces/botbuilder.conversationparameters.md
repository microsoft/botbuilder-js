[Bot Builder SDK - Core](../README.md) > [ConversationParameters](../interfaces/botbuilder.conversationparameters.md)



# Interface: ConversationParameters


Parameters for creating a new conversation.


## Properties
<a id="activity"></a>

### «Optional» activity

**●  activity**:  *[Activity](botbuilder.activity.md)* 

*Defined in [libraries/botbuilder/lib/index.d.ts:222](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/index.d.ts#L222)*



(Optional) When creating a new conversation, use this activity as the initial message to the conversation.




___

<a id="bot"></a>

### «Optional» bot

**●  bot**:  *[ChannelAccount](botbuilder.channelaccount.md)* 

*Defined in [libraries/botbuilder/lib/index.d.ts:213](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/index.d.ts#L213)*



The bot address for this conversation.




___

<a id="channeldata"></a>

### «Optional» channelData

**●  channelData**:  *`any`* 

*Defined in [libraries/botbuilder/lib/index.d.ts:224](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/index.d.ts#L224)*



Channel specific payload for creating the conversation.




___

<a id="isgroup"></a>

### «Optional» isGroup

**●  isGroup**:  *`undefined`⎮`true`⎮`false`* 

*Defined in [libraries/botbuilder/lib/index.d.ts:211](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/index.d.ts#L211)*



If true this is a group conversation.




___

<a id="members"></a>

### «Optional» members

**●  members**:  *[ChannelAccount](botbuilder.channelaccount.md)[]* 

*Defined in [libraries/botbuilder/lib/index.d.ts:215](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/index.d.ts#L215)*



Members to add to the conversation.




___

<a id="topicname"></a>

### «Optional» topicName

**●  topicName**:  *`undefined`⎮`string`* 

*Defined in [libraries/botbuilder/lib/index.d.ts:217](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/index.d.ts#L217)*



(Optional) Topic of the conversation (if supported by the channel).




___


