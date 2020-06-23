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

    export function createTyingActivity(): Partial<ITypingActivity> {
        return { type: ActivityTypes.Typing };
    }

    export function CreateHandoffActivity(): Partial<IHandoffActivity> {
        return { type: ActivityTypes.Handoff };
    }

    export function CreateEndOfConversationActivity(): Partial<IEndOfConversationActivity> {
        return { type: ActivityTypes.EndOfConversation };
    }

    export function createEventActivity(): Partial<IEventActivity> {
        return { type: ActivityTypes.Event };
    }

    export function createInvokeActivity(): Partial<IInvokeActivity> {
        return { type: ActivityTypes.Invoke };
    }

    export function createTraceActivity(name: string, valueType?: string, value?: any, label?: string): Partial<ITraceActivity> {
        return { 
            type: ActivityTypes.Trace,
            name: name,
            valueType: valueType,
            value: value,
            label: label
            };
    }

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

    export function asMessageActivity(source: Partial<Activity>): Partial<IMessageActivity> {
        return isActivity(source, ActivityTypes.Message) ? this : null;
    }

    export function AsContactRelationUpdateActivity(source: Partial<Activity>): IContactRelationUpdateActivity {
        return isActivity(source, ActivityTypes.ContactRelationUpdate) ? this : null;
    }

    export function AsInstallationUpdateActivity(source: Partial<Activity>): IInstallationUpdateActivity {
        return isActivity(source, ActivityTypes.InstallationUpdate) ? this : null;
    }

    export function AsConversationUpdateActivity(source: Partial<Activity>): IConversationUpdateActivity {
        return isActivity(source, ActivityTypes.ConversationUpdate) ? this : null;
    }

    export function AsTypingActivity(source: Partial<Activity>): ITypingActivity {
        return isActivity(source, ActivityTypes.Typing) ? this : null;
    }

    export function AsEndOfConversationActivity(source: Partial<Activity>): IEndOfConversationActivity {
        return isActivity(source, ActivityTypes.EndOfConversation) ? this : null;
    }

    export function AsEventActivity(source: Partial<Activity>): IEventActivity {
        return isActivity(source, ActivityTypes.Event) ? this : null;
    }

    export function AsInvokeActivity(source: Partial<Activity>): IInvokeActivity {
        return isActivity(source, ActivityTypes.Invoke) ? this : null;
    }

    export function AsMessageUpdateActivity(source: Partial<Activity>): IMessageUpdateActivity {
        return isActivity(source, ActivityTypes.MessageUpdate) ? this : null;
    }

    export function AsMessageDeleteActivity(source: Partial<Activity>): IMessageDeleteActivity {
        return isActivity(source, ActivityTypes.MessageDelete) ? this : null;
    }

    export function AsMessageReactionActivity(source: Partial<Activity>): IMessageReactionActivity {
        return isActivity(source, ActivityTypes.MessageReaction) ? this : null;
    }

    export function AsSuggestionActivity(source: Partial<Activity>): ISuggestionActivity {
        return isActivity(source, ActivityTypes.Suggestion) ? this : null;
    }

    export function AsTraceActivity(source: Partial<Activity>): ITraceActivity {
        return isActivity(source, ActivityTypes.Trace) ? this : null;
    }

    export function AsHandoffActivity(source: Partial<Activity>): IHandoffActivity {
        return isActivity(source, ActivityTypes.Handoff) ? this : null;
    }

    export function HasContent(source: Partial<Activity>): boolean  {
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

    export function GetMentions(source: Partial<Activity>) : Mention[] {
        return source.entities.filter(x => x.type.toLowerCase() === 'mention')
        .map(e => e as Mention );
    }

    export function GetConversationReference(source: Partial<Activity>) : Partial<ConversationReference> {
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

    export function GetReplyConversationReference(source: Partial<Activity>, reply: Partial<ResourceResponse>) : Partial<ConversationReference> {
        let reference = GetConversationReference(source);
        reference.activityId = reply.id;
        
        return reference;
    }

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

    export function IsFromStreamingConnection(source: Partial<Activity>) : boolean {
        let isHttp = source.serviceUrl.toLowerCase().startsWith("http");

        return isHttp? !isHttp : false;
    }

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

    export function isActivity(source:Partial<Activity>, activityType: string): boolean {
        let type = source.type;

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