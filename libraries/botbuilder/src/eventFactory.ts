/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext } from 'botbuilder-core';
import { Activity, Attachment, ConversationAccount, ConversationReference, Transcript } from 'botframework-schema';
import * as moment from 'moment-timezone';
import { HandoffEventNames } from './handoffEventNames';

/**
 * Contains utility methods for creating various event types.
 */
export class EventFactory {
    /**
     * Create handoff initiation event.
     * @param context The context object for the turn.
     * @param handoffContext Agent hub-specific context.
     * @param transcript Transcript of the conversation.
     */
    public static createHandoffInitiation(context: TurnContext, handoffContext: any, transcript?: Transcript): Activity {
        if (!context) {
            throw new TypeError('EventFactory.createHandoffInitiation(): Missing context.');
        }

        const handoffEvent = this.createHandoffEvent(HandoffEventNames.InitiateHandoff, handoffContext, context.activity.conversation);

        handoffEvent.from = context.activity.from;
        handoffEvent.relatesTo = TurnContext.getConversationReference(context.activity) as ConversationReference;
        handoffEvent.replyToId = context.activity.id;
        handoffEvent.serviceUrl = context.activity.serviceUrl;
        handoffEvent.channelId = context.activity.channelId;

        if (transcript) {
            const attachment: Attachment = {
                content: transcript,
                contentType: 'application/json',
                name: 'Transcript'
            };
            handoffEvent.attachments.push(attachment);
        }

        return handoffEvent;
    }

    /**
     * Create handoff status event.
     * @param conversation Conversation being handed over.
     * @param state State, possible values are: "accepted", "failed", "completed".
     * @param message Additional message for failed handoff.
     */
    public static createHandoffStatus(conversation: ConversationAccount, state: string, message?: string): Activity {
        if (!conversation) {
            throw new TypeError('EventFactory.createHandoffStatus(): missing conversation.');
        }

        if (!state) {
            throw new TypeError('EventFactory.createHandoffStatus(): missing state.');
        }
        
        const value: any = { state, message };

        const handoffEvent = this.createHandoffEvent(HandoffEventNames.HandoffStatus, value, conversation);

        return handoffEvent;
    }

    private static createHandoffEvent(name: string, value: any, conversation: ConversationAccount): Activity {
        const handoffEvent: Activity = {} as any;

        handoffEvent.name = name;
        handoffEvent.value = value;
        handoffEvent.id = uuid();
        handoffEvent.timestamp = new Date(Date.now());
        // The timestamp does not contain the local offset which is a known limitation of Date objects in JavaScript.
        // Therefore, the localTimezone is included in the handoffEvent.
        handoffEvent.localTimezone = moment.tz.guess();
        handoffEvent.conversation = conversation;
        handoffEvent.attachments = [];
        handoffEvent.entities = [];

        return handoffEvent;
    }
}

function uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c): string => {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
