/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const assert = require('assert');
const { ActivityTypes } = require('../lib/index');
const { ActivityEx } = require('../lib/ActivityEx');

const testConversationReference = {
    activityId: 'test-id', 
    user: { id: 'user', name: 'User Name' },
    locale: 'en-us',
    bot: { id: 'bot', name: 'Bot Name' },
    conversation: { 
        id: 'convo1',
        properties: {
            'foo': 'bar'
        },
    },
    channelId: 'test-channel',
    serviceUrl: 'https://example.org/channel'
};

const testAttachment = {
    content: '{"Content":"test-content"}',
    contentType: 'application/json'
};

var testActivity = {
    id: '1234',
    name: 'test-activity',
    serviceUrl: 'https://example.org/channel'
};

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
        assert.strictEqual(activity.name, name);
    });

    it('should create a reply for the activity', () => {
        const text = 'test reply';
        const locale = 'en-us';
        const reply = ActivityEx.createReply(testActivity, text, locale);
        assert.strictEqual(reply.type, ActivityTypes.Message);
        assert.strictEqual(reply.text, text);
    });

    it('should create a trace activity for the source activity', () => {
        const name = 'test-activity';
        const valueType = 'string';
        const value = 'test-value';
        const label = 'test-label';
        const trace = ActivityEx.createTrace(testActivity, name, value, valueType, label);
        assert.strictEqual(trace.type, ActivityTypes.Trace);
        assert.strictEqual(trace.name, name);
    });

    it('should return activity as message activity', () => {
        testActivity.type = 'message';
        const activity = ActivityEx.asMessageActivity(testActivity);
        assert.strictEqual(activity.type, ActivityTypes.Message);
    });

    it('should return null when activity type is different than Message', () => {
        testActivity.type = 'trace';
        const activity = ActivityEx.asMessageActivity(testActivity);
        assert.strictEqual(activity, null);
    });

    it('should return activity as Contact Relation Update activity', () => {
        testActivity.type = 'contactRelationUpdate';
        const activity = ActivityEx.asContactRelationUpdateActivity(testActivity);
        assert.strictEqual(activity.type, ActivityTypes.ContactRelationUpdate);
    });

    it('should return null when activity type is different than contactRelationUpdate', () => {
        testActivity.type = 'message';
        const activity = ActivityEx.asContactRelationUpdateActivity(testActivity);
        assert.strictEqual(activity, null);
    });

    it('should return activity as Installation Update activity', () => {
        testActivity.type = 'installationUpdate';
        const activity = ActivityEx.asInstallationUpdateActivity(testActivity);
        assert.strictEqual(activity.type, ActivityTypes.InstallationUpdate);
    });

    it('should return null when activity type is different than installationUpdate', () => {
        testActivity.type = 'message';
        const activity = ActivityEx.asInstallationUpdateActivity(testActivity);
        assert.strictEqual(activity, null);
    });

    it('should return activity as Conversation Update activity', () => {
        testActivity.type = 'conversationUpdate';
        const activity = ActivityEx.asConversationUpdateActivity(testActivity);
        assert.strictEqual(activity.type, ActivityTypes.ConversationUpdate);
    });

    it('should return null when activity type is different than conversationUpdate', () => {
        testActivity.type = 'message';
        const activity = ActivityEx.asConversationUpdateActivity(testActivity);
        assert.strictEqual(activity, null);
    });

    it('should return activity as Typing activity', () => {
        testActivity.type = 'typing';
        const activity = ActivityEx.asTypingActivity(testActivity);
        assert.strictEqual(activity.type, ActivityTypes.Typing);
    });

    it('should return null when activity type is different than typing', () => {
        testActivity.type = 'message';
        const activity = ActivityEx.asTypingActivity(testActivity);
        assert.strictEqual(activity, null);
    });

    it('should return activity as End of Conversation activity', () => {
        testActivity.type = 'endOfConversation';
        const activity = ActivityEx.asEndOfConversationActivity(testActivity);
        assert.strictEqual(activity.type, ActivityTypes.EndOfConversation);
    });

    it('should return null when activity type is different than endOfConversation', () => {
        testActivity.type = 'message';
        const activity = ActivityEx.asEndOfConversationActivity(testActivity);
        assert.strictEqual(activity, null);
    });

    it('should return activity as Event activity', () => {
        testActivity.type = 'event';
        const activity = ActivityEx.asEventActivity(testActivity);
        assert.strictEqual(activity.type, ActivityTypes.Event);
    });

    it('should return null when activity type is different than event', () => {
        testActivity.type = 'message';
        const activity = ActivityEx.asEventActivity(testActivity);
        assert.strictEqual(activity, null);
    });

    it('should return activity as Invoke activity', () => {
        testActivity.type = 'invoke';
        const activity = ActivityEx.asInvokeActivity(testActivity);
        assert.strictEqual(activity.type, ActivityTypes.Invoke);
    });

    it('should return null when activity type is different than invoke', () => {
        testActivity.type = 'message';
        const activity = ActivityEx.asInvokeActivity(testActivity);
        assert.strictEqual(activity, null);
    });

    it('should return activity as Message Update activity', () => {
        testActivity.type = 'messageUpdate';
        const activity = ActivityEx.asMessageUpdateActivity(testActivity);
        assert.strictEqual(activity.type, ActivityTypes.MessageUpdate);
    });

    it('should return null when activity type is different than messageUpdate', () => {
        testActivity.type = 'message';
        const activity = ActivityEx.asMessageUpdateActivity(testActivity);
        assert.strictEqual(activity, null);
    });

    it('should return activity as Message Delete activity', () => {
        testActivity.type = 'messageDelete';
        const activity = ActivityEx.asMessageDeleteActivity(testActivity);
        assert.strictEqual(activity.type, ActivityTypes.MessageDelete);
    });

    it('should return null when activity type is different than messageDelete', () => {
        testActivity.type = 'message';
        const activity = ActivityEx.asMessageDeleteActivity(testActivity);
        assert.strictEqual(activity, null);
    });

    it('should return activity as Message Reaction activity', () => {
        testActivity.type = 'messageReaction';
        const activity = ActivityEx.asMessageReactionActivity(testActivity);
        assert.strictEqual(activity.type, ActivityTypes.MessageReaction);
    });

    it('should return null when activity type is different than messageReaction', () => {
        testActivity.type = 'message';
        const activity = ActivityEx.asMessageReactionActivity(testActivity);
        assert.strictEqual(activity, null);
    });

    it('should return activity as Suggestion activity', () => {
        testActivity.type = 'suggestion';
        const activity = ActivityEx.asSuggestionActivity(testActivity);
        assert.strictEqual(activity.type, ActivityTypes.Suggestion);
    });

    it('should return null when activity type is different than suggestion', () => {
        testActivity.type = 'message';
        const activity = ActivityEx.asSuggestionActivity(testActivity);
        assert.strictEqual(activity, null);
    });

    it('should return activity as Trace activity', () => {
        testActivity.type = 'trace';
        const activity = ActivityEx.asTraceActivity(testActivity);
        assert.strictEqual(activity.type, ActivityTypes.Trace);
    });

    it('should return null when activity type is different than trace', () => {
        testActivity.type = 'message';
        const activity = ActivityEx.asTraceActivity(testActivity);
        assert.strictEqual(activity, null);
    });

    it('should return activity as Handoff activity', () => {
        testActivity.type = 'handoff';
        const activity = ActivityEx.asHandoffActivity(testActivity);
        assert.strictEqual(activity.type, ActivityTypes.Handoff);
    });

    it('should return null when activity type is different than handoff', () => {
        testActivity.type = 'message';
        const activity = ActivityEx.asHandoffActivity(testActivity);
        assert.strictEqual(activity, null);
    });
    
    it('should return false when activity has no content', () => {
        const result = ActivityEx.hasContent(testActivity);
        assert.strictEqual(result, false);
    });

    it('should return true when activity text has content', () => {
        testActivity.text = 'test-text';
        const result = ActivityEx.hasContent(testActivity);
        assert.strictEqual(result, true);
    });

    it('should return true when activity summary has content', () => {
        testActivity.text = undefined;
        testActivity.summary = 'test-summary';
        const result = ActivityEx.hasContent(testActivity);
        assert.strictEqual(result, true);
    });

    it('should return true when activity attachments has content', () => {
        testActivity.text = undefined;
        testActivity.summary = undefined;
        testActivity.attachments = [testAttachment];
        const result = ActivityEx.hasContent(testActivity);
        assert.strictEqual(result, true);
    });

    it('should return true when activity ChannelData has content', () => {
        testActivity.text = undefined;
        testActivity.summary = undefined;
        testActivity.attachments = undefined;
        testActivity.channelData = 'test-channelData';
        const result = ActivityEx.hasContent(testActivity);
        assert.strictEqual(result, true);
    });

    it('should return mentions array', () => {
        const mentions = [{type: 'mention'}, {type: 'reaction'}];
        testActivity.entities = mentions
        const mentionsResult = ActivityEx.getMentions(testActivity);
        assert.strictEqual(mentionsResult.length, 1);
        assert.strictEqual(mentionsResult[0].type, "mention");
    });

    it('should return a Conversation Reference', () => {
        const reference = ActivityEx.getConversationReference(testActivity);
        assert.strictEqual(reference.activityId, testActivity.id);
    });

    it('should return a Conversation Reference with the reply', () => {
        const resourceResponse = { id: 'response-id' };
        const reference = ActivityEx.getReplyConversationReference(testActivity, resourceResponse);
        assert.strictEqual(reference.activityId, resourceResponse.id);
    });

    it('should apply a Conversation Reference in an incomming activity', () => {
        const activity = ActivityEx.applyConversationReference(testActivity, testConversationReference, true);
        assert.strictEqual(activity.channelId, testConversationReference.channelId);
        assert.strictEqual(activity.conversation, testConversationReference.conversation);
        assert.strictEqual(activity.from, testConversationReference.user);
    });

    it('should apply a Conversation Reference in an outgoing activity', () => {
        const activity = ActivityEx.applyConversationReference(testActivity, testConversationReference, false);
        assert.strictEqual(activity.channelId, testConversationReference.channelId);
        assert.strictEqual(activity.conversation, testConversationReference.conversation);
        assert.strictEqual(activity.from, testConversationReference.bot);
    });

    it('should return false with an activity sent via an Http/Https', () => {
        const result = ActivityEx.isFromStreamingConnection(testActivity);
        assert.strictEqual(result, false);
    });

    it('should return true with a streaming activity', () => {
        testActivity.serviceUrl = 'rtps://example.org/channel';
        const result = ActivityEx.isFromStreamingConnection(testActivity);
        assert.strictEqual(result, true);
    });

    it('should return false when serviceUrl is undefined', () => {
        testActivity.serviceUrl = undefined;
        const result = ActivityEx.isFromStreamingConnection(testActivity);
        assert.strictEqual(result, false);
    });

    it('should return false when activity type is null', () => {
        const activityType = 'message';
        testActivity.type = null;
        const result = ActivityEx.isActivity(testActivity, activityType);
        assert.strictEqual(result, false);
    });
});