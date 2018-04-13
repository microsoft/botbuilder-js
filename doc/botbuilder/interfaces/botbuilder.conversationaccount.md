[Bot Builder SDK](../README.md) > [ConversationAccount](../interfaces/botbuilder.conversationaccount.md)



# Interface: ConversationAccount

*__interface__*: An interface representing ConversationAccount. Channel account information for a conversation



## Properties
<a id="conversationtype"></a>

###  conversationType

**●  conversationType**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:126](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L126)*


*__member__*: {string} [conversationType] Indicates the type of the conversation in channels that distinguish between conversation types





___

<a id="id"></a>

###  id

**●  id**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:131](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L131)*


*__member__*: {string} [id] Channel id for the user or bot on this channel (Example: joe@smith.com, or @joesmith or 123456)





___

<a id="isgroup"></a>

###  isGroup

**●  isGroup**:  *`boolean`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:121](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L121)*


*__member__*: {boolean} [isGroup] Indicates whether the conversation contains more than two participants at the time the activity was generated





___

<a id="name"></a>

###  name

**●  name**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:135](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L135)*


*__member__*: {string} [name] Display friendly name





___

<a id="role"></a>

###  role

**●  role**:  *[RoleTypes](../enums/botbuilder.roletypes.md)* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:140](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L140)*


*__member__*: {RoleTypes} [role] Role of the entity behind the account (Example: User, Bot, etc.). Possible values include: 'user', 'bot'





___


