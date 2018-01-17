/**
 * @module botbuilder
 */
/** second comment block */

export * from './index';

import { Activity, ConversationReference } from './index';

/** List of activity types supported by the Bot Framework. */
export const ActivityTypes = {
    /** A user has added/removed the bot as a contact. */
    contactRelationUpdate: 'contactRelationUpdate',

    /** User(s) have either joined or left the conversation. */
    conversationUpdate: 'conversationUpdate',

    /** The conversation is being ended by either the bot or user. */
    endOfConversation: 'endOfConversation',

    /** A named event sent from or to a client. */
    event: 'event',

    /** An operation is being invoked. */
    invoke: 'invoke',

    /** A message sent from or to a user/group. */
    message: 'message',
    
    /** A message activity within a conversation has had a message reaction added or removed. */
    messageReaction: 'messageReaction',

    /** An indicator that the bot is typing. Should be periodically resent every few seconds. */
    typing: 'typing'
}

/** Desired text format for a message being sent to a user. */
export const TextFormats = {
    /** Message text should be rendered as plain text. */
    plain: 'plain',

    /** Message text should be rendered using markdown. */
    markdown: 'markdown'
}

/** Desired layout style for a list of attachments sent to a user. */
export const AttachmentLayouts = {
    /** Attachments should be rendered as a list. */
    list: 'list',

    /** Attachments should be rendered using a carousel layout. */
    carousel: 'carousel'
}

/** Codes indicating why a conversation has ended. */
export const EndOfConversationCodes = {
    /** The conversation was ended for unknown reasons. */
    unknown: 'unknown',

    /** The conversation completed successfully. */
    completedSuccessfully: 'completedSuccessfully',

    /** The user cancelled the conversation. */
    userCancelled: 'userCancelled',

    /** The conversation was ended because requests sent to the bot timed out. */
    botTimedOut: 'botTimedOut',

    /** The conversation was ended because the bot sent an invalid message. */
    botIssuedInvalidMessage: 'botIssuedInvalidMessage',

    /** The conversation ended because the channel experienced an internal failure */
    channelFailed: 'channelFailed',

    /** The conversation ended because the bot didn't recognize the users utterance. */
    unrecognized: 'unrecognized'
}

export function getConversationReference(activity: Partial<Activity>): ConversationReference {
    return {
        activityId: activity.id,
        user: activity.from,
        bot: activity.recipient,
        conversation: activity.conversation,
        channelId: activity.channelId,
        serviceUrl: activity.serviceUrl
    };
}

export function applyConversationReference(activity: Partial<Activity>, reference: ConversationReference): void {
    activity.channelId = reference.channelId;
    activity.serviceUrl = reference.serviceUrl;
    activity.conversation = reference.conversation;
    activity.from = reference.bot;
    activity.recipient = reference.user;
    activity.replyToId = reference.activityId;
}