  /**
   * Defines values for ActivityTypes.
   * Possible values include: 'message', 'contactRelationUpdate', 'conversationUpdate', 'typing',
   * 'endOfConversation', 'event', 'invoke', 'deleteUserData', 'messageUpdate', 'messageDelete',
   * 'installationUpdate', 'messageReaction', 'suggestion', 'trace', 'handoff'
   * @readonly
   * @enum {string}
   */
  export enum ActivityTypes {
    Message = 'message',
    ContactRelationUpdate = 'contactRelationUpdate',
    ConversationUpdate = 'conversationUpdate',
    Typing = 'typing',
    EndOfConversation = 'endOfConversation',
    Event = 'event',
    Invoke = 'invoke',
    DeleteUserData = 'deleteUserData',
    MessageUpdate = 'messageUpdate',
    MessageDelete = 'messageDelete',
    InstallationUpdate = 'installationUpdate',
    MessageReaction = 'messageReaction',
    Suggestion = 'suggestion',
    Trace = 'trace',
    Handoff = 'handoff',
  }