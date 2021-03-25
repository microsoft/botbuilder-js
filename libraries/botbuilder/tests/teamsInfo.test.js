const assert = require('assert');
const nock = require('nock');
const sinon = require('sinon');
const { BotFrameworkAdapter, TeamsInfo } = require('../');
const { Conversations } = require('botframework-connector/lib/connectorApi/operations');
const { MicrosoftAppCredentials, ConnectorClient } = require('botframework-connector');
const { TurnContext, MessageFactory, ActionTypes } = require('botbuilder-core');

class TeamsInfoAdapter extends BotFrameworkAdapter {
    constructor() {
        super({ appId: 'appId', appPassword: 'appPassword' });
    }
}

class TestContext extends TurnContext {
    constructor(activity) {
        super(new TeamsInfoAdapter(), activity);
    }
}

const oneOnOneActivity = {
    text: 'Hello World!',
    type: 'message',
    id: 'oneOnOneActivityId',
    channelId: 'msteams',
    serviceUrl: 'https://smba.trafficmanager.net/amer/',
    from: {
        id: '29:User-One-Id',
        name: 'User One',
        aadObjectId: 'User-aadObjectId',
    },
    conversation: {
        conversationType: 'personal',
        tenantId: 'tenantId-Guid',
        id: 'a:oneOnOneConversationId',
    },
    recipient: {
        id: '28:teamsbot-Guid',
        name: 'Teams Bot',
    },
    channelData: {
        tenant: {
            id: 'tenantId-Guid',
        },
    },
};

const groupChatActivity = {
    text: '<at>Teams Bot</at> test\n',
    attachments: [
        {
            contentType: 'text/html',
            content:
                '<div><div><span itemscope="" itemtype="http://schema.skype.com/Mention" itemid="0">Teams Bot</span>&nbsp;test</div>\n</div>',
        },
    ],
    type: 'message',
    id: 'groupChatActivityId',
    channelId: 'msteams',
    serviceUrl: 'https://smba.trafficmanager.net/amer/',
    from: {
        id: '29:User-One-Id',
        name: 'User One',
        aadObjectId: 'User-aadObjectId',
    },
    conversation: {
        isGroup: true,
        conversationType: 'groupChat',
        tenantId: 'tenantId-Guid',
        id: '19:groupChatId@thread.v2',
    },
    recipient: {
        id: '28:teamsbot-Guid',
        name: 'Teams Bot',
    },
    entities: [
        {
            mentioned: {
                id: '28:teamsbot-Guid',
                name: 'Teams Bot',
            },
            text: '<at>Teams Bot</at>',
            type: 'mention',
        },
    ],
    channelData: {
        tenant: {
            id: 'tenantId-Guid',
        },
    },
};

const teamActivity = {
    text: '<at>Teams Bot</at> hi\n',
    attachments: [
        {
            contentType: 'text/html',
            content:
                '<div><div><span itemscope="" itemtype="http://schema.skype.com/Mention" itemid="0">Teams Bot</span>&nbsp;hi</div>\n</div>',
        },
    ],
    type: 'message',
    id: 'teamActivityId',
    channelId: 'msteams',
    serviceUrl: 'https://smba.trafficmanager.net/amer/',
    from: {
        id: '29:User-One-Id',
        name: 'User One',
        aadObjectId: 'User-aadObjectId',
    },
    conversation: {
        isGroup: true,
        conversationType: 'channel',
        tenantId: 'tenantId-Guid',
        id: '19:generalChannelIdgeneralChannelId@thread.skype;messageid=teamActivityId',
    },
    recipient: {
        id: '28:teamsbot-Guid',
        name: 'Teams Bot',
    },
    entities: [
        {
            mentioned: {
                id: '28:teamsbot-Guid',
                name: 'Teams Bot',
            },
            text: '<at>Teams Bot</at>',
            type: 'mention',
        },
    ],
    channelData: {
        teamsChannelId: '19:generalChannelIdgeneralChannelId@thread.skype',
        teamsTeamId: '19:generalChannelIdgeneralChannelId@thread.skype',
        channel: {
            id: '19:generalChannelIdgeneralChannelId@thread.skype',
        },
        meeting: {
            id: '19:meetingId',
        },
        team: {
            id: '19:generalChannelIdgeneralChannelId@thread.skype',
        },
        tenant: {
            id: 'tenantId-Guid',
        },
    },
};

describe('TeamsInfo', () => {
    beforeEach(() => {
        nock.cleanAll();
    });

    afterEach(() => {
        nock.cleanAll();
    });

    // Sets up nock expectation for an oauth token call, returning the expected auth header
    // and the nock expectation
    const nockOauth = () => {
        const tokenType = 'Bearer';
        const accessToken = 'access_token';

        const expectation = nock('https://login.microsoftonline.com')
            .post(/\/oauth2\/token/)
            .reply(200, { access_token: accessToken, token_type: tokenType });

        return { expectedAuthHeader: `${tokenType} ${accessToken}`, expectation };
    };

    describe('sendMessageToTeamsChannel()', () => {
        it('should work with correct information', async () => {
            const newConversation = [
                {
                    activityid: 'activityid123',
                },
                'resourceresponseid',
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchNewConversation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/conversations')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, { newConversation });

            const context = new TestContext(teamActivity);
            const msg = MessageFactory.text('test message');
            const teamChannelId = '19%3AgeneralChannelIdgeneralChannelId%40thread.skype';

            const response = await TeamsInfo.sendMessageToTeamsChannel(context, msg, teamChannelId);

            assert(fetchOauthToken.isDone());
            assert(fetchNewConversation.isDone());

            assert(Array.isArray(response));
            assert(newConversation[0]['activityid'] == 'activityid123');
            assert(newConversation[1] == 'resourceresponseid');
        });

        it('should error if context is null', async () => {
            try {
                await TeamsInfo.sendMessageToTeamsChannel(null, teamActivity, 'teamID');
                assert.fail('should have thrown');
            } catch (err) {
                assert(err.message === 'TurnContext cannot be null');
            }
        });

        it('should error if activity is null', async () => {
            const context = new TestContext(teamActivity);
            try {
                await TeamsInfo.sendMessageToTeamsChannel(context, null, 'teamID');
                assert.fail('should have thrown');
            } catch (err) {
                assert(err.message === 'Activity cannot be null');
            }
        });

        it('should error if teamID is a blank string', async () => {
            const context = new TestContext(teamActivity);
            try {
                await TeamsInfo.sendMessageToTeamsChannel(context, teamActivity, '');
                assert.fail('should have thrown');
            } catch (err) {
                assert(err.message === 'The teamsChannelId cannot be null or empty');
            }
        });

        it('should error if teamID is null', async () => {
            const context = new TestContext(teamActivity);
            try {
                await TeamsInfo.sendMessageToTeamsChannel(context, teamActivity, null);
                assert.fail('should have thrown');
            } catch (err) {
                assert(err.message === 'The teamsChannelId cannot be null or empty');
            }
        });
    });

    describe('getTeamChannels()', () => {
        it('should error in 1-on-1 chat', async () => {
            const context = new TestContext(oneOnOneActivity);
            try {
                await TeamsInfo.getTeamChannels(context);
                assert.fail('should have thrown');
            } catch (err) {
                assert(
                    err.message === 'This method is only valid within the scope of a MS Teams Team.',
                    `unexpected error.message received: ${err.message}`
                );
            }
        });

        it('should error in Group chat', async () => {
            const context = new TestContext(groupChatActivity);
            try {
                await TeamsInfo.getTeamChannels(context);
                assert.fail('should have thrown');
            } catch (err) {
                assert(
                    err.message === 'This method is only valid within the scope of a MS Teams Team.',
                    `unexpected error.message received: ${err.message}`
                );
            }
        });

        it('should work in a channel in a Team', async () => {
            // This is the property on the ConversationList that contains the information about the channels from Teams.
            const conversations = [
                {
                    id: '19:generalChannelIdgeneralChannelId@thread.skype',
                },
                {
                    id: '19:somechannelId2e5ab3df9ae9b594bdb@thread.skype',
                    name: 'Testing1',
                },
                {
                    id: '19:somechannelId388ade16aa4dd375e69@thread.skype',
                    name: 'Testing2',
                },
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/teams/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/conversations')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, { conversations });

            const context = new TestContext(teamActivity);
            const channels = await TeamsInfo.getTeamChannels(context);

            assert(fetchOauthToken.isDone());
            assert(fetchChannelListExpectation.isDone());

            assert(Array.isArray(channels));
            assert(channels.length === 3, `unexpected number of channels detected: ${channels.length}`);

            // There should be a channel in the conversations returned from the conversations
            assert(
                channels.find((channel) => channel.id === '19:generalChannelIdgeneralChannelId@thread.skype'),
                'did not find general channel/team id in response'
            );
        });

        it('should work with a teamId passed in', async () => {
            // This is the property on the ConversationList that contains the information about the channels from Teams.
            const conversations = [
                {
                    id: '19:ChannelIdgeneralChannelId@thread.skype',
                },
                {
                    id: '19:somechannelId2e5ab3df9ae9b594bdb@thread.skype',
                    name: 'Testing1',
                },
                {
                    id: '19:somechannelId388ade16aa4dd375e69@thread.skype',
                    name: 'Testing2',
                },
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/teams/19%3AChannelIdgeneralChannelId%40thread.skype/conversations')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, { conversations });

            const context = new TestContext(teamActivity);
            const channels = await TeamsInfo.getTeamChannels(context, '19:ChannelIdgeneralChannelId@thread.skype');

            assert(fetchOauthToken.isDone());
            assert(fetchChannelListExpectation.isDone());

            assert(Array.isArray(channels));
            assert(channels.length === 3, `unexpected number of channels detected: ${channels.length}`);

            // There should be a channel in the conversations returned from the conversations
            assert(
                channels.find((channel) => channel.id === '19:ChannelIdgeneralChannelId@thread.skype'),
                'did not find general channel/team id in response'
            );
        });
    });

    describe('getTeamDetails()', () => {
        it('should error in 1-on-1 chat', async () => {
            const context = new TestContext(oneOnOneActivity);
            try {
                await TeamsInfo.getTeamDetails(context);
                assert.fail('should have thrown');
            } catch (err) {
                assert(
                    err.message === 'This method is only valid within the scope of a MS Teams Team.',
                    `unexpected error.message received: ${err.message}`
                );
            }
        });

        it('should error in Group chat', async () => {
            const context = new TestContext(groupChatActivity);
            try {
                await TeamsInfo.getTeamDetails(context);
                assert.fail('should have thrown');
            } catch (err) {
                assert(
                    err.message === 'This method is only valid within the scope of a MS Teams Team.',
                    `unexpected error.message received: ${err.message}`
                );
            }
        });

        it('should work in a channel in a Team', async () => {
            const teamDetails = {
                id: '19:generalChannelIdgeneralChannelId@thread.skype',
                name: 'TeamName',
                aadGroupId: 'Team-aadGroupId',
            };

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchTeamDetailsExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/teams/19%3AgeneralChannelIdgeneralChannelId%40thread.skype')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, teamDetails);

            const context = new TestContext(teamActivity);
            const fetchedTeamDetails = await TeamsInfo.getTeamDetails(context);

            assert(fetchOauthToken.isDone());
            assert(fetchTeamDetailsExpectation.isDone());

            assert(fetchedTeamDetails, `teamDetails should not be falsey: ${teamDetails}`);
            assert(fetchedTeamDetails.id === '19:generalChannelIdgeneralChannelId@thread.skype');
            assert(fetchedTeamDetails.name === 'TeamName');
            assert(fetchedTeamDetails.aadGroupId === 'Team-aadGroupId');
        });

        it('should work with a teamId passed in', async () => {
            const teamDetails = {
                id: '19:ChannelIdgeneralChannelId@thread.skype',
                name: 'TeamName',
                aadGroupId: 'Team-aadGroupId',
            };

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchTeamDetailsExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/teams/19%3AChannelIdgeneralChannelId%40thread.skype')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, teamDetails);

            const context = new TestContext(teamActivity);
            const fetchedTeamDetails = await TeamsInfo.getTeamDetails(
                context,
                '19:ChannelIdgeneralChannelId@thread.skype'
            );

            assert(fetchOauthToken.isDone());
            assert(fetchTeamDetailsExpectation.isDone());

            assert(fetchedTeamDetails, `teamDetails should not be falsey: ${teamDetails}`);
            assert(fetchedTeamDetails.id === '19:ChannelIdgeneralChannelId@thread.skype');
            assert(fetchedTeamDetails.name === 'TeamName');
            assert(fetchedTeamDetails.aadGroupId === 'Team-aadGroupId');
        });
    });

    describe('getMembers()', () => {
        it('should work in 1-on-1 chat', async () => {
            const members = [
                {
                    id: '29:User-One-Id',
                    name: 'User One',
                    objectId: 'User-One-Object-Id',
                    givenName: 'User',
                    surname: 'One',
                    email: 'User.One@microsoft.com',
                    userPrincipalName: 'user1@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/a%3AoneOnOneConversationId/members')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, members);

            const context = new TestContext(oneOnOneActivity);
            const fetchedMembers = await TeamsInfo.getMembers(context);

            assert(fetchOauthToken.isDone());
            assert(fetchChannelListExpectation.isDone());

            assert.deepStrictEqual(
                fetchedMembers,
                members.map((member) => ({ ...member, aadObjectId: member.objectId }))
            );
        });

        it('should work in Group chat', async () => {
            const members = [
                {
                    id: '29:User-One-Id',
                    name: 'User One',
                    objectId: 'User-One-Object-Id',
                    givenName: 'User',
                    surname: 'One',
                    email: 'User.One@microsoft.com',
                    userPrincipalName: 'user1@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
                {
                    id: '29:User-Two-Id',
                    name: 'User Two',
                    objectId: 'User-Two-Object-Id',
                    givenName: 'User',
                    surname: 'Two',
                    email: 'User.Two@microsoft.com',
                    userPrincipalName: 'user2@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
                {
                    id: '29:User-Three-Id',
                    name: 'User Three',
                    objectId: 'User-Three-Object-Id',
                    givenName: 'User',
                    surname: 'Three',
                    email: 'User.Three@microsoft.com',
                    userPrincipalName: 'user3@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgroupChatId%40thread.v2/members')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, members);

            const context = new TestContext(groupChatActivity);
            const fetchedMembers = await TeamsInfo.getMembers(context);

            assert(fetchOauthToken.isDone());
            assert(fetchChannelListExpectation.isDone());

            assert.deepStrictEqual(
                fetchedMembers,
                members.map((member) => ({ ...member, aadObjectId: member.objectId }))
            );
        });

        it('should work in a channel in a Team', async () => {
            const members = [
                {
                    id: '29:User-Two-Id',
                    name: 'User Two',
                    objectId: 'User-Two-Object-Id',
                    givenName: 'User',
                    surname: 'Two',
                    email: 'User.Two@microsoft.com',
                    userPrincipalName: 'user2@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
                {
                    id: '29:User-One-Id',
                    name: 'User One',
                    objectId: 'User-One-Object-Id',
                    givenName: 'User',
                    surname: 'One',
                    email: 'User.One@microsoft.com',
                    userPrincipalName: 'user1@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/members')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, members);

            const context = new TestContext(teamActivity);
            const fetchedMembers = await TeamsInfo.getMembers(context);

            assert(fetchOauthToken.isDone());
            assert(fetchChannelListExpectation.isDone());

            assert.deepStrictEqual(
                fetchedMembers,
                members.map((member) => ({ ...member, aadObjectId: member.objectId }))
            );
        });

        it('should not work if conversationId is falsey', async () => {
            const context = new TestContext(oneOnOneActivity);
            context.activity.conversation.id = undefined;
            try {
                await TeamsInfo.getMembers(context);
                assert.fail('should have thrown');
            } catch (err) {
                assert.strictEqual(err.message, 'The getMembers operation needs a valid conversationId.');
                oneOnOneActivity.conversation.id = 'a:oneOnOneConversationId';
            }
        });
    });

    describe('getMember()', () => {
        it('should work without a Team', async () => {
            const member = {
                id: '29:User-One-Id',
                name: 'User One',
                aadObjectId: 'User-One-Object-Id',
                givenName: 'User',
                surname: 'One',
                email: 'User.One@microsoft.com',
                userPrincipalName: 'user1@microsoft.com',
                tenantId: 'tenantId-Guid',
            };

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/a%3AoneOnOneConversationId/members/29%3AUser-One-Id')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, member);

            const context = new TestContext(oneOnOneActivity);
            const fetchedMember = await TeamsInfo.getMember(context, oneOnOneActivity.from.id);

            assert(fetchOauthToken.isDone());
            assert(fetchExpectation.isDone());

            assert.deepStrictEqual(fetchedMember, member);
        });

        it('should work with a Team', async () => {
            const member = {
                id: '29:User-One-Id',
                name: 'User One',
                objectId: 'User-One-Object-Id',
                givenName: 'User',
                surname: 'One',
                email: 'User.One@microsoft.com',
                userPrincipalName: 'user1@microsoft.com',
                tenantId: 'tenantId-Guid',
            };

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/members/29%3AUser-One-Id')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, member);

            const context = new TestContext(teamActivity);
            const fetchedMember = await TeamsInfo.getMember(context, teamActivity.from.id);

            assert(fetchOauthToken.isDone());
            assert(fetchExpectation.isDone());

            assert.deepStrictEqual(fetchedMember, member);
        });
    });

    describe('getTeamMember()', () => {
        it('should throw error when teamId is not present', async () => {
            try {
                const context = new TestContext({ type: ActionTypes.message });
                await TeamsInfo.getTeamMember(context);
                assert.fail('should have thrown');
            } catch (err) {
                assert.strictEqual(err.message, 'This method is only valid within the scope of a MS Teams Team.');
            }
        });
    });

    describe('getMeetingParticipant', () => {
        const context = new TestContext(teamActivity);

        it('should work with correct arguments', async () => {
            const participant = {
                user: {
                    id: teamActivity.from.id,
                    name: teamActivity.from.name,
                    objectId: 'User-One-Object-Id',
                    givenName: 'User',
                    surname: 'One',
                    email: 'User.One@microsoft.com',
                    userPrincipalName: 'user1@microsoft.com',
                    tenantId: teamActivity.conversation.tenantId,
                },
                meeting: {
                    inMeeting: true,
                    role: 'Organizer',
                },
                conversation: {
                    id: teamActivity.conversation.id,
                },
            };

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v1/meetings/19%3AmeetingId/participants/User-aadObjectId?tenantId=tenantId-Guid')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, participant);

            const fetchedParticipant = await TeamsInfo.getMeetingParticipant(context);

            assert(fetchOauthToken.isDone());
            assert(fetchExpectation.isDone());

            assert.deepStrictEqual(fetchedParticipant, participant);
        });

        it('should throw error for missing context', async () => {
            try {
                await TeamsInfo.getMeetingParticipant();
                assert.fail('should have thrown');
            } catch (err) {
                assert(err);
            }
        });
    });

    describe('getTeamMembers()', () => {
        it('should error in 1-on-1 chat', async () => {
            const context = new TestContext(oneOnOneActivity);
            try {
                await TeamsInfo.getTeamMembers(context);
                assert.fail('should have thrown');
            } catch (err) {
                assert(
                    err.message === 'This method is only valid within the scope of a MS Teams Team.',
                    `unexpected error.message received: ${err.message}`
                );
            }
        });

        it('should error in Group chat', async () => {
            const context = new TestContext(groupChatActivity);
            try {
                await TeamsInfo.getTeamMembers(context);
                assert.fail('should have thrown');
            } catch (err) {
                assert(
                    err.message === 'This method is only valid within the scope of a MS Teams Team.',
                    `unexpected error.message received: ${err.message}`
                );
            }
        });

        it('should work in a channel in a Team', async () => {
            const members = [
                {
                    id: '29:User-Two-Id',
                    name: 'User Two',
                    objectId: 'User-Two-Object-Id',
                    givenName: 'User',
                    surname: 'Two',
                    email: 'User.Two@microsoft.com',
                    userPrincipalName: 'user2@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
                {
                    id: '29:User-One-Id',
                    name: 'User One',
                    objectId: 'User-One-Object-Id',
                    givenName: 'User',
                    surname: 'One',
                    email: 'User.One@microsoft.com',
                    userPrincipalName: 'user1@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/members')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, members);

            const context = new TestContext(teamActivity);
            const fetchedMembers = await TeamsInfo.getTeamMembers(context);

            assert(fetchOauthToken.isDone());
            assert(fetchChannelListExpectation.isDone());

            assert.deepStrictEqual(
                fetchedMembers,
                members.map((member) => ({ ...member, aadObjectId: member.objectId }))
            );
        });

        it('should work with a teamId passed in', async () => {
            const members = [
                {
                    id: '29:User-Two-Id',
                    name: 'User Two',
                    objectId: 'User-Two-Object-Id',
                    givenName: 'User',
                    surname: 'Two',
                    email: 'User.Two@microsoft.com',
                    userPrincipalName: 'user2@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
                {
                    id: '29:User-One-Id',
                    name: 'User One',
                    objectId: 'User-One-Object-Id',
                    givenName: 'User',
                    surname: 'One',
                    email: 'User.One@microsoft.com',
                    userPrincipalName: 'user1@microsoft.com',
                    tenantId: 'tenantId-Guid',
                },
            ];

            const { expectedAuthHeader, expectation: fetchOauthToken } = nockOauth();

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AChannelIdgeneralChannelId%40thread.skype/members')
                .matchHeader('Authorization', expectedAuthHeader)
                .reply(200, members);

            const context = new TestContext(teamActivity);
            const fetchedMembers = await TeamsInfo.getTeamMembers(context, '19:ChannelIdgeneralChannelId@thread.skype');

            assert(fetchOauthToken.isDone());
            assert(fetchChannelListExpectation.isDone());

            assert.deepStrictEqual(
                fetchedMembers,
                members.map((member) => ({ ...member, aadObjectId: member.objectId }))
            );
        });
    });

    describe('private methods', () => {
        describe('getConnectorClient()', () => {
            it(`should error if the context doesn't have an adapter`, function () {
                try {
                    TeamsInfo.getConnectorClient({});
                    assert.fail('should have thrown an error');
                } catch (err) {
                    assert.strictEqual(err.message, 'This method requires a connector client.');
                }
            });

            it(`should error if the adapter doesn't have a createConnectorClient method`, function () {
                try {
                    TeamsInfo.getConnectorClient({ adapter: {} });
                    assert.fail('should have thrown an error');
                } catch (err) {
                    assert.strictEqual(err.message, 'This method requires a connector client.');
                }
            });
        });

        describe('getMembersInternal()', () => {
            it(`should error if an invalid conversationId is passed in.`, async function () {
                try {
                    await TeamsInfo.getMembersInternal({}, undefined);
                    assert.fail('should have thrown');
                } catch (err) {
                    assert.strictEqual(err.message, 'The getMembers operation needs a valid conversationId.');
                }
            });

            it(`should error if an invalid conversationId is passed in.`, async function () {
                try {
                    await TeamsInfo.getMemberInternal({}, undefined);
                    assert.fail('should have thrown');
                } catch (err) {
                    assert.strictEqual(err.message, 'The getMember operation needs a valid conversationId.');
                }
            });

            it(`should error if an invalid userId is passed in.`, async () => {
                try {
                    await TeamsInfo.getMemberInternal({}, 'conversationId', undefined);
                    assert.fail('should have thrown');
                } catch (err) {
                    assert.strictEqual(err.message, 'The getMember operation needs a valid userId.');
                }
            });
        });

        describe('getPagedMembersInternal()', () => {
            let sandbox;
            beforeEach(() => {
                sandbox = sinon.createSandbox();
            });

            afterEach(() => {
                sandbox.restore();
            });

            it(`should error if an invalid conversationId is passed in.`, async () => {
                try {
                    await TeamsInfo.getPagedMembersInternal({}, undefined, 'options');
                    assert.fail('should have thrown');
                } catch (err) {
                    assert.strictEqual(err.message, 'The getPagedMembers operation needs a valid conversationId.');
                }
            });

            it(`should call connectorClient.conversations.getConversationPagedMembers()`, async function () {
                const members = [
                    {
                        id: '29:User-One-Id',
                        name: 'User One',
                        objectId: 'User-One-Object-Id',
                        givenName: 'User',
                        surname: 'One',
                        email: 'User.One@microsoft.com',
                        userPrincipalName: 'user1@microsoft.com',
                        tenantId: 'tenantId-Guid',
                    },
                    {
                        id: '29:User-Two-Id',
                        name: 'User Two',
                        objectId: 'User-Two-Object-Id',
                        givenName: 'User',
                        surname: 'Two',
                        email: 'User.Two@microsoft.com',
                        userPrincipalName: 'user2@microsoft.com',
                        tenantId: 'tenantId-Guid',
                    },
                ];
                const conversations = new Conversations({ id: 'convo1' });
                const getPagedMembers = sandbox.stub(conversations, 'getConversationPagedMembers');
                getPagedMembers.returns({ continuationToken: 'token', members: members });
                const connector = new ConnectorClient(new MicrosoftAppCredentials('', ''));
                connector.conversations = conversations;

                await TeamsInfo.getPagedMembersInternal(connector, 'convo1');

                assert.strictEqual(
                    getPagedMembers.calledOnce,
                    true,
                    `should have called conversations.getConversationPagedMembers`
                );
            });
        });

        describe('getTeamId()', () => {
            it(`should error if an invalid context is passed in.`, async () => {
                try {
                    await TeamsInfo.getTeamId(undefined);
                    assert.fail('should have thrown');
                } catch (err) {
                    assert.strictEqual(err.message, 'Missing context parameter');
                }
            });

            it(`should error if an invalid activity is passed in.`, async () => {
                try {
                    await TeamsInfo.getTeamId({ activity: undefined });
                    assert.fail('should have thrown');
                } catch (err) {
                    assert.strictEqual(err.message, 'Missing activity on context');
                }
            });
        });
    });
});
