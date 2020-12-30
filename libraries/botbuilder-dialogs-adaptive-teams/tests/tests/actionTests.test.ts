// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation. All rights reserved.

import 'mocha';
import { ComponentRegistration, ConversationState, TestAdapter, useBotState, MemoryStorage, UserState, Channels, ConversationReference } from 'botbuilder';
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

const getTeamsTestAdapter = (cRef?: ConversationReference): TestAdapter => {
    const adapter = new TestAdapter(cRef);
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
}

describe('Action Tests', function () {
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());
    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new TeamsComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, '../../tests/tests/actionTests'),
        true,
        false
    );

    it('Action_GetMeetingParticipantMockedResults', async () => {
        const conversationReference = <ConversationReference>{
            user: {
                id: 'participant-id',
                aadObjectId: 'participant-aad-id-1',
            },
            channelId: 'msteams',
            conversation: {
                id: 'meetingConversationId-1',
            },
            serviceUrl: 'https://localhost.intercept',
        };
        const participant = {
            user: {
                userPrincipalName: 'userPrincipalName-1',
            },
            meeting: {
                role: 'Organizer',
            },
            conversation: conversationReference.conversation,
        };

        const fetchExpectation = nock('https://localhost.intercept')
            .get('/v1/meetings/meeting-id-1/participants/participant-aad-id-1?tenantId=tenant-id-1')
            .reply(200, participant);

        const adapter = getTeamsTestAdapter(conversationReference);

        await TestUtils.runTestScript(resourceExplorer, 'Action_GetMeetingParticipantMockedResults', adapter);

        ok(fetchExpectation.isDone());
    });
});
