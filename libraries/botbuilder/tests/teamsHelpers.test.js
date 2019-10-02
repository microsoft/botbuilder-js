/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const assert = require('assert');
const { teamsGetTeamId, teamsNotifyUser, teamsSendToChannel, teamsSendToGeneralChannel } = require('../');
const { TestAdapter, TurnContext } = require('botbuilder-core');

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
    it('should send to channel', async function() {
		// Arrange
		var teamActivity = createActivityTeamId();
		var context = new TestContext(teamActivity);

		// Act
		var response = await teamsSendToChannel(context, "MySwitchedID", teamActivity);
		
		// Assert
		assert(context.sent.length == 1);
		assert(response == undefined);
		assert(context.sent[0].conversation.id == "MySwitchedID");
	});
    it('should send to general channel', async function() {
		// Arrange
		var teamActivity = createActivityTeamId();
		var context = new TestContext(teamActivity);

		// Act
		var response = await teamsSendToGeneralChannel(context, teamActivity);
		
		// Assert
		assert(context.sent.length == 1);
		assert(response == undefined);
		assert(context.sent[0].conversation.id == "myId");
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

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = [];
        this.onSendActivities((context, activities, next) => {
            this.sent = this.sent.concat(activities);
            context.responded = true;
        });
    }
}
