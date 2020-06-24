/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import {
    IEndOfConversationActivity,
    IEventActivity,
    IMessageActivity,
    IContactRelationUpdateActivity,
    IConversationUpdateActivity,
    ITypingActivity,
    IHandoffActivity,
    IInvokeActivity,
    ITraceActivity,
    IInstallationUpdateActivity,
    IMessageUpdateActivity,
    IMessageDeleteActivity,
    IMessageReactionActivity,
    ISuggestionActivity } from './activityInterfaces';

import {
    Activity,
    ActivityTypes,
    ChannelAccount,
    Channels,
    ConversationReference, 
    Mention,
    ResourceResponse} from './index';

export namespace ActivityEx {

    /**
   * Creates an Activity as an IMessageActivity object.
   * @returns The new message activity.
   */
    export function createMessageActivity(): Partial<IMessageActivity> {
        return { type: ActivityTypes.Message };
    }

    /**
   * Creates an Activity as an IContactRelationUpdateActivity object.
   * @returns The new contact relation update activity.
   */
    export function createContactRelationUpdateActivity(): Partial<IContactRelationUpdateActivity> {
        return { type: ActivityTypes.ContactRelationUpdate };
    }

    /**
   * Creates an Activity as an IConversationUpdateActivity object.
   * @returns The new conversation update activity.
   */
    export function createConversationUpdateActivity(): Partial<IConversationUpdateActivity> {
        return { type: ActivityTypes.ConversationUpdate };
    }

    /**
   * Creates an Activity as an ITypingActivity object.
   * @returns The new typing activity.
   */
    export function createTypingActivity(): Partial<ITypingActivity> {
        return { type: ActivityTypes.Typing };
    }

    /**
   * Creates an Activity as an IHandoffActivity object.
   * @returns The new handoff activity.
   */
    export function createHandoffActivity(): Partial<IHandoffActivity> {
        return { type: ActivityTypes.Handoff };
    }

    /**
   * Creates an Activity as an IEndOfConversationActivity object.
   * @returns The new end of conversation activity.
   */
    export function createEndOfConversationActivity(): Partial<IEndOfConversationActivity> {
        return { type: ActivityTypes.EndOfConversation };
    }

    /**
   * Creates an Activity as an IEventActivity object.
   * @returns The new event activity.
   */
    export function createEventActivity(): Partial<IEventActivity> {
        return { type: ActivityTypes.Event };
    }

    /**
   * Creates an Activity as an IInvokeActivity object.
   * @returns The new invoke activity.
   */
    export function createInvokeActivity(): Partial<IInvokeActivity> {
        return { type: ActivityTypes.Invoke };
    }

    /**
   * Creates an Activity as an ITraceActivity object.
   * @param name The name of the trace operation to create.
   * @param valueType Optional, identifier for the format of the @param value .
   * @param value Optional, the content for this trace operation.
   * @param label Optional, a descriptive label for this trace operation.
   * @returns The new trace activity.
   */
    export function createTraceActivity(name: string, valueType?: string, value?: any, label?: string): Partial<ITraceActivity> {
        return { 
            type: ActivityTypes.Trace,
            name: name,
            valueType: valueType,
            value: value,
            label: label
            };
    }

    /**
   * Creates a new message activity as a response to this activity.
   * @param source The activity to respond.
   * @param text The text of the reply.
   * @param locale The language code for the @param text .
   * @returns The new message activity.
   */
    export function createReply(source: Activity, text?: string, locale?: string): Activity {
        const reply: string = text || '';

        return {
            type: ActivityTypes.Message,
            timestamp: new Date(),
            from: source.recipient,
            recipient: source.from,
            replyToId: source.id,
            serviceUrl: source.serviceUrl,
            channelId: source.channelId,
            conversation: source.conversation,
            text: reply,
            locale: locale,
            label: source.label,
            callerId: source.callerId,
            valueType: source.valueType,
            localTimezone: source.localTimezone,
            listenFor: source.listenFor,
            semanticAction: source.semanticAction
        };
    }

    /**
   * Creates a new trace activity based on the source activity.
   * @param source The activity to base the trace.
   * @param name The name of the trace operation to create.
   * @param value Optional, the content for this trace operation.
   * @param valueType Optional, identifier for the format of the @param value .
   * @param label Optional, a descriptive label for this trace operation.
   * @returns The new trace activity.
   */
    export function createTrace(source: Activity, name: string, value?: any, valueType?: string, label?: string): ITraceActivity {
        return {
            type: ActivityTypes.Trace,
            timestamp: new Date(),
            from: source.recipient,
            recipient: source.from,
            replyToId: source.id,
            serviceUrl: source.serviceUrl,
            channelId: source.channelId,
            conversation: source.conversation,
            name: name,
            label: label,
            valueType: valueType? valueType : value.getType(),
            value: value
        };
    }

    /**
   * Returns the source activity as an IMessageActivity object; or null, if this is not that type of activity.
   * @param source The source activity.
   * @returns This activity as a message activity; or null.
   */
    export function asMessageActivity(source: Partial<Activity>): Partial<IMessageActivity> {
        return isActivity(source, ActivityTypes.Message) ? source : null;
    }

    /**
   * Returns the source activity as an IContactRelationUpdateActivity object; or null, if this is not that type of activity.
   * @param source The source activity.
   * @returns This activity as a contact relation update activity; or null.
   */
    export function asContactRelationUpdateActivity(source: Partial<Activity>): Partial<IContactRelationUpdateActivity> {
        return isActivity(source, ActivityTypes.ContactRelationUpdate) ? source : null;
    }

    /**
   * Returns the source activity as an IInstallationUpdateActivity object; or null, if this is not that type of activity.
   * @param source The source activity.
   * @returns This activity as an installation update activity; or null.
   */
    export function asInstallationUpdateActivity(source: Partial<Activity>): Partial<IInstallationUpdateActivity> {
        return isActivity(source, ActivityTypes.InstallationUpdate) ? source : null;
    }

    /**
   * Returns the source activity as an IConversationUpdateActivity object; or null, if this is not that type of activity.
   * @param source The source activity.
   * @returns This activity as an conversation update activity; or null.
   */
    export function asConversationUpdateActivity(source: Partial<Activity>): Partial<IConversationUpdateActivity> {
        return isActivity(source, ActivityTypes.ConversationUpdate) ? source : null;
    }

    /**
   * Returns the source activity as an ITypingActivity object; or null, if this is not that type of activity.
   * @param source The source activity.
   * @returns This activity as a typing activity; or null.
   */
    export function asTypingActivity(source: Partial<Activity>): Partial<ITypingActivity> {
        return isActivity(source, ActivityTypes.Typing) ? source : null;
    }

    /**
   * Returns the source activity as an IEndOfConversationActivity object; or null, if this is not that type of activity.
   * @param source The source activity.
   * @returns This activity as an end of conversation activity; or null.
   */
    export function asEndOfConversationActivity(source: Partial<Activity>): Partial<IEndOfConversationActivity> {
        return isActivity(source, ActivityTypes.EndOfConversation) ? source : null;
    }

    /**
   * Returns the source activity as an IEventActivity object; or null, if this is not that type of activity.
   * @param source The source activity.
   * @returns This activity as an event activity; or null.
   */
    export function asEventActivity(source: Partial<Activity>): Partial<IEventActivity> {
        return isActivity(source, ActivityTypes.Event) ? source : null;
    }

    /**
   * Returns the source activity as an IInvokeActivity object; or null, if this is not that type of activity.
   * @param source The source activity.
   * @returns This activity as an invoke activity; or null.
   */
    export function asInvokeActivity(source: Partial<Activity>): Partial<IInvokeActivity> {
        return isActivity(source, ActivityTypes.Invoke) ? source : null;
    }

    /**
   * Returns the source activity as an IMessageUpdateActivity object; or null, if this is not that type of activity.
   * @param source The source activity.
   * @returns This activity as a message update request; or null.
   */
    export function asMessageUpdateActivity(source: Partial<Activity>): Partial<IMessageUpdateActivity> {
        return isActivity(source, ActivityTypes.MessageUpdate) ? source : null;
    }

    /**
   * Returns the source activity as an IMessageDeleteActivity object; or null, if this is not that type of activity.
   * @param source The source activity.
   * @returns This activity as a message delete request; or null.
   */
    export function asMessageDeleteActivity(source: Partial<Activity>): Partial<IMessageDeleteActivity> {
        return isActivity(source, ActivityTypes.MessageDelete) ? source : null;
    }

    /**
   * Returns the source activity as an IMessageReactionActivity object; or null, if this is not that type of activity.
   * @param source The source activity.
   * @returns This activity as a message reaction activity; or null.
   */
    export function asMessageReactionActivity(source: Partial<Activity>): Partial<IMessageReactionActivity> {
        return isActivity(source, ActivityTypes.MessageReaction) ? source : null;
    }

    /**
   * Returns the source activity as an ISuggestionActivity object; or null, if this is not that type of activity.
   * @param source The source activity.
   * @returns This activity as a suggestion activity; or null.
   */
    export function asSuggestionActivity(source: Partial<Activity>): Partial<ISuggestionActivity> {
        return isActivity(source, ActivityTypes.Suggestion) ? source : null;
    }

    /**
   * Returns the source activity as an ITraceActivity object; or null, if this is not that type of activity.
   * @param source The source activity.
   * @returns This activity as a trace activity; or null.
   */
    export function asTraceActivity(source: Partial<Activity>): Partial<ITraceActivity> {
        return isActivity(source, ActivityTypes.Trace) ? source : null;
    }

    /**
   * Returns the source activity as an IHandoffActivity object; or null, if this is not that type of activity.
   * @param source The source activity.
   * @returns This activity as a handoff activity; or null.
   */
    export function asHandoffActivity(source: Partial<Activity>): Partial<IHandoffActivity> {
        return isActivity(source, ActivityTypes.Handoff) ? source : null;
    }

    /**
   * Indicates whether the source activity has content.
   * @param source The source activity.
   * @returns True, if this activity has any content to send; otherwise, false.
   */
    export function hasContent(source: Partial<Activity>): boolean  {
        if(source.text) {
            return true;
        }

        if(source.summary) {
            return true;
        }

        if(source.attachments) {
            return true;
        }

        if(source.channelData) {
            return true;
        }

        return false;
    }

    /**
   * Resolves the mentions from the entities of the source activity.
   * @param source The source activity.
   * @returns The array of mentions; or an empty array, if none are found.
   */
    export function getMentions(source: Partial<Activity>) : Mention[] {
        return source.entities.filter(x => x.type.toLowerCase() === 'mention')
        .map(e => e as Mention );
    }

    /**
   * Creates a ConversationReference based on the source activity.
   * @param source The source activity.
   * @returns A conversation reference for the conversation that contains the activity.
   */
    export function getConversationReference(source: Partial<Activity>) : Partial<ConversationReference> {
        return {
            activityId: source.id,
            user: source.from,
            bot: source.recipient,
            conversation: source.conversation,
            channelId: source.channelId,
            locale: source.locale,
            serviceUrl: source.serviceUrl
        } as ConversationReference;
    }

    /**
   * Creates a ConversationReference based on the Activity's Conversation info and the ResourceResponse from sending an activity.
   * @param source The source activity.
   * @param reply ResourceResponse returned from sendActivity.
   * @returns A ConversationReference that can be stored and used later to delete or update the activity.
   */
    export function getReplyConversationReference(source: Partial<Activity>, reply: Partial<ResourceResponse>) : Partial<ConversationReference> {
        const reference = getConversationReference(source);
        reference.activityId = reply.id;
        
        return reference;
    }

    /**
   * Updates the source activity with the delivery information from an existing Conversation Reference.
   * @param source The source activity.
   * @param isComming Optional, true to treat the activity as an incoming activity, where the bot is the recipient; otherwise, false.
   * Default is false, and the activity will show the bot as the sender.
   * @returns The activity, updated with the delivery information.
   */
    export function applyConversationReference(source: Partial<Activity>, reference: Partial<ConversationReference>, isComming?: boolean): Partial<Activity> {
        if (reference.channelId !== undefined) {
            source.channelId = reference.channelId;
        }

        if (reference.serviceUrl !== undefined) {
            source.serviceUrl = reference.serviceUrl;
        }
        
        if (reference.conversation !== undefined) {
            source.conversation = reference.conversation;
        }

        if (reference.locale !== undefined) {
            source.locale = reference.locale;
        }

        if(isComming) {
            if (reference.user !== undefined) {
                source.from = reference.user;
            }

            if (reference.bot !== undefined) {
                source.recipient = reference.bot;
            }

            if(reference.activityId !== undefined) {
                source.id = reference.activityId;
            }
        } else {
            if(reference.bot !== undefined) {
                source.from = reference.bot;
            }
            if(reference.user !== undefined) {
                source.recipient = reference.user;
            }
            if(reference.activityId !== undefined) {
                source.replyToId = reference.activityId;
            }
        }

        return source;
    }

    /**
   * Determines if the Activity was sent via an Http/Https connection or Streaming by looking at the ServiceUrl property.
   * @param source The source activity.
   * @returns True if the Activity was originate from a streaming connection.
   */
    export function isFromStreamingConnection(source: Partial<Activity>) : boolean {
        const isHttp = source.serviceUrl.toLowerCase().startsWith("http");

        return isHttp? !isHttp : false;
    }

    /**
   * Gets the continuation event of the source activity.
   * @param source The source activity.
   * @returns The continue conversation event activity.
   */
    export function getContinuationActivity(source: Partial<ConversationReference>): Partial<Activity> {
        if (source === undefined) {
            throw new Error('source needs to be defined');
        }

        return {
            type: ActivityTypes.Event,
            name: 'ContinueConversation',
            channelId: source.channelId,
            serviceUrl: source.serviceUrl,
            conversation: source.conversation,
            recipient: source.bot,
            from: source.user,
            relatesTo: source as ConversationReference
        };
    }

    /**
   * Indicates whether the activity is an start of conversation activity.
   * @param source The source activity.
   * @returns True if the activity starts a conversation, otherwise, false.
   */
    export function isStartActivity(activity: Activity): boolean {
        switch (activity.channelId) {
            case Channels.Skype: {
                if (activity.type === ActivityTypes.ContactRelationUpdate && activity.action === 'add') {
                    return true;
                }

                return false;
            }
            case Channels.Directline:
            case Channels.Emulator:
            case Channels.Webchat:
            case Channels.Msteams:
            case Channels.DirectlineSpeech:
            case Channels.Test: {
                if (activity.type === ActivityTypes.ConversationUpdate) {
                    // When bot is added to the conversation (triggers start only once per conversation)
                    if (activity.membersAdded !== undefined &&
                        activity.membersAdded.some((m: ChannelAccount): boolean => m.id === activity.recipient.id)) {
                        return true;
                    }
                }

                return false;
            }
            default:
                return false;
        }
    }

    /**
   * Indicates whether this activity is of a specified activity type.
   * @param source The source activity.
   * @param activityType The activity type to check for.
   * @returns True if the activity is of the specified activity type; otherwise, false.
   */
    export function isActivity(source:Partial<Activity>, activityType: string): boolean {
        const type = source.type;

        if (!type) {
            return false;
        }

        let result = type.toUpperCase().startsWith(activityType.toUpperCase())

        if(result) {
            result = type.length == activityType.length;
        }

        if(!result) {
            result = (type.length > activityType.length) && (type[activityType.length] == '/');
        }

        return result;
    }    
}