/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const { strictEqual } = require('assert');
const { ActivityEx, ActivityTypes } = require('../');

describe(`activityValidator`, function() {

    it('should create a Message Activity', () => {
        const activity = ActivityEx.createMessageActivity();

        strictEqual(activity.type, ActivityTypes.Message);
    });

    it('should create a Contact Relation Update Activity', () => {
        const activity = ActivityEx.createContactRelationUpdateActivity();

        strictEqual(activity.type, ActivityTypes.ContactRelationUpdate);
    });

    it('should create a Conversation Update Activity', () => {
        const activity = ActivityEx.createConversationUpdateActivity();

        strictEqual(activity.type, ActivityTypes.ConversationUpdate);
    });

    it('should create a Typing Activity', () => {
        const activity = ActivityEx.createTypingActivity();

        strictEqual(activity.type, ActivityTypes.Typing);
    });

    it('should create a Handoff Activity', () => {
        const activity = ActivityEx.createHandoffActivity();

        strictEqual(activity.type, ActivityTypes.Handoff);
    });

    it('should create an End of Conversation Activity', () => {
        const activity = ActivityEx.createEndOfConversationActivity();

        strictEqual(activity.type, ActivityTypes.EndOfConversation);
    });

    it('should create an Event Activity', () => {
        const activity = ActivityEx.createEventActivity();

        strictEqual(activity.type, ActivityTypes.Event);
    });

    it('should create an Invoke Activity', () => {
        const activity = ActivityEx.createInvokeActivity();

        strictEqual(activity.type, ActivityTypes.Invoke);
    });

    it('should create a Trace Activity', () => {
        const name = 'test-activity';
        const valueType = 'string';
        const value = 'test-value';
        const label = 'test-label';

        const activity = ActivityEx.createTraceActivity(name, valueType, value, label);

        strictEqual(activity.type, ActivityTypes.Trace);
        strictEqual(activity.valueType, valueType);
        strictEqual(activity.value, value);
        strictEqual(activity.label, label);
    });

    it('should create a Trace Activity without valueType', () => {
        const name = 'test-activity';
        const value = 'test-value';
        const label = 'test-label';

        const activity = ActivityEx.createTraceActivity(name, undefined, value, label);

        strictEqual(activity.type, ActivityTypes.Trace);
        strictEqual(activity.valueType, typeof(value));
        strictEqual(activity.label, label);
    });

    it('should create a reply for the activity', () => {
        const activity = CreateActivity();

        const text = 'test reply';
        const locale = 'en-us';

        const reply = ActivityEx.createReply(activity, text, locale);

        strictEqual(reply.type, ActivityTypes.Message);
        strictEqual(reply.text, text);
        strictEqual(reply.locale, locale);
    });

    it('should create a reply without arguments for the activity', () => {
        const activity = CreateActivity();

        const reply = ActivityEx.createReply(activity);

        strictEqual(reply.type, ActivityTypes.Message);
        strictEqual(reply.text, "");
        strictEqual(reply.locale, activity.locale);
    });

    it('should return Activity as message activity', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asMessageActivity(activity);

        strictEqual(result.type, ActivityTypes.Message);
    });

    it('should return null when Activity type is different than Message', () => {
        const activity = CreateActivity();

        activity.type = 'trace';

        const result = ActivityEx.asMessageActivity(activity);

        strictEqual(result, null);
    });

    it('should return null when Activity type is null', () => {
        const activity = CreateActivity();

        activity.type = null;

        const result = ActivityEx.asMessageActivity(activity);

        strictEqual(result, null);
    });

    it('should return Activity as Contact Relation Update activity', () => {
        const activity = CreateActivity();

        activity.type = 'contactRelationUpdate';

        const result = ActivityEx.asContactRelationUpdateActivity(activity);

        strictEqual(result.type, ActivityTypes.ContactRelationUpdate);
    });

    it('should return null when Activity type is different than contactRelationUpdate', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asContactRelationUpdateActivity(activity);

        strictEqual(result, null);
    });

    it('should return Activity as Installation Update activity', () => {
        const activity = CreateActivity();

        activity.type = 'installationUpdate';

        const result = ActivityEx.asInstallationUpdateActivity(activity);

        strictEqual(result.type, ActivityTypes.InstallationUpdate);
    });

    it('should return null when Activity type is different than installationUpdate', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asInstallationUpdateActivity(activity);

        strictEqual(result, null);
    });

    it('should return Activity as Conversation Update activity', () => {
        const activity = CreateActivity();

        activity.type = 'conversationUpdate';

        const result = ActivityEx.asConversationUpdateActivity(activity);

        strictEqual(result.type, ActivityTypes.ConversationUpdate);
    });

    it('should return null when Activity type is different than conversationUpdate', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asConversationUpdateActivity(activity);

        strictEqual(result, null);
    });

    it('should return Activity as Typing activity', () => {
        const activity = CreateActivity();

        activity.type = 'typing';

        const result = ActivityEx.asTypingActivity(activity);

        strictEqual(result.type, ActivityTypes.Typing);
    });

    it('should return null when Activity type is different than typing', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asTypingActivity(activity);

        strictEqual(result, null);
    });

    it('should return Activity as End of Conversation activity', () => {
        const activity = CreateActivity();

        activity.type = 'endOfConversation';

        const result = ActivityEx.asEndOfConversationActivity(activity);

        strictEqual(result.type, ActivityTypes.EndOfConversation);
    });

    it('should return null when Activity type is different than endOfConversation', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asEndOfConversationActivity(activity);

        strictEqual(result, null);
    });

    it('should return Activity as Event activity', () => {
        const activity = CreateActivity();

        activity.type = 'event';

        const result = ActivityEx.asEventActivity(activity);

        strictEqual(result.type, ActivityTypes.Event);
    });

    it('should return null when Activity type is different than event', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asEventActivity(activity);

        strictEqual(result, null);
    });

    it('should return Activity as Invoke activity', () => {
        const activity = CreateActivity();

        activity.type = 'invoke';

        const result = ActivityEx.asInvokeActivity(activity);

        strictEqual(result.type, ActivityTypes.Invoke);
    });

    it('should return null when Activity type is different than invoke', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asInvokeActivity(activity);

        strictEqual(result, null);
    });

    it('should return Activity as Message Update activity', () => {
        const activity = CreateActivity();

        activity.type = 'messageUpdate';

        const result = ActivityEx.asMessageUpdateActivity(activity);

        strictEqual(result.type, ActivityTypes.MessageUpdate);
    });

    it('should return null when Activity type is different than messageUpdate', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asMessageUpdateActivity(activity);

        strictEqual(result, null);
    });

    it('should return Activity as Message Delete activity', () => {
        const activity = CreateActivity();

        activity.type = 'messageDelete';

        const result = ActivityEx.asMessageDeleteActivity(activity);

        strictEqual(result.type, ActivityTypes.MessageDelete);
    });

    it('should return null when Activity type is different than messageDelete', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asMessageDeleteActivity(activity);

        strictEqual(result, null);
    });

    it('should return Activity as Message Reaction activity', () => {
        const activity = CreateActivity();

        activity.type = 'messageReaction';

        const result = ActivityEx.asMessageReactionActivity(activity);

        strictEqual(result.type, ActivityTypes.MessageReaction);
    });

    it('should return null when Activity type is different than messageReaction', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asMessageReactionActivity(activity);

        strictEqual(result, null);
    });

    it('should return Activity as Suggestion activity', () => {
        const activity = CreateActivity();

        activity.type = 'suggestion';

        const result = ActivityEx.asSuggestionActivity(activity);

        strictEqual(result.type, ActivityTypes.Suggestion);
    });

    it('should return null when Activity type is different than Suggestion', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asSuggestionActivity(activity);

        strictEqual(result, null);
    });

    it('should return Activity as Trace activity', () => {
        const activity = CreateActivity();

        activity.type = 'trace';

        const result = ActivityEx.asTraceActivity(activity);

        strictEqual(result.type, ActivityTypes.Trace);
    });

    it('should return null when Activity type is different than trace', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asTraceActivity(activity);

        strictEqual(result, null);
    });

    it('should return Activity as Handoff activity', () => {
        const activity = CreateActivity();

        activity.type = 'handoff';

        const result = ActivityEx.asHandoffActivity(activity);

        strictEqual(result.type, ActivityTypes.Handoff);
    });

    it('should return null when Activity type is different than Handoff', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        const result = ActivityEx.asHandoffActivity(activity);

        strictEqual(result, null);
    });

    it('should return false when Activity has no content', () => {
        const activity = CreateActivity();

        const result = ActivityEx.hasContent(activity);

        strictEqual(result, false);
    });

    it('should return true when Activity text has content', () => {
        const activity = CreateActivity();

        activity.text = 'test-text';

        const result = ActivityEx.hasContent(activity);

        strictEqual(result, true);
    });

    it('should return true when Activity summary has content', () => {
        const activity = CreateActivity();

        activity.text = undefined;
        activity.summary = 'test-summary';

        const result = ActivityEx.hasContent(activity);

        strictEqual(result, true);
    });

    it('should return true when Activity attachments has content', () => {
        const activity = CreateActivity();

        activity.text = undefined;
        activity.summary = undefined;
        activity.attachments = [CreateAttachment()];

        const result = ActivityEx.hasContent(activity);

        strictEqual(result, true);
    });

    it('should return true when Activity channelData has content', () => {
        const activiy = CreateActivity();

        activiy.text = undefined;
        activiy.summary = undefined;
        activiy.attachments = undefined;
        activiy.channelData = 'test-channelData';

        const result = ActivityEx.hasContent(activiy);

        strictEqual(result, true);
    });

    it('should return Mentions array', () => {
        const mentions = [{type: 'mention'}, {type: 'reaction'}];
        const activity = CreateActivity();

        activity.entities = mentions

        const mentionsResult = ActivityEx.getMentions(activity);

        strictEqual(mentionsResult.length, 1);
        strictEqual(mentionsResult[0].type, "mention");
    });

    it('should get Conversation Reference', () => {
        const activity = CreateActivity();

        const conversationReference = ActivityEx.getConversationReference(activity)

        strictEqual(activity.id, conversationReference.activityId);
        strictEqual(activity.from.id, conversationReference.user.id);
        strictEqual(activity.recipient.id, conversationReference.bot.id);
        strictEqual(activity.conversation.id, conversationReference.conversation.id);
        strictEqual(activity.channelId, conversationReference.channelId);
        strictEqual(activity.locale, conversationReference.locale);
        strictEqual(activity.serviceUrl, conversationReference.serviceUrl);
    });

    it('should Create Trace Allows Null Recipient', () => {
        const activity = CreateActivity();
        activity.recipient = null;
        const trace = ActivityEx.createTrace(activity, 'test');

        // CreateTrace flips Recipient and From
        strictEqual(trace.from.id, null);
    });

    it('should Create Trace with all the arguments', () => {
        const activity = CreateActivity();
        const name = 'test-activity';
        const value = 'test-value';
        const valueType = 'string';
        const label = 'test-label'

        const trace = ActivityEx.createTrace(activity, name, value, valueType, label);

        strictEqual(trace.type, ActivityTypes.Trace);
        strictEqual(trace.name, name);
        strictEqual(trace.value, value);
        strictEqual(trace.valueType, valueType);
        strictEqual(trace.label, label);
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
        strictEqual(ActivityEx.isFromStreamingConnection(activity), false);

        nonStreaming.forEach(s =>
        {
            activity.serviceUrl = s;
            strictEqual(ActivityEx.isFromStreamingConnection(activity), false);
        });

        streaming.forEach(s =>
        {
            activity.serviceUrl = s;
            strictEqual(ActivityEx.isFromStreamingConnection(activity), true);
        });
    });

    it('should return false when activity.type is undefined', () => {
        const activity = CreateActivity();

        activity.type = undefined;

        strictEqual(ActivityEx.isActivity(activity, 'message'), false);
    });

    it('should return false when activity.type is not a string', () => {
        const activity = CreateActivity();

        activity.type = ['message'];

        strictEqual(ActivityEx.isActivity(activity, 'message'), false);
    });

    it('should return false when activity.type does not match expected value', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        strictEqual(ActivityEx.isActivity(activity, 'trace'), false);
    });

    it('should return true when activity.type matches expected value', () => {
        const activity = CreateActivity();

        activity.type = 'message';

        strictEqual(ActivityEx.isActivity(activity, 'message'), true);
    });

    it('should return true when activity.type matches with separator /', () => {
        const activity = CreateActivity();

        activity.type = 'message/';

        strictEqual(ActivityEx.isActivity(activity, 'message'), true);
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
