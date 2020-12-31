// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation. All rights reserved.

import 'mocha';
import {
    ComponentRegistration,
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
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { TeamsComponentRegistration } from '../../lib';
import { AdaptiveTestComponentRegistration, TestUtils } from 'botbuilder-dialogs-adaptive-testing';
import { AdaptiveComponentRegistration } from 'botbuilder-dialogs-adaptive';
import { ConnectorClient, MicrosoftAppCredentials } from 'botframework-connector';
import { ok } from 'assert';
import path = require('path');
import nock = require('nock');

/**
 * Registers mocha hooks for proper usage
 * TODO: Import function from testing/botbuilder-test-utils after PR merged:
 * https://github.com/microsoft/botbuilder-js/pull/3138
 */
export function mocha(): void {
    before(() => nock.disableNetConnect());
    beforeEach(() => nock.cleanAll());
    after(() => nock.enableNetConnect());
    afterEach(() => nock.cleanAll());
}

const getTeamsTestAdapter = (convo?: ConversationReference): TestAdapter => {
    const adapter = new TestAdapter(convo);
    // This is required because TeamsInfo checks that the adapter has a createConnectorClient method
    // and TestAdapter doesn't have one, natively.
    adapter.createConnectorClient = () => {
        return new ConnectorClient(new MicrosoftAppCredentials('', ''));
    };

    // DialogManager requires conversationState and it's required for the tests so that we can store
    // the nock response in user.participant, send it back as part of the test script, and AssertReply
    // that we got the correct response
    const storage = new MemoryStorage();
    const userState = new UserState(storage);
    const conversationState = new ConversationState(storage);
    useBotState(adapter, userState, conversationState);

    return adapter;
};

const getTeamsUser = ():ChannelAccount => {
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

const getPersonalConversationReference = (): ConversationReference => {
    return <ConversationReference>{
        user: getTeamsUser(),
        channelId: Channels.Msteams,
        conversation: getPersonalConversation(),
    };
};

const getGroupConversationReference = (): ConversationReference => {
    return <ConversationReference>{
        user: getTeamsUser(),
        channelId: Channels.Msteams,
        conversation: getGroupConversation(),
    };
};

const generateTeamMembers = (amount: number): Record<string, unknown>[] => {
    const members = [];
    for (let i = 0; i < amount; i++) {
        members.push({
            id: `${getTeamsUser().id}-${i}`,
            name: `${getTeamsUser.name}-${i}`,
            objectId: `User-${i}-Object-Id`,
            givenName: 'User',
            surname: i,
            email: `User.${i}@microsoft.com`,
            userPrincipalName: `user${i}@microsoft.com`,
            tenantId: 'tenant-id-1',
        });
    }

    return members;
};

describe('Actions', function () {
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());
    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new TeamsComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, '../../tests/tests/actionTests'),
        true,
        false
    );

    it('Action_GetMeetingParticipantMockedResult', async () => {
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
            .get('/v1/meetings/meeting-id-1/participants/participant-aad-id?tenantId=tenant-id-1')
            .reply(200, participant);

        const adapter = getTeamsTestAdapter(conversationReference);

        await TestUtils.runTestScript(resourceExplorer, 'Action_GetMeetingParticipantMockedResults', adapter);

        ok(fetchExpectation.isDone());
    });

    it('Action_GetMeetingParticipantError', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_GetMeetingParticipantError');
    });

    it('Action_GetMemberMockedResult', async () => {
        const conversationReference = getPersonalConversationReference();
        const members = generateTeamMembers(1);

        const fetchExpectation = nock('https://api.botframework.com')
            .get('/v3/conversations/a%3AoneOnOneConversationId/members/29%3AUser-Id')
            .reply(200, members);

        const adapter = getTeamsTestAdapter(conversationReference);

        await TestUtils.runTestScript(resourceExplorer, 'Action_GetMemberMockedResult', adapter);

        ok(fetchExpectation.isDone());
    });

    it('Action_GetMemberError', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_GetMemberError');
    });

    it('Action_GetPagedMembersMockedResult', async () => {
        const conversationReference = getGroupConversationReference();
        const members = generateTeamMembers(3);

        const fetchExpectation = nock('https://api.botframework.com')
            .get('/v3/conversations/19%3AgroupChatId%40thread.v2/pagedmembers')
            .reply(200, { continuationToken: 'token', members });

        const adapter = getTeamsTestAdapter(conversationReference);

        await TestUtils.runTestScript(resourceExplorer, 'Action_GetPagedMembersMockedResult', adapter);

        ok(fetchExpectation.isDone());
    });

    it('Action_GetPagedMembersError', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_GetPagedMembersError');
    });

    it('Action_GetPagedTeamMembersMockedResult', async () => {
        const conversationReference = getGroupConversationReference();
        const members = generateTeamMembers(3);

        const fetchExpectation = nock('https://api.botframework.com')
            .get('/v3/conversations/team-id-1/pagedmembers')
            .reply(200, { continuationToken: 'token', members });

        const adapter = getTeamsTestAdapter(conversationReference);

        await TestUtils.runTestScript(resourceExplorer, 'Action_GetPagedTeamMembersMockedResult', adapter);

        ok(fetchExpectation.isDone());
    });

    it('Action_GetPagedTeamMembersError', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_GetPagedTeamMembersError');
    });
});
