/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const assert = require('assert');
const { TurnContext } = require('botbuilder-core');
const sinon = require('sinon');

const {
    BotFrameworkAdapter,
    teamsCreateConversation,
    teamsGetChannelId,
    teamsGetTeamId,
    teamsNotifyUser,
    teamsSendToGeneralChannel
} = require('../');


class TestContext extends TurnContext {
    constructor(request) {
        const adapter = new BotFrameworkAdapter();
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

describe('TeamsActivityHelpers method', function() {
    describe('teamsGetChannelId()', () => {
        it('should return null if activity.channelData is falsey', () => {
            const channelId = teamsGetChannelId(createActivityNoChannelData());
            assert(channelId === null);
        });

        it('should return null if activity.channelData.channel is falsey', () => {
            const activity = createActivityTeamId();
            const channelId = teamsGetChannelId(activity);
            assert(channelId === null);
        });

        it('should return null if activity.channelData.channel.id is falsey', () => {
            const activity = createActivityTeamId();
            activity.channelData.channel = {};
            const channelId = teamsGetChannelId(activity);
            assert(channelId === null);
        });

        it('should return channel id', () => {
            const activity = createActivityTeamId();
            activity.channelData.channel = { id: 'channelId' };
            const channelId = teamsGetChannelId(activity);
            assert.strictEqual(channelId, 'channelId');
        });

        it('should throw an error if no activity is passed in', () => {
            try {
                teamsGetChannelId(undefined);
            } catch (err) {
                assert.strictEqual(err.message, 'Missing activity parameter');
            }
        });
    });

    describe('teamsGetTeamId()', () => {
        it('should return team id', async function() {
            const activity = createActivityTeamId();
            const id = teamsGetTeamId(activity);
            assert(id === 'myId');
        });

        it('should return null with no team id', async function() {
            const activity = createActivityNoTeamId();
            const id = teamsGetTeamId(activity);
            assert(id === null);
        });

        it('should return null with no channelData', async function() {
            const activity = createActivityNoChannelData();
            const id = teamsGetTeamId(activity);
            assert(id === null);
        });

        it('should throw an error if no activity is passed in', () => {
            try {
                teamsGetTeamId(undefined);
            } catch (err) {
                assert.strictEqual(err.message, 'Missing activity parameter');
            }
        });
    });

    describe('teamsNotifyUser()', () => {
        it('should add notify with no notification in channelData', async function() {
            const activity = createActivityTeamId();
            teamsNotifyUser(activity);
            assert(activity.channelData.notification.alert === true);
        });

        it('should add notify with no channelData', async function() {
            const activity = createActivityNoChannelData();
            teamsNotifyUser(activity);
            assert(activity.channelData.notification.alert === true);
        });

        it('should throw an error if no activity is passed in', () => {
            try {
                teamsNotifyUser(undefined);
            } catch (err) {
                assert.strictEqual(err.message, 'Missing activity parameter');
            }
        });
    });
});

describe('TeamsTurnContextHelpers method', () => {
    describe('teamsCreateConversation()', () => {
        it('should error with no teamsChannelId', function(done) {
            const context = new TestContext(createActivityNoTeamId());

            teamsCreateConversation(context, null, createActivityNoTeamId())
            .then(result => {
                done(new Error('teamsCreateConversation() should have thrown an error'));
            })
            .catch((error) => {
                assert.strictEqual(error.message, 'Missing valid teamsChannelId argument');
                done();
            });
        });

        it('should error with no activity', function(done) {
            const context = new TestContext(createActivityNoTeamId());

            teamsCreateConversation(context, 'msteams', null)
            .then(result => {
                done(new Error('teamsCreateConversation() should have thrown an error'));
            })
            .catch((error) => {
                assert.strictEqual(error.message, 'Missing valid message argument');
                done();
            });
        });

        it('should get results from teamsCreateConversation', async function() {
            const context = new TestContext(createActivityNoTeamId());
    
            const result = await teamsCreateConversation(context, 'mycrazyteamschannel', createActivityNoTeamId());
    
            assert(result);
            assert.strictEqual(result.length, 2);
            assert(result[0]);
            assert(result[1]);
            assert.strictEqual(result[1], 'MYACTIVITYID');
            assert.strictEqual(result[0].activityId, 1);
            assert.strictEqual(result[0].conversation.id, 'MyCreationId');
            assert.strictEqual(result[0].channelId, 'teams');
        });
    });

    describe('teamsSendToGeneralChannel()', () => {
        it('should error with no teamId', function(done) {
            const context = new TestContext(createActivityNoTeamId());

            teamsSendToGeneralChannel(context, null, createActivityNoTeamId())
            .then(result => {
                done(new Error('teamsSendToGeneralChannel() should have thrown an error'));
            })
            .catch(error => {
                assert.strictEqual(error.message, 'The current Activity was not sent from a Teams Team.');
                done();
            });
        });

        it('should error with no activity', async function() {
            const context = new TestContext(createActivityNoTeamId());

            await teamsSendToGeneralChannel(context, 'msteams', null).catch((error) => {
                assert.strictEqual(error.message, 'The current Activity was not sent from a Teams Team.');
            });
        });

        it('should get results', async function() {
            const context = new TestContext(createActivityTeamId());
    
            const result = await teamsSendToGeneralChannel(context, 'mycrazyteamschannel', createActivityTeamId());
    
            assert(result);
            assert.strictEqual(result.length, 2);
            assert(result[0]);
            assert(result[1]);
            assert.strictEqual(result[1], 'MYACTIVITYID');
            assert.strictEqual(result[0].activityId, 1);
            assert.strictEqual(result[0].conversation.id, 'MyCreationId');
            assert.strictEqual(result[0].channelId, 'teams');
        });
    });
})


function createActivityNoTeamId() {
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
