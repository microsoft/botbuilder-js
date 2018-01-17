/**
 * @module botbuilder
 */
/** second comment block */
export * from './index';
import { Activity, ConversationReference } from './index';
/** List of activity types supported by the Bot Framework. */
export declare const ActivityTypes: {
    contactRelationUpdate: string;
    conversationUpdate: string;
    endOfConversation: string;
    event: string;
    invoke: string;
    message: string;
    messageReaction: string;
    typing: string;
};
/** Desired text format for a message being sent to a user. */
export declare const TextFormats: {
    plain: string;
    markdown: string;
};
/** Desired layout style for a list of attachments sent to a user. */
export declare const AttachmentLayouts: {
    list: string;
    carousel: string;
};
/** Codes indicating why a conversation has ended. */
export declare const EndOfConversationCodes: {
    unknown: string;
    completedSuccessfully: string;
    userCancelled: string;
    botTimedOut: string;
    botIssuedInvalidMessage: string;
    channelFailed: string;
    unrecognized: string;
};
export declare function getConversationReference(activity: Partial<Activity>): ConversationReference;
export declare function applyConversationReference(activity: Partial<Activity>, reference: ConversationReference): void;
