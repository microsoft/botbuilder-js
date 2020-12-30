// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation. All rights reserved.

import 'mocha';
import { ComponentRegistration, ConversationState, TestAdapter, useBotState } from 'botbuilder';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { TeamsComponentRegistration } from '../../lib';
import path = require('path');
import { AdaptiveTestComponentRegistration, TestUtils } from 'botbuilder-dialogs-adaptive-testing';
import { AdaptiveComponentRegistration } from 'botbuilder-dialogs-adaptive';
import * as nock from 'nock';
import { ok } from 'assert';
import { MemoryStorage } from 'botbuilder-core/src';
import { ConnectorClient } from 'botframework-connector';
import { MicrosoftAppCredentials } from 'botframework-connector/src';

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

const getTeamsTestAdapter = (): TestAdapter => {
    const adapter = new TestAdapter();
    // This is required because TeamsInfo checks that the adapter has a createConnectorClient method
    // and TestAdapter doesn't have one, natively.
    adapter.createConnectorClient = () => {
        return new ConnectorClient(new MicrosoftAppCredentials('', ''));
    };

    // DialogManager requires conversationState and it's required for the tests so that we can store
    // the nock response in user.participant, send it back as part of the test script, and AssertReply
    // that we got the correct response
    const storage = new MemoryStorage();
    const conversationState = new ConversationState(storage);
    useBotState(adapter, conversationState);

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
        const participant = {
            user: {
                userPrincipalName: 'userPrincipalName-1',
            },
            meeting: {
                role: 'Organizer',
            },
            conversation: {
                id: 'meetingConversationId-1',
            },
        };

        // TestAdapter uses test.com for the serviceUrl
        const fetchExpectation = nock('https://test.com')
            .get('/v1/meetings/meeting-id-1/participants/participant-aad-id-1?tenantId=tenant-id-1')
            .reply(200, participant);

        const adapter = getTeamsTestAdapter();

        await TestUtils.runTestScript(resourceExplorer, 'Action_GetMeetingParticipantMockedResults', adapter);

        ok(fetchExpectation.isDone());
    });
});
