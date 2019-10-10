/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const assert = require('assert');
var sinon = require('sinon');
const { teamsGetTeamId, teamsNotifyUser, teamsCreateConversation, BotFrameworkAdapter } = require('../');
const { TestAdapter, TurnContext, Conversations } = require('botbuilder-core');
const { ConnectorClient,  } = require('botframework-connector');


class TestContext extends TurnContext {
    constructor(request) {
        var adapter = new BotFrameworkAdapter();
        sinon.stub(adapter, 'createConnectorClient')
            .withArgs('http://foo.com/api/messages')
            .returns({ conversations: {
                createConversation: (parameters) => {
                    assert(parameters, `createConversation() not passed parameters.`);
                    const response =  {
                        id: 'MyCreationId',
                        serviceUrl: 'http://foo.com/api/messages',
                        activityId: 'MYACTIVITYID',
                    };
                    return response;
                }
            }});
        super(adapter, request);
        this.sent = [];
        this.onSendActivities((context, activities, next) => {
            this.sent = this.sent.concat(activities);
            context.responded = true;
        });
    }
}

describe('ActivityExtensions', function() {

    it('should get team id', async function() {
        const activity = createActivityTeamId();
        const id = teamsGetTeamId(activity);
        assert(id === 'myId');
    });
    it('should get null with no team id', async function() {
        const activity = createActivityNoId();
        const id = teamsGetTeamId(activity);
        assert(id === null);
    });
    it('should get null with no channelData', async function() {
        const activity = createActivityNoChannelData();
        const id = teamsGetTeamId(activity);
        assert(id === null);
    });
    it('should add notify with no notification in channelData', async function() {
        var activity = createActivityTeamId();
        teamsNotifyUser(activity);
        assert(activity.channelData.Notification.Alert === true);
    });
    it('should add notify with no channelData', async function() {
        var activity = createActivityNoChannelData();
        teamsNotifyUser(activity);
        assert(activity.channelData.Notification.Alert === true);
    });
    it('should error with no teamsChannelId', async function() {
        // Arrange
        const context = new TestContext(createActivityNoId());
        // Act
        await teamsCreateConversation(context, null, createActivityNoId()).catch((error) => {
            // Assert
            assert(error.message == 'Missing valid teamsChannelId argument');
        });
    });
    it('should error with no activity', async function() {
        // Arrange
        const context = new TestContext(createActivityNoId());
        // Act
        await teamsCreateConversation(context, "msteams", null).catch((error) => {
            // Assert
            assert(error.message == 'Missing valid message argument');
        });
    });
    it('should get results from teamsCreateConversation', async function() {
        // Arrange
        const context = new TestContext(createActivityNoId());

        // Act
        const result = await teamsCreateConversation(context, "mycrazyteamschannel", createActivityNoId());

        // Assert
        assert(result);
        assert(result.length == 2);
        assert(result[0]);
        assert(result[1]);
        assert(result[1] === "MYACTIVITYID");
        assert(result[0].activityId == 1);
        assert(result[0].conversation.id == 'MyCreationId');
        assert(result[0].channelId == 'teams');
    });
});



function createActivityNoId() {
    return {
        type: 'message',
        timestamp: Date.now,
        id: 1,
        text: "testMessage",
        channelId: 'teams',
        from: { id: `User1` },
        channelData: { team: 'myTeams'},
        conversation: { id: 'conversationId' },
        recipient: { id: 'Bot1', name: '2' },
        serviceUrl: 'http://foo.com/api/messages'
    };
}
function createActivityNoChannelData() {
	return {
		type: 'message',
		timestamp: Date.now,
		id: 1,
		text: "testMessage",
		channelId: 'teams',
        from: { id: `User1` },
		conversation: { id: 'conversationId' },
		recipient: { id: 'Bot1', name: '2' },
		serviceUrl: 'http://foo.com/api/messages'
	};
}

function createActivityTeamId() {
	return {
		type: 'message',
		timestamp: Date.now,
		id: 1,
		text: "testMessage",
		channelId: 'teams',
        from: { id: `User1` },
        channelData: { team: { id: 'myId'}},
		conversation: { id: 'conversationId' },
		recipient: { id: 'Bot1', name: '2' },
		serviceUrl: 'http://foo.com/api/messages'
	};
}
