// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation. All rights reserved.

import nock = require('nock');
import path = require('path');
import { AdaptiveBotComponent } from 'botbuilder-dialogs-adaptive';
import { AdaptiveTeamsBotComponent } from '../src/adaptiveTeamsBotComponent';
import { AdaptiveTestBotComponent, TestUtils } from 'botbuilder-dialogs-adaptive-testing';
import { ConnectorClient, MicrosoftAppCredentials } from 'botframework-connector';
import { ComponentDeclarativeTypes, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { ServiceCollection, noOpConfiguration } from 'botbuilder-dialogs-adaptive-runtime-core';
import { jwt } from 'botbuilder-test-utils';
import { ok } from 'assert';

import {
    ConversationState,
    TestAdapter,
    useBotState,
    MemoryStorage,
    UserState,
    Channels,
    ConversationReference,
    ChannelAccount,
    ConversationAccount,
} from 'botbuilder';

const getTeamsTestAdapter = (convo?: Partial<ConversationReference>): TestAdapter => {
    const adapter = new TestAdapter(convo as ConversationReference);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: This is required because TeamsInfo checks that the adapter has a createConnectorClient method
    // and TestAdapter doesn't have one, natively.
    adapter.createConnectorClient = () => {
        return new ConnectorClient(new MicrosoftAppCredentials('', ''));
    };

    // DialogManager requires conversationState
    const storage = new MemoryStorage();
    const userState = new UserState(storage);
    const conversationState = new ConversationState(storage);
    useBotState(adapter, userState, conversationState);

    return adapter;
};

const getTeamsUser = (): ChannelAccount => {
    return {
        id: '29:User-Id',
        name: 'User Name',
        aadObjectId: 'participant-aad-id',
    };
};

const getPersonalConversation = (): ConversationAccount => {
    return {
        id: 'a:oneOnOneConversationId',
        name: 'oneOnOne',
        tenantId: 'tenantId-Guid',
        conversationType: 'personal',
        isGroup: false,
    };
};

const getGroupConversation = (): ConversationAccount => {
    return {
        id: '19:groupChatId@thread.v2',
        name: 'group',
        tenantId: 'tenantId-Guid',
        conversationType: 'groupChat',
        isGroup: true,
    };
};

const getBaseConversationReference = (): ConversationReference => {
    return {
        user: getTeamsUser(),
        channelId: Channels.Msteams,
        conversation: getPersonalConversation(),
        bot: {
            id: 'botId',
            name: 'Bot',
        },
        serviceUrl: 'https://api.botframework.com',
    };
};

const getPersonalConversationReference = (): ConversationReference => {
    return {
        ...getBaseConversationReference(),
        conversation: getPersonalConversation(),
    };
};

const getGroupConversationReference = (): ConversationReference => {
    return {
        ...getBaseConversationReference(),
        conversation: getGroupConversation(),
    };
};

const generateTeamMembers = (amount: number): Record<string, unknown>[] => {
    const members = [];
    const baseUser = getTeamsUser();
    for (let i = 0; i < amount; i++) {
        members.push({
            id: `${baseUser.id}-${i}`,
            name: `${baseUser.name}-${i}`,
            objectId: `User-${i}-Object-Id`,
            givenName: 'User',
            surname: `Surname-${i}`,
            email: `User.${i}@microsoft.com`,
            userPrincipalName: `user${i}@microsoft.com`,
            tenantId: 'tenant-id-1',
        });
    }

    return members;
};

describe('Actions', function () {
    jwt.mocha();

    let resourceExplorer: ResourceExplorer;
    beforeEach(function () {
        const services = new ServiceCollection({
            declarativeTypes: [],
        });

        new AdaptiveBotComponent().configureServices(services, noOpConfiguration);
        new AdaptiveTeamsBotComponent().configureServices(services, noOpConfiguration);
        new AdaptiveTestBotComponent().configureServices(services, noOpConfiguration);

        const declarativeTypes = services.mustMakeInstance<ComponentDeclarativeTypes[]>('declarativeTypes');

        resourceExplorer = new ResourceExplorer({ declarativeTypes }).addFolder(
            path.join(__dirname, 'actionTests'),
            true,
            false
        );
    });

    /**
     * Note: With mocha, `this.test?.title` refers to the test's name, so runTestScript
     * is just calling a file with the same name as the test.
     */
    it('Action_GetMeetingParticipant', async function () {
        const conversationReference = getPersonalConversationReference();
        const participant = {
            user: {
                userPrincipalName: 'userPrincipalName-1',
            },
            meeting: {
                role: 'Organizer',
            },
            conversation: conversationReference.conversation,
        };

        const fetchExpectation = nock('https://api.botframework.com')
            .get('/v1/meetings/meeting-id-1/participants/participant-aad-id-1?tenantId=tenant-id-1')
            .reply(200, participant);

        const fetchExpectationCustomProperties = nock('https://api.botframework.com')
            .get('/v1/meetings/customMeetingId/participants/customParticipantId?tenantId=customTenantId')
            .reply(200, participant);

        const adapter = getTeamsTestAdapter(conversationReference);

        await TestUtils.runTestScript(resourceExplorer, this.test?.title, adapter);

        ok(fetchExpectation.isDone());
        ok(fetchExpectationCustomProperties.isDone());
    });

    it('Action_GetMeetingParticipantError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_GetMeetingParticipantErrorWithAdapter', async function () {
        const conversationReference = getPersonalConversationReference();
        const adapter = getTeamsTestAdapter(conversationReference);

        await TestUtils.runTestScript(resourceExplorer, this.test?.title, adapter);
    });

    it('Action_GetMember', async function () {
        const conversationReference = getPersonalConversationReference();
        const members = generateTeamMembers(1);

        const fetchExpectation = nock('https://api.botframework.com')
            .get('/v3/conversations/a%3AoneOnOneConversationId/members/member-id')
            .reply(200, members[0]);

        const fetchExpectationCustomProperties = nock('https://api.botframework.com')
            .get('/v3/conversations/a%3AoneOnOneConversationId/members/customMemberId')
            .reply(200, members[0]);

        const adapter = getTeamsTestAdapter(conversationReference);

        await TestUtils.runTestScript(resourceExplorer, this.test?.title, adapter);

        ok(fetchExpectation.isDone());
        ok(fetchExpectationCustomProperties.isDone());
    });

    it('Action_GetMemberError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_GetMemberErrorWithAdapter', async function () {
        const conversationReference = getPersonalConversationReference();
        const adapter = getTeamsTestAdapter(conversationReference);

        await TestUtils.runTestScript(resourceExplorer, this.test?.title, adapter);
    });

    it('Action_GetPagedMembers', async function () {
        const conversationReference = getGroupConversationReference();
        const members = generateTeamMembers(3);

        const fetchExpectation = nock('https://api.botframework.com')
            .get('/v3/conversations/19%3AgroupChatId%40thread.v2/pagedmembers')
            .reply(200, { continuationToken: 'token', members });

        const fetchExpectationCustomProperties = nock('https://api.botframework.com')
            .get('/v3/conversations/19%3AgroupChatId%40thread.v2/pagedmembers?pageSize=2&continuationToken=token')
            .reply(200, { continuationToken: 'customToken', members: members.slice(0, 2) });

        const adapter = getTeamsTestAdapter(conversationReference);

        await TestUtils.runTestScript(resourceExplorer, this.test?.title, adapter);

        ok(fetchExpectation.isDone());
        ok(fetchExpectationCustomProperties.isDone());
    });

    it('Action_GetPagedMembersError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_GetPagedTeamMembers', async function () {
        const conversationReference = getGroupConversationReference();
        const members = generateTeamMembers(3);

        const fetchExpectation = nock('https://api.botframework.com')
            .get('/v3/conversations/team-id-1/pagedmembers')
            .reply(200, { continuationToken: 'token', members });

        const fetchExpectationCustomProperties = nock('https://api.botframework.com')
            .get('/v3/conversations/team-id-1/pagedmembers?pageSize=2&continuationToken=token')
            .reply(200, { continuationToken: 'customToken', members: members.slice(0, 2) });

        const adapter = getTeamsTestAdapter(conversationReference);

        await TestUtils.runTestScript(resourceExplorer, this.test?.title, adapter);

        ok(fetchExpectation.isDone());
        ok(fetchExpectationCustomProperties.isDone());
    });

    it('Action_GetPagedTeamMembersError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_GetTeamChannels', async function () {
        const conversationReference = getGroupConversationReference();
        const conversations = [
            {
                id: '19:ChannelIdgeneralChannelId@thread.skype',
                name: 'Testing0',
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

        const fetchExpectation = nock('https://api.botframework.com')
            .get('/v3/teams/team-id-1/conversations')
            .reply(200, { conversations });

        const fetchExpectationCustomProperties = nock('https://api.botframework.com')
            .get('/v3/teams/customTeamId/conversations')
            .reply(200, { conversations });

        const adapter = getTeamsTestAdapter(conversationReference);

        await TestUtils.runTestScript(resourceExplorer, this.test?.title, adapter);

        ok(fetchExpectation.isDone());
        ok(fetchExpectationCustomProperties.isDone());
    });

    it('Action_GetTeamChannelsError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_GetTeamDetails', async function () {
        const conversationReference = getGroupConversationReference();
        const teamDetails = {
            id: '19:generalChannelIdgeneralChannelId@thread.skype',
            name: 'TeamName',
            aadGroupId: 'Team-aadGroupId',
        };

        const fetchExpectation = nock('https://api.botframework.com')
            .get('/v3/teams/team-id-1')
            .reply(200, teamDetails);

        const fetchExpectationCustomProperties = nock('https://api.botframework.com')
            .get('/v3/teams/customTeamId')
            .reply(200, teamDetails);

        const adapter = getTeamsTestAdapter(conversationReference);

        await TestUtils.runTestScript(resourceExplorer, this.test?.title, adapter);

        ok(fetchExpectation.isDone());
        ok(fetchExpectationCustomProperties.isDone());
    });

    it('Action_GetTeamDetailsError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_GetTeamMember', async function () {
        const conversationReference = getGroupConversationReference();
        const members = generateTeamMembers(1);

        const fetchExpectation = nock('https://api.botframework.com')
            .get('/v3/conversations/team-id-1/members/29%3AUser-Id')
            .reply(200, members[0]);

        const fetchExpectationCustomProperties = nock('https://api.botframework.com')
            .get('/v3/conversations/customTeamId/members/customMemberId')
            .reply(200, members[0]);

        const adapter = getTeamsTestAdapter(conversationReference);

        await TestUtils.runTestScript(resourceExplorer, this.test?.title, adapter);

        ok(fetchExpectation.isDone());
        ok(fetchExpectationCustomProperties.isDone());
    });

    it('Action_GetTeamMemberError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_GetTeamMemberErrorWithAdapter', async function () {
        const conversationReference = getGroupConversationReference();
        const adapter = getTeamsTestAdapter(conversationReference);

        await TestUtils.runTestScript(resourceExplorer, this.test?.title, adapter);
    });

    it('Action_SendAppBasedLinkQueryResponse', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendAppBasedLinkQueryResponseError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendMessageToTeamsChannel', async function () {
        const conversationReference = getGroupConversationReference();
        const adapter = getTeamsTestAdapter(conversationReference);

        const fetchExpectation = nock('https://api.botframework.com').post('/v3/conversations').times(2).reply(200);

        await TestUtils.runTestScript(resourceExplorer, this.test?.title, adapter);

        ok(fetchExpectation.isDone());
    });

    it('Action_SendMessageToTeamsChannelError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendMEActionResponse', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendMEActionResponseError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendMEAttachmentsResponse', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendMEAttachmentsResponseError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendMEAuthResponse', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendMEAuthResponseError', async function () {
        const adapter = getTeamsTestAdapter();
        // eslint-disable-next-line
        // @ts-ignore: We have to set this to null to test the error but tsconfig "strict" doesn't allow it.
        adapter.getUserToken = null;
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendMEAuthResponseErrorWithAdapter', async function () {
        const adapter = getTeamsTestAdapter();
        adapter.addUserToken('test connection', 'test', 'user1', 'token');

        await TestUtils.runTestScript(resourceExplorer, this.test?.title, adapter);
    });

    it('Action_SendMEBotMessagePreviewResponse', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendMEBotMessagePreviewResponseError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendMEConfigQuerySettingUrlResponse', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendMEConfigQuerySettingUrlResponseError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendMEMessageResponse', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendMEMessageResponseError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendMESelectItemResponse', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendMESelectItemResponseError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendTaskModuleCardResponse', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendTaskModuleCardResponseError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendTaskModuleMessageResponse', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendTaskModuleUrlResponse', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendTaskModuleUrlResponseError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendTabCardResponseError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendTabCardResponse', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendTabAuthResponseErrorWithAdapter', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });

    it('Action_SendTabAuthResponseError', async function () {
        await TestUtils.runTestScript(resourceExplorer, this.test?.title);
    });
});
