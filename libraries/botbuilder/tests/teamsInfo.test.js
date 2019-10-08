const assert = require('assert');
const nock = require('nock');
const { TurnContext } = require('botbuilder-core');
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
    describe('getChannels()', () => {
        it('should error in 1-on-1 chat', async () => {
            const context = new TestContext(oneOnOneActivity);
            try {
                await TeamsInfo.getChannels(context);
            } catch (err) {
                assert(err.message === 'This method is only valid within the scope of a MS Teams Team.', `unexpected error.message received: ${err.message}`);
            }
        });

        it('should error in Group chat', async () => {
            const context = new TestContext(groupChatActivity);
            try {
                await TeamsInfo.getChannels(context);
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
            const channels = await TeamsInfo.getChannels(context);
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
    });

    describe('getTeamDetails()', () => {
        it('should error in 1-on-1 chat', async () => {
            const context = new TestContext(oneOnOneActivity);
            try {
                await TeamsInfo.getChannels(context);
            } catch (err) {
                assert(err.message === 'This method is only valid within the scope of a MS Teams Team.', `unexpected error.message received: ${err.message}`);
            }
        });

        it('should error in Group chat', async () => {
            const context = new TestContext(groupChatActivity);
            try {
                await TeamsInfo.getChannels(context);
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
