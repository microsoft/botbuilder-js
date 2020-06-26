/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const assert = require('assert');
const { ActivityTypes } = require('../lib/index');
const { ActivityEx } = require('../lib/ActivityEx');

describe(`activityValidator`, function() {

    it('should create a Message Activity', () => {
        const activity = ActivityEx.createMessageActivity();

        assert.strictEqual(activity.type, ActivityTypes.Message);
    });

    it('should create a Contact Relation Update Activity', () => {
        const activity = ActivityEx.createContactRelationUpdateActivity();

        assert.strictEqual(activity.type, ActivityTypes.ContactRelationUpdate);
    });

    it('should create a Conversation Update Activity', () => {
        const activity = ActivityEx.createConversationUpdateActivity();

        assert.strictEqual(activity.type, ActivityTypes.ConversationUpdate);
    });

    it('should create a Typing Activity', () => {
        const activity = ActivityEx.createTypingActivity();

        assert.strictEqual(activity.type, ActivityTypes.Typing);
    });

    it('should create a Handoff Activity', () => {
        const activity = ActivityEx.createHandoffActivity();

        assert.strictEqual(activity.type, ActivityTypes.Handoff);
    });

    it('should create an End of Conversation Activity', () => {
        const activity = ActivityEx.createEndOfConversationActivity();

        assert.strictEqual(activity.type, ActivityTypes.EndOfConversation);
    });

    it('should create an Event Activity', () => {
        const activity = ActivityEx.createEventActivity();

        assert.strictEqual(activity.type, ActivityTypes.Event);
    });

    it('should create an Invoke Activity', () => {
        const activity = ActivityEx.createInvokeActivity();

        assert.strictEqual(activity.type, ActivityTypes.Invoke);
    });

    it('should create a Trace Activity', () => {
        const name = 'test-activity';
        const valueType = 'string';
        const value = 'test-value';
        const label = 'test-label';

        const activity = ActivityEx.createTraceActivity(name, valueType, value, label);

        assert.strictEqual(activity.type, ActivityTypes.Trace);
        assert.strictEqual(activity.valueType, valueType);
        assert.strictEqual(activity.value, value);
        assert.strictEqual(activity.label, label);
    });

    it('should create a Trace Activity without valueType', () => {
        const name = 'test-activity';
        const value = 'test-value';
        const label = 'test-label';

        const activity = ActivityEx.createTraceActivity(name, undefined, value, label);

        assert.strictEqual(activity.type, ActivityTypes.Trace);
        assert.strictEqual(activity.valueType, typeof(value));
        assert.strictEqual(activity.label, label);
    });

    it('should create a reply for the activity', () => {
        const activity = CreateActivity();

        const text = 'test reply';
        const locale = 'en-us';

        const reply = ActivityEx.createReply(activity, text, locale);

        assert.strictEqual(reply.type, ActivityTypes.Message);
        assert.strictEqual(reply.text, text);
        assert.strictEqual(reply.locale, locale);
    });

    it('should create a reply without arguments for the activity', () => {
        const activity = CreateActivity();

        const reply = ActivityEx.createReply(activity);

        assert.strictEqual(reply.type, ActivityTypes.Message);
        assert.strictEqual(reply.text, "");
        assert.strictEqual(reply.locale, activity.locale);
    });

    it('should return Activity as message activity', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asMessageActivity(activity);

        assert.strictEqual(result.type, ActivityTypes.Message);
    });

    it('should return null when Activity type is different than Message', () => {
        const activity = CreateActivity();

        activity.type = 'trace';

        const result = ActivityEx.asMessageActivity(activity);

        assert.strictEqual(result, null);
    });

    it('should return null when Activity type is null', () => {
        const activity = CreateActivity();

        const activityType = 'message';
        activity.type = null;

        const result = ActivityEx.asMessageActivity(activity);

        assert.strictEqual(result, null);
    });

    it('should return Activity as Contact Relation Update activity', () => {
        const activity = CreateActivity();

        activity.type = 'contactRelationUpdate';

        const result = ActivityEx.asContactRelationUpdateActivity(activity);

        assert.strictEqual(result.type, ActivityTypes.ContactRelationUpdate);
    });

    it('should return null when Activity type is different than contactRelationUpdate', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asContactRelationUpdateActivity(activity);

        assert.strictEqual(result, null);
    });

    it('should return Activity as Installation Update activity', () => {
        const activity = CreateActivity();

        activity.type = 'installationUpdate';

        const result = ActivityEx.asInstallationUpdateActivity(activity);

        assert.strictEqual(result.type, ActivityTypes.InstallationUpdate);
    });

    it('should return null when Activity type is different than installationUpdate', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asInstallationUpdateActivity(activity);

        assert.strictEqual(result, null);
    });

    it('should return Activity as Conversation Update activity', () => {
        const activity = CreateActivity();

        activity.type = 'conversationUpdate';

        const result = ActivityEx.asConversationUpdateActivity(activity);

        assert.strictEqual(result.type, ActivityTypes.ConversationUpdate);
    });

    it('should return null when Activity type is different than conversationUpdate', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asConversationUpdateActivity(activity);

        assert.strictEqual(result, null);
    });

    it('should return Activity as Typing activity', () => {
        const activity = CreateActivity();

        activity.type = 'typing';

        const result = ActivityEx.asTypingActivity(activity);

        assert.strictEqual(result.type, ActivityTypes.Typing);
    });

    it('should return null when Activity type is different than typing', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asTypingActivity(activity);

        assert.strictEqual(result, null);
    });

    it('should return Activity as End of Conversation activity', () => {
        const activity = CreateActivity();

        activity.type = 'endOfConversation';

        const result = ActivityEx.asEndOfConversationActivity(activity);

        assert.strictEqual(result.type, ActivityTypes.EndOfConversation);
    });

    it('should return null when Activity type is different than endOfConversation', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asEndOfConversationActivity(activity);

        assert.strictEqual(result, null);
    });

    it('should return Activity as Event activity', () => {
        const activity = CreateActivity();

        activity.type = 'event';

        const result = ActivityEx.asEventActivity(activity);

        assert.strictEqual(result.type, ActivityTypes.Event);
    });

    it('should return null when Activity type is different than event', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asEventActivity(activity);

        assert.strictEqual(result, null);
    });

    it('should return Activity as Invoke activity', () => {
        const activity = CreateActivity();

        activity.type = 'invoke';

        const result = ActivityEx.asInvokeActivity(activity);

        assert.strictEqual(result.type, ActivityTypes.Invoke);
    });

    it('should return null when Activity type is different than invoke', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asInvokeActivity(activity);

        assert.strictEqual(result, null);
    });

    it('should return Activity as Message Update activity', () => {
        const activity = CreateActivity();

        activity.type = 'messageUpdate';

        const result = ActivityEx.asMessageUpdateActivity(activity);

        assert.strictEqual(result.type, ActivityTypes.MessageUpdate);
    });

    it('should return null when Activity type is different than messageUpdate', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asMessageUpdateActivity(activity);

        assert.strictEqual(result, null);
    });

    it('should return Activity as Message Delete activity', () => {
        const activity = CreateActivity();

        activity.type = 'messageDelete';

        const result = ActivityEx.asMessageDeleteActivity(activity);

        assert.strictEqual(result.type, ActivityTypes.MessageDelete);
    });

    it('should return null when Activity type is different than messageDelete', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asMessageDeleteActivity(activity);

        assert.strictEqual(result, null);
    });

    it('should return Activity as Message Reaction activity', () => {
        const activity = CreateActivity();

        activity.type = 'messageReaction';

        const result = ActivityEx.asMessageReactionActivity(activity);

        assert.strictEqual(result.type, ActivityTypes.MessageReaction);
    });

    it('should return null when Activity type is different than messageReaction', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asMessageReactionActivity(activity);

        assert.strictEqual(result, null);
    });

    it('should return Activity as Suggestion activity', () => {
        const activity = CreateActivity();

        activity.type = 'suggestion';

        const result = ActivityEx.asSuggestionActivity(activity);

        assert.strictEqual(result.type, ActivityTypes.Suggestion);
    });

    it('should return null when Activity type is different than Suggestion', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asSuggestionActivity(activity);

        assert.strictEqual(result, null);
    });

    it('should return Activity as Trace activity', () => {
        const activity = CreateActivity();

        activity.type = 'trace';

        const result = ActivityEx.asTraceActivity(activity);

        assert.strictEqual(result.type, ActivityTypes.Trace);
    });

    it('should return null when Activity type is different than trace', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asTraceActivity(activity);

        assert.strictEqual(result, null);
    });

    it('should return Activity as Handoff activity', () => {
        const activity = CreateActivity();

        activity.type = 'handoff';

        const result = ActivityEx.asHandoffActivity(activity);

        assert.strictEqual(result.type, ActivityTypes.Handoff);
    });

    it('should return null when Activity type is different than Handoff', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asHandoffActivity(activity);

        assert.strictEqual(result, null);
    });

    it('should return false when Activity has no content', () => {
        const activity = CreateActivity();

        const result = ActivityEx.hasContent(activity);

        assert.strictEqual(result, false);
    });

    it('should return true when Activity text has content', () => {
        const activity = CreateActivity();

        activity.text = 'test-text';

        const result = ActivityEx.hasContent(activity);

        assert.strictEqual(result, true);
    });

    it('should return true when Activity summary has content', () => {
        const activity = CreateActivity();

        activity.text = undefined;
        activity.summary = 'test-summary';

        const result = ActivityEx.hasContent(activity);

        assert.strictEqual(result, true);
    });

    it('should return true when Activity attachments has content', () => {
        const activity = CreateActivity();

        activity.text = undefined;
        activity.summary = undefined;
        activity.attachments = [CreateAttachment()];

        const result = ActivityEx.hasContent(activity);

        assert.strictEqual(result, true);
    });

    it('should return true when Activity channelData has content', () => {
        const activiy = CreateActivity();

        activiy.text = undefined;
        activiy.summary = undefined;
        activiy.attachments = undefined;
        activiy.channelData = 'test-channelData';

        const result = ActivityEx.hasContent(activiy);

        assert.strictEqual(result, true);
    });

    it('should return Mentions array', () => {
        const mentions = [{type: 'mention'}, {type: 'reaction'}];
        const activity = CreateActivity();

        activity.entities = mentions

        const mentionsResult = ActivityEx.getMentions(activity);

        assert.strictEqual(mentionsResult.length, 1);
        assert.strictEqual(mentionsResult[0].type, "mention");
    });

    it('should get Conversation Reference', () => {
        const activity = CreateActivity();

        const conversationReference = ActivityEx.getConversationReference(activity)

        assert.strictEqual(activity.id, conversationReference.activityId);
        assert.strictEqual(activity.from.id, conversationReference.user.id);
        assert.strictEqual(activity.recipient.id, conversationReference.bot.id);
        assert.strictEqual(activity.conversation.id, conversationReference.conversation.id);
        assert.strictEqual(activity.channelId, conversationReference.channelId);
        assert.strictEqual(activity.locale, conversationReference.locale);
        assert.strictEqual(activity.serviceUrl, conversationReference.serviceUrl);
    });

    it('should get Reply Conversation Reference', () => {
        const activity = CreateActivity();

        const reply = {
            id: '1234'
        };

        const conversationReference = ActivityEx.getReplyConversationReference(activity, reply)

        assert.strictEqual(reply.id, conversationReference.activityId);
        assert.strictEqual(activity.from.id, conversationReference.user.id);
        assert.strictEqual(activity.recipient.id, conversationReference.bot.id);
        assert.strictEqual(activity.conversation.id, conversationReference.conversation.id);
        assert.strictEqual(activity.channelId, conversationReference.channelId);
        assert.strictEqual(activity.locale, conversationReference.locale);
        assert.strictEqual(activity.serviceUrl, conversationReference.serviceUrl);
    });

    it('should Apply Conversation Reference with IsIncomming true', () => {
        let activity = CreateActivity();

        const conversationReference = {
            channelId: 'cr_123',
            serviceUrl: "cr_serviceUrl",
            conversation: {
                id: "cr_456",
            },
            user: {
                id: "cr_abc",
            },
            bot: {
                id: "cr_def",
            },
            activityId: "cr_12345",
            locale: "en-uS" // Intentionally oddly-cased to check that it isn't defaulted somewhere, but tests stay in English
        }

        activity = ActivityEx.applyConversationReference(activity, conversationReference, true);

        assert.strictEqual(conversationReference.channelId, activity.channelId);
        assert.strictEqual(conversationReference.locale, activity.locale);
        assert.strictEqual(conversationReference.serviceUrl, activity.serviceUrl);
        assert.strictEqual(conversationReference.conversation.id, activity.conversation.id);
        assert.strictEqual(conversationReference.user.id, activity.from.id);
        assert.strictEqual(conversationReference.bot.id, activity.recipient.id);
        assert.strictEqual(conversationReference.activityId, activity.id);
    });

    it('should Apply Conversation Reference', () => {
        let activity = CreateActivity();

        const conversationReference = {
            channelId: '123',
            serviceUrl: "cserviceUrl",
            conversation: {
                id: "456",
            },
            user: {
                id: "abc",
            },
            bot: {
                id: "def",
            },
            activityId: "12345",
            locale: "en-uS" // Intentionally oddly-cased to check that it isn't defaulted somewhere, but tests stay in English
        }

        activity = ActivityEx.applyConversationReference(activity, conversationReference, false);

        assert.strictEqual(conversationReference.channelId, activity.channelId);
        assert.strictEqual(conversationReference.locale, activity.locale);
        assert.strictEqual(conversationReference.serviceUrl, activity.serviceUrl);
        assert.strictEqual(conversationReference.conversation.id, activity.conversation.id);
        assert.strictEqual(conversationReference.bot.id, activity.from.id);
        assert.strictEqual(conversationReference.user.id, activity.recipient.id);
        assert.strictEqual(conversationReference.activityId, activity.replyToId);
    });

    it('should Create Trace Allows Null Recipient', () => {
        const activity = CreateActivity();
        activity.recipient = null;
        const trace = ActivityEx.createTrace(activity, 'test');

        // CreateTrace flips Recipient and From
        assert.strictEqual(trace.from, null);
    });

    it('should Create Trace with all the arguments', () => {
        const activity = CreateActivity();
        const name = 'test-activity';
        const value = 'test-value';
        const valueType = 'string';
        const label = 'test-label'

        const trace = ActivityEx.createTrace(activity, name, value, valueType, label);

        assert.strictEqual(trace.type, ActivityTypes.Trace);
        assert.strictEqual(trace.name, name);
        assert.strictEqual(trace.value, value);
        assert.strictEqual(trace.valueType, valueType);
        assert.strictEqual(trace.label, label);
    });

    it('should be Is From Streaming Connection', () => {
        var nonStreaming = [
            "http://yayay.com",
            "https://yayay.com",
            "HTTP://yayay.com",
            "HTTPS://yayay.com",
        ];

        var streaming = [
            "urn:botframework:WebSocket:wss://beep.com",
            "urn:botframework:WebSocket:http://beep.com",
            "URN:botframework:WebSocket:wss://beep.com",
            "URN:botframework:WebSocket:http://beep.com",
        ];

        var activity = CreateActivity();

        activity.serviceUrl = undefined;
        assert.strictEqual(ActivityEx.isFromStreamingConnection(activity), false);

        nonStreaming.forEach(s =>
        {
            activity.serviceUrl = s;
            assert.strictEqual(ActivityEx.isFromStreamingConnection(activity), false);
        });

        streaming.forEach(s =>
        {
            activity.serviceUrl = s;
            assert.strictEqual(ActivityEx.isFromStreamingConnection(activity), true);
        });
    });
});

function CreateActivity() {
    const account1 = {
        id: "ChannelAccount_Id_1",
        name: "ChannelAccount_Name_1",
        role: "ChannelAccount_Role_1",
    };

    const account2 = {
        id: "ChannelAccount_Id_2",
        name: "ChannelAccount_Name_2",
        role: "ChannelAccount_Role_2",
    };

    const conversationAccount = {
        conversationType: "a",
        id: "123",
        isGroup: true,
        name: "Name",
        role: "ConversationAccount_Role",
    };

    return {
        id: "123",
        from: account1,
        recipient: account2,
        conversation: conversationAccount,
        channelId: "ChannelId123",
        locale: "en-uS", // Intentionally oddly-cased to check that it isn't defaulted somewhere, but tests stay in English
        serviceUrl: "ServiceUrl123",
    };

}

function CreateAttachment() {
    return {
        content: '{"Content":"test-content"}',
        contentType: 'application/json'
    };
}