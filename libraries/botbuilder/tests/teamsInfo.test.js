const assert = require('assert');
const nock = require('nock');
const { TurnContext, MessageFactory } = require('botbuilder-core');
const { BotFrameworkAdapter, TeamsInfo } = require('../');

beforeEach(function (done) {
    nock.cleanAll();
    done();
});

afterEach(function (done) {
    nock.cleanAll();
    done();
});

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

describe('TeamsInfo', () => {
    describe('sendMessageToTeamsChannel()', () => {
        it('should work with correct information', async() => {
            const newConversation = [
                {
                    "activityid": "activityid123",
                },
                "resourceresponseid"
            ];

            const fetchNewConversation = nock('https://smba.trafficmanager.net/amer')
                .post('/v3/conversations')
                .reply(200, { newConversation });

            const context = new TestContext(teamActivity);
            const msg = MessageFactory.text("test message");
            const teamChannelId = "19%3AgeneralChannelIdgeneralChannelId%40thread.skype";

            const response = await TeamsInfo.sendMessageToTeamsChannel(context,msg, teamChannelId);
            assert(fetchNewConversation.isDone());
            assert(Array.isArray(response));
            assert(newConversation[0]["activityid"] == "activityid123");
            assert(newConversation[1] == "resourceresponseid");
        });

        it('should error if context is null', async () => {
            try {
                await TeamsInfo.sendMessageToTeamsChannel(null, teamActivity, "teamID");
            } catch (err){
                assert(err.message === 'TurnContext cannot be null');
            }
        });

        it('should error if activity is null', async () => {
            const context = new TestContext(teamActivity);
            try {
                await TeamsInfo.sendMessageToTeamsChannel(context, null, "teamID");
            } catch (err){
                assert(err.message === 'Activity cannot be null');
            }
        });

        it('should error if teamID is a blank string', async () => {
            const context = new TestContext(teamActivity);
            try {
                await TeamsInfo.sendMessageToTeamsChannel(context, teamActivity, "");
            } catch (err){
                assert(err.message === 'The teamsChannelId cannot be null or empty');
            }
        });

        it('should error if teamID is null', async () => {
            const context = new TestContext(teamActivity);
            try {
                await TeamsInfo.sendMessageToTeamsChannel(context, teamActivity, null);
            } catch (err){
                assert(err.message === 'The teamsChannelId cannot be null or empty');
            }
        });
    });

    describe('getTeamChannels()', () => {
        it('should error in 1-on-1 chat', async () => {
            const context = new TestContext(oneOnOneActivity);
            try {
                await TeamsInfo.getTeamChannels(context);
            } catch (err) {
                assert(err.message === 'This method is only valid within the scope of a MS Teams Team.', `unexpected error.message received: ${err.message}`);
            }
        });

        it('should error in Group chat', async () => {
            const context = new TestContext(groupChatActivity);
            try {
                await TeamsInfo.getTeamChannels(context);
            } catch (err) {
                assert(err.message === 'This method is only valid within the scope of a MS Teams Team.', `unexpected error.message received: ${err.message}`);
            }
        });

        it('should work in a channel in a Team', async () => {
            // This is the property on the ConversationList that contains the information about the channels from Teams.
            const conversations = [
                {
                    "id": "19:generalChannelIdgeneralChannelId@thread.skype"
                },
                {
                    "id": "19:somechannelId2e5ab3df9ae9b594bdb@thread.skype",
                    "name": "Testing1"
                },
                {
                    "id": "19:somechannelId388ade16aa4dd375e69@thread.skype",
                    "name": "Testing2"
                }
            ];

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/teams/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/conversations')
                .reply(200, { conversations });

            const context = new TestContext(teamActivity);
            const channels = await TeamsInfo.getTeamChannels(context);
            assert(fetchChannelListExpectation.isDone());
            assert(Array.isArray(channels));
            assert(channels.length === 3, `unexpected number of channels detected: ${ channels.length }`);
            
            // There should be a channel in the conversations returned from the conversations
            let generalChannelExists;
            for(const channel of channels) {
                if (channel.id === '19:generalChannelIdgeneralChannelId@thread.skype') {
                    generalChannelExists = true;
                }
            };
            assert(generalChannelExists, 'did not find general channel/team id in response');
        });

        it('should work with a teamId passed in', async () => {
            // This is the property on the ConversationList that contains the information about the channels from Teams.
            const conversations = [
                {
                    "id": "19:ChannelIdgeneralChannelId@thread.skype"
                },
                {
                    "id": "19:somechannelId2e5ab3df9ae9b594bdb@thread.skype",
                    "name": "Testing1"
                },
                {
                    "id": "19:somechannelId388ade16aa4dd375e69@thread.skype",
                    "name": "Testing2"
                }
            ];

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/teams/19%3AChannelIdgeneralChannelId%40thread.skype/conversations')
                .reply(200, { conversations });

            const context = new TestContext(teamActivity);
            const channels = await TeamsInfo.getTeamChannels(context, '19:ChannelIdgeneralChannelId@thread.skype');
            assert(fetchChannelListExpectation.isDone());
            assert(Array.isArray(channels));
            assert(channels.length === 3, `unexpected number of channels detected: ${ channels.length }`);
            
            // There should be a channel in the conversations returned from the conversations
            let generalChannelExists;
            for(const channel of channels) {
                if (channel.id === '19:ChannelIdgeneralChannelId@thread.skype') {
                    generalChannelExists = true;
                }
            };
            assert(generalChannelExists, 'did not find general channel/team id in response');
        });
    });

    describe('getTeamDetails()', () => {
        it('should error in 1-on-1 chat', async () => {
            const context = new TestContext(oneOnOneActivity);
            try {
                await TeamsInfo.getTeamDetails(context);
            } catch (err) {
                assert(err.message === 'This method is only valid within the scope of a MS Teams Team.', `unexpected error.message received: ${err.message}`);
            }
        });

        it('should error in Group chat', async () => {
            const context = new TestContext(groupChatActivity);
            try {
                await TeamsInfo.getTeamDetails(context);
            } catch (err) {
                assert(err.message === 'This method is only valid within the scope of a MS Teams Team.', `unexpected error.message received: ${err.message}`);
            }
        });

        it('should work in a channel in a Team', async () => {
            const teamDetails = {
                "id": "19:generalChannelIdgeneralChannelId@thread.skype",
                "name": "TeamName",
                "aadGroupId": "Team-aadGroupId"
            };
            const fetchTeamDetailsExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/teams/19%3AgeneralChannelIdgeneralChannelId%40thread.skype')
                .reply(200, teamDetails);

            const context = new TestContext(teamActivity);
            const fetchedTeamDetails = await TeamsInfo.getTeamDetails(context);
            assert(fetchTeamDetailsExpectation.isDone());
            assert(fetchedTeamDetails, `teamDetails should not be falsey: ${ teamDetails }`);
            assert(fetchedTeamDetails.id === '19:generalChannelIdgeneralChannelId@thread.skype');
            assert(fetchedTeamDetails.name === 'TeamName');
            assert(fetchedTeamDetails.aadGroupId === 'Team-aadGroupId');
        });

        it('should work with a teamId passed in', async () => {
            const teamDetails = {
                "id": "19:ChannelIdgeneralChannelId@thread.skype",
                "name": "TeamName",
                "aadGroupId": "Team-aadGroupId"
            };
            const fetchTeamDetailsExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/teams/19%3AChannelIdgeneralChannelId%40thread.skype')
                .reply(200, teamDetails);

            const context = new TestContext(teamActivity);
            const fetchedTeamDetails = await TeamsInfo.getTeamDetails(context, '19:ChannelIdgeneralChannelId@thread.skype');
            assert(fetchTeamDetailsExpectation.isDone());
            assert(fetchedTeamDetails, `teamDetails should not be falsey: ${ teamDetails }`);
            assert(fetchedTeamDetails.id === '19:ChannelIdgeneralChannelId@thread.skype');
            assert(fetchedTeamDetails.name === 'TeamName');
            assert(fetchedTeamDetails.aadGroupId === 'Team-aadGroupId');
        });
    });

    describe('getMembers()', () => {
        function assertMemberInfo(results, mockedData) {
            assert(results && Array.isArray(results), `unexpected type for results arg: "${ typeof results }"`);
            assert(mockedData && Array.isArray(mockedData), `unexpected type for mockedData arg: "${ typeof mockedData }"`);
            assert.strictEqual(results.length, mockedData.length);

            for(let i = 0; i < results.length; i++) {
                assert.strictEqual(results[i].id, mockedData[i].id);
                assert.strictEqual(results[i].name, mockedData[i].name);
                assert.strictEqual(results[i].aadObjectId, mockedData[i].objectId);
                assert.strictEqual(results[i].givenName, mockedData[i].givenName);
                assert.strictEqual(results[i].surname, mockedData[i].surname);
                assert.strictEqual(results[i].email, mockedData[i].email);
                assert.strictEqual(results[i].userPrincipalName, mockedData[i].userPrincipalName);
                assert.strictEqual(results[i].tenantId, mockedData[i].tenantId);
            };
        }

        it('should work in 1-on-1 chat', async () => {
            const members = [
                {
                    "id": "29:User-One-Id",
                    "name": "User One",
                    "objectId": "User-One-Object-Id",
                    "givenName": "User",
                    "surname": "One",
                    "email": "User.One@microsoft.com",
                    "userPrincipalName": "user1@microsoft.com",
                    "tenantId": "tenantId-Guid"
                }
            ];

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/a%3AoneOnOneConversationId/members')
                .reply(200, members);

            const context = new TestContext(oneOnOneActivity);
            const fetchedMembers = await TeamsInfo.getMembers(context);
            assert(fetchChannelListExpectation.isDone());
            assertMemberInfo(fetchedMembers, members);
        });

        it('should work in Group chat', async () => {
            const members = [
                {
                    "id": "29:User-One-Id",
                    "name": "User One",
                    "objectId": "User-One-Object-Id",
                    "givenName": "User",
                    "surname": "One",
                    "email": "User.One@microsoft.com",
                    "userPrincipalName": "user1@microsoft.com",
                    "tenantId": "tenantId-Guid"
                },
                {
                    "id": "29:User-Two-Id",
                    "name": "User Two",
                    "objectId": "User-Two-Object-Id",
                    "givenName": "User",
                    "surname": "Two",
                    "email": "User.Two@microsoft.com",
                    "userPrincipalName": "user2@microsoft.com",
                    "tenantId": "tenantId-Guid"
                },
                {
                    "id": "29:User-Three-Id",
                    "name": "User Three",
                    "objectId": "User-Three-Object-Id",
                    "givenName": "User",
                    "surname": "Three",
                    "email": "User.Three@microsoft.com",
                    "userPrincipalName": "user3@microsoft.com",
                    "tenantId": "tenantId-Guid"
                }
            ];

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgroupChatId%40thread.v2/members')
                .reply(200, members);

            const context = new TestContext(groupChatActivity);
            const fetchedMembers = await TeamsInfo.getMembers(context);
            assert(fetchChannelListExpectation.isDone());
            assertMemberInfo(fetchedMembers, members);
        });

        it('should work in a channel in a Team', async () => {
            const members = [
                {
                    "id": "29:User-Two-Id",
                    "name": "User Two",
                    "objectId": "User-Two-Object-Id",
                    "givenName": "User",
                    "surname": "Two",
                    "email": "User.Two@microsoft.com",
                    "userPrincipalName": "user2@microsoft.com",
                    "tenantId": "tenantId-Guid"
                },
                {
                    "id": "29:User-One-Id",
                    "name": "User One",
                    "objectId": "User-One-Object-Id",
                    "givenName": "User",
                    "surname": "One",
                    "email": "User.One@microsoft.com",
                    "userPrincipalName": "user1@microsoft.com",
                    "tenantId": "tenantId-Guid"
                }
            ];

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/members')
                .reply(200, members);

            const context = new TestContext(teamActivity);
            const fetchedMembers = await TeamsInfo.getMembers(context);
            assert(fetchChannelListExpectation.isDone());
            assertMemberInfo(fetchedMembers, members);
        });

        it('should not work if conversationId is falsey', async () => {
            const context = new TestContext(oneOnOneActivity);
            context.activity.conversation.id = undefined;
            try {
                await TeamsInfo.getMembers(context);
                throw new Error('should have thrown an error');
            } catch (err) {
                assert.strictEqual(err.message, 'The getMembers operation needs a valid conversationId.');
                oneOnOneActivity.conversation.id = 'a:oneOnOneConversationId';
            }
        });
    });

    describe('getMember()', () => {
        function assertMemberInfo(result, mockedData) {
            assert(result, `unexpected type for result arg: "${ typeof results }"`);
            assert(mockedData, `unexpected type for mockedData arg: "${ typeof mockedData }"`);

            assert.strictEqual(result.id, mockedData.id);
            assert.strictEqual(result.name, mockedData.name);
            assert.strictEqual(result.aadObjectId, mockedData.aadObjectId);
            assert.strictEqual(result.givenName, mockedData.givenName);
            assert.strictEqual(result.surname, mockedData.surname);
            assert.strictEqual(result.email, mockedData.email);
            assert.strictEqual(result.userPrincipalName, mockedData.userPrincipalName);
            assert.strictEqual(result.tenantId, mockedData.tenantId);
        }

        it('should work without a Team', async () => {
            const member =
                {
                    "id": "29:User-One-Id",
                    "name": "User One",
                    "aadObjectId": "User-One-Object-Id",
                    "givenName": "User",
                    "surname": "One",
                    "email": "User.One@microsoft.com",
                    "userPrincipalName": "user1@microsoft.com",
                    "tenantId": "tenantId-Guid"
                };

            const fetchExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/a%3AoneOnOneConversationId/members/29%3AUser-One-Id')
                .reply(200, member);

            const context = new TestContext(oneOnOneActivity);
            const fetchedMember = await TeamsInfo.getMember(context, oneOnOneActivity.from.id );
            assert(fetchExpectation.isDone());
            assertMemberInfo(fetchedMember, member);
        });

        it('should work with a Team', async () => {
            const members =
                {
                    "id": "29:User-One-Id",
                    "name": "User One",
                    "objectId": "User-One-Object-Id",
                    "givenName": "User",
                    "surname": "One",
                    "email": "User.One@microsoft.com",
                    "userPrincipalName": "user1@microsoft.com",
                    "tenantId": "tenantId-Guid"
                }

            const fetchExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/members/29%3AUser-One-Id')
                .reply(200, members);

            const context = new TestContext(teamActivity);
            const fetchedMembers = await TeamsInfo.getMember(context, teamActivity.from.id);
            assert(fetchExpectation.isDone());
            assertMemberInfo(fetchedMembers, members);
        });

    });

    describe('getTeamMembers()', () => {
        function assertMemberInfo(results, mockedData) {
            assert(results && Array.isArray(results), `unexpected type for results arg: "${ typeof results }"`);
            assert(mockedData && Array.isArray(mockedData), `unexpected type for mockedData arg: "${ typeof mockedData }"`);
            assert.strictEqual(results.length, mockedData.length);

            for(let i = 0; i < results.length; i++) {
                assert.strictEqual(results[i].id, mockedData[i].id);
                assert.strictEqual(results[i].name, mockedData[i].name);
                assert.strictEqual(results[i].aadObjectId, mockedData[i].objectId);
                assert.strictEqual(results[i].givenName, mockedData[i].givenName);
                assert.strictEqual(results[i].surname, mockedData[i].surname);
                assert.strictEqual(results[i].email, mockedData[i].email);
                assert.strictEqual(results[i].userPrincipalName, mockedData[i].userPrincipalName);
                assert.strictEqual(results[i].tenantId, mockedData[i].tenantId);
            };
        }

        it('should error in 1-on-1 chat', async () => {
            const context = new TestContext(oneOnOneActivity);
            try {
                await TeamsInfo.getTeamMembers(context);
            } catch (err) {
                assert(err.message === 'This method is only valid within the scope of a MS Teams Team.', `unexpected error.message received: ${err.message}`);
            }
        });

        it('should error in Group chat', async () => {
            const context = new TestContext(groupChatActivity);
            try {
                await TeamsInfo.getTeamMembers(context);
            } catch (err) {
                assert(err.message === 'This method is only valid within the scope of a MS Teams Team.', `unexpected error.message received: ${err.message}`);
            }
        });

        it('should work in a channel in a Team', async () => {
            const members = [
                {
                    "id": "29:User-Two-Id",
                    "name": "User Two",
                    "objectId": "User-Two-Object-Id",
                    "givenName": "User",
                    "surname": "Two",
                    "email": "User.Two@microsoft.com",
                    "userPrincipalName": "user2@microsoft.com",
                    "tenantId": "tenantId-Guid"
                },
                {
                    "id": "29:User-One-Id",
                    "name": "User One",
                    "objectId": "User-One-Object-Id",
                    "givenName": "User",
                    "surname": "One",
                    "email": "User.One@microsoft.com",
                    "userPrincipalName": "user1@microsoft.com",
                    "tenantId": "tenantId-Guid"
                }
            ];

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AgeneralChannelIdgeneralChannelId%40thread.skype/members')
                .reply(200, members);

            const context = new TestContext(teamActivity);
            const fetchedMembers = await TeamsInfo.getTeamMembers(context);
            assert(fetchChannelListExpectation.isDone());
            assertMemberInfo(fetchedMembers, members);
        });

        it('should work with a teamId passed in', async () => {
            const members = [
                {
                    "id": "29:User-Two-Id",
                    "name": "User Two",
                    "objectId": "User-Two-Object-Id",
                    "givenName": "User",
                    "surname": "Two",
                    "email": "User.Two@microsoft.com",
                    "userPrincipalName": "user2@microsoft.com",
                    "tenantId": "tenantId-Guid"
                },
                {
                    "id": "29:User-One-Id",
                    "name": "User One",
                    "objectId": "User-One-Object-Id",
                    "givenName": "User",
                    "surname": "One",
                    "email": "User.One@microsoft.com",
                    "userPrincipalName": "user1@microsoft.com",
                    "tenantId": "tenantId-Guid"
                }
            ];

            const fetchChannelListExpectation = nock('https://smba.trafficmanager.net/amer')
                .get('/v3/conversations/19%3AChannelIdgeneralChannelId%40thread.skype/members')
                .reply(200, members);

            const context = new TestContext(teamActivity);
            const fetchedMembers = await TeamsInfo.getTeamMembers(context, '19:ChannelIdgeneralChannelId@thread.skype');
            assert(fetchChannelListExpectation.isDone());
            assertMemberInfo(fetchedMembers, members);
        });
    });

    describe('private methods', () => {
        it(`getConnectorClient() should error if the context doesn't have an adapter`, done => {
            try {
                TeamsInfo.getConnectorClient({});
                done(new Error('should have thrown an error'));
            } catch (err) {
                assert.strictEqual(err.message, 'This method requires a connector client.');
                done();
            }
        });

        it(`getConnectorClient() should error if the adapter doesn't have a createConnectorClient method`, done => {
            try {
                TeamsInfo.getConnectorClient({ adapter: {} });
                done(new Error('should have thrown an error'));
            } catch (err) {
                assert.strictEqual(err.message, 'This method requires a connector client.');
                done();
            }
        });

        it(`getMembersInternal() should error if an invalid conversationId is passed in.`, async () => {
            try {
                const results = await TeamsInfo.getMembersInternal({}, undefined);
                console.error(results)
                throw new Error('should have thrown an error');
            } catch (err) {
                assert.strictEqual(err.message, 'The getMembers operation needs a valid conversationId.');
            }
        });
    });
});

const oneOnOneActivity = {
    'text': 'Hello World!',
    'type': 'message',
    'id': 'oneOnOneActivityId',
    'channelId': 'msteams',
    'serviceUrl': 'https://smba.trafficmanager.net/amer/',
    'from': {
        'id': '29:User-One-Id',
        'name': 'User One',
        'aadObjectId': 'User-aadObjectId'
    },
    'conversation': {
        'conversationType': 'personal',
        'tenantId': 'tenantId-Guid',
        'id': 'a:oneOnOneConversationId'
    },
    'recipient': {
        'id': '28:teamsbot-Guid',
        'name': 'Teams Bot'
    },
    'channelData': {
        'tenant': {
            'id': 'tenantId-Guid'
        }
    }
};

const groupChatActivity = {
    "text": "<at>Teams Bot</at> test\n",
    "attachments": [
        {
            "contentType": "text/html",
            "content": "<div><div><span itemscope=\"\" itemtype=\"http://schema.skype.com/Mention\" itemid=\"0\">Teams Bot</span>&nbsp;test</div>\n</div>"
        }
    ],
    "type": "message",
    "id": "groupChatActivityId",
    "channelId": "msteams",
    "serviceUrl": "https://smba.trafficmanager.net/amer/",
    "from": {
        "id": "29:User-One-Id",
        "name": "User One",
        "aadObjectId": "User-aadObjectId"
    },
    "conversation": {
        "isGroup": true,
        "conversationType": "groupChat",
        "tenantId": "tenantId-Guid",
        "id": "19:groupChatId@thread.v2"
    },
    "recipient": {
        "id": "28:teamsbot-Guid",
        "name": "Teams Bot"
    },
    "entities": [
        {
            "mentioned": {
                "id": "28:teamsbot-Guid",
                "name": "Teams Bot"
            },
            "text": "<at>Teams Bot</at>",
            "type": "mention"
        }
    ],
    "channelData": {
        "tenant": {
            "id": "tenantId-Guid"
        }
    }
}

const teamActivity = {
    "text": "<at>Teams Bot</at> hi\n",
    "attachments": [
        {
            "contentType": "text/html",
            "content": "<div><div><span itemscope=\"\" itemtype=\"http://schema.skype.com/Mention\" itemid=\"0\">Teams Bot</span>&nbsp;hi</div>\n</div>"
        }
    ],
    "type": "message",
    "id": "teamActivityId",
    "channelId": "msteams",
    "serviceUrl": "https://smba.trafficmanager.net/amer/",
    "from": {
        "id": "29:User-One-Id",
        "name": "User One",
        "aadObjectId": "User-aadObjectId"
    },
    "conversation": {
        "isGroup": true,
        "conversationType": "channel",
        "tenantId": "tenantId-Guid",
        "id": "19:generalChannelIdgeneralChannelId@thread.skype;messageid=teamActivityId"
    },
    "recipient": {
        "id": "28:teamsbot-Guid",
        "name": "Teams Bot"
    },
    "entities": [
        {
            "mentioned": {
                "id": "28:teamsbot-Guid",
                "name": "Teams Bot"
            },
            "text": "<at>Teams Bot</at>",
            "type": "mention"
        }
    ],
    "channelData": {
        "teamsChannelId": "19:generalChannelIdgeneralChannelId@thread.skype",
        "teamsTeamId": "19:generalChannelIdgeneralChannelId@thread.skype",
        "channel": {
            "id": "19:generalChannelIdgeneralChannelId@thread.skype"
        },
        "team": {
            "id": "19:generalChannelIdgeneralChannelId@thread.skype"
        },
        "tenant": {
            "id": "tenantId-Guid"
        }
    }
}
