// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * @module botbuilder
 */

import { Assertion, assert, delay, tests } from 'botbuilder-stdlib';
import { BotLogic, assertBotLogic } from './interfaces';
import { ServiceClientCredentials } from '@azure/ms-rest-js';

import {
    AuthenticationConstants,
    BotFrameworkAuthentication,
    ClaimsIdentity,
    ConnectorClient,
} from 'botframework-connector';

import {
    Activity,
    ActivityEventNames,
    ActivityTypes,
    BotAdapter,
    Channels,
    ConversationReference,
    DeliveryModes,
    InvokeResponse,
    ResourceResponse,
    StatusCodes,
    TurnContext,
    assertActivity,
    assertConversationReference,
    assertInvokeResponse,
} from 'botbuilder-core';

const assertPartialActivity: Assertion<Partial<Activity>> = assert.makePartial(assertActivity);

const assertPartialConversationReference: Assertion<Partial<ConversationReference>> = assert.makePartial(
    assertConversationReference
);

// CloudAdapterBase holds logic common to all cloud-based Bot adapters.
export abstract class CloudAdapterBase extends BotAdapter {
    public readonly InvokeResponseKey = Symbol('BotFrameworkAdapter.InvokeResponse');
    public readonly ConnectorClientKey = Symbol('CloudAdapterBase.ConnectorClient');
    public readonly BotLogicKey = Symbol('CloudAdapterBase.BotLogic');

    private readonly _botFrameworkAuthentication: BotFrameworkAuthentication;
    private readonly _appId: string;

    /**
     * Constructs an instance of CloudAdapterBase. Note that this is an abstract
     * class, so the constructor should only be invoked with `super`.
     *
     * @param {BotFrameworkAuthentication} botFrameworkAuthentication a delegate to handle authentication
     */
    constructor(botFrameworkAuthentication: BotFrameworkAuthentication, appId: string);
    constructor(botFrameworkAuthentication: unknown, appId: unknown) {
        super();

        BotFrameworkAuthentication.assert(botFrameworkAuthentication, ['botFrameworkAuthentication']);
        this._botFrameworkAuthentication = botFrameworkAuthentication;

        assert.string(appId, ['appId']);
        this._appId = appId;
    }

    /**
     * Send a set of activities via a connector client.
     *
     * @param {TurnContext} turnContext the turn context
     * @param {Array<Partial<Activity>>} activities the activities to send
     * @returns {Promise<Array<ResourceResponse>>} a promise that resolves to the resource responses obtained by sending activities
     */
    sendActivities(turnContext: TurnContext, activities: Array<Partial<Activity>>): Promise<Array<ResourceResponse>>;
    async sendActivities(turnContext: unknown, activities: unknown): Promise<Array<ResourceResponse>> {
        TurnContext.assert(turnContext, ['turnContext']);

        const assertPartialActivityArray: Assertion<Array<Partial<Activity>>> = assert.arrayOf(assertPartialActivity);
        assertPartialActivityArray(activities, ['activities']);

        const connectorClient = this.turnContextConnectorClient(turnContext);

        return Promise.all(
            activities.map<Promise<ResourceResponse>>(async (activity) => {
                delete activity.id;

                if (activity.type === ActivityTypes.Delay) {
                    const milliseconds = tests.isNumber(activity.value) ? activity.value : 1000;
                    await delay(milliseconds);
                } else if (activity.type === ActivityTypes.InvokeResponse) {
                    turnContext.turnState.set(this.InvokeResponseKey, activity);
                } else if (activity.type === ActivityTypes.Trace && activity.channelId !== Channels.Emulator) {
                    // no-op
                } else {
                    if (activity.replyToId) {
                        return connectorClient.conversations.replyToActivity(
                            activity.conversation.id,
                            activity.replyToId,
                            activity
                        );
                    } else {
                        return connectorClient.conversations.sendToConversation(activity.conversation.id, activity);
                    }
                }

                return { id: '' };
            })
        );
    }

    /**
     * Update an activity
     *
     * @param {TurnContext} turnContext turn context
     * @param {Activity} activity an activity to update
     * @returns {Promise<ResourceResponse>} a promise resolving to a resource response
     */
    updateActivity(turnContext: TurnContext, activity: Partial<Activity>): Promise<ResourceResponse>;
    async updateActivity(turnContext: unknown, activity: unknown): Promise<ResourceResponse> {
        TurnContext.assert(turnContext, ['turnContext']);
        assertPartialActivity(activity, ['activity']);

        const connectorClient = this.turnContextConnectorClient(turnContext);

        const conversationId = activity.conversation?.id;
        assert.string(conversationId, ['activity', 'conversation', 'id']);

        const activityId = activity.id;
        assert.string(activityId, ['activity']);

        return connectorClient.conversations.updateActivity(conversationId, activityId, activity);
    }

    /**
     * Delete an activity
     *
     * @param {TurnContext} turnContext turn context
     * @param {ConversationReference} reference a conversation reference to delete
     * @returns {Promise<void>} a promise representing the async operation
     */
    deleteActivity(turnContext: TurnContext, reference: Partial<ConversationReference>): Promise<void>;
    async deleteActivity(turnContext: unknown, reference: unknown): Promise<void> {
        TurnContext.assert(turnContext, ['turnContext']);
        assertPartialConversationReference(reference, ['reference']);

        const connectorClient = this.turnContextConnectorClient(turnContext);

        const conversationId = reference.conversation?.id;
        assert.string(conversationId, ['reference', 'conversation', 'id']);

        const activityId = reference.activityId;
        assert.string(activityId, ['reference', 'activityId']);

        await connectorClient.conversations.deleteActivity(reference.conversation.id, reference.activityId);
    }

    /**
     * Continue a conversation
     *
     * @param {Partial<ConversationReference>} reference a conversation reference
     * @param {BotLogic} logic the bot's logic
     * @returns {Promise<void>} a promise representing the async operation
     */
    continueConversation(reference: Partial<ConversationReference>, logic: BotLogic): Promise<void>;
    async continueConversation(reference: unknown, logic: unknown): Promise<void> {
        assertPartialConversationReference(reference, ['reference']);
        assertBotLogic(logic, ['logic']);

        const claimsIdentity = new ClaimsIdentity(
            [
                {
                    type: AuthenticationConstants.AppIdClaim,
                    value: this._appId,
                },
            ],
            true
        );

        return this.processProactive(claimsIdentity, reference, undefined, logic);
    }

    private createConnectorClient(credentials: ServiceClientCredentials, baseUri?: string): ConnectorClient {
        return new ConnectorClient(credentials, {
            baseUri,
        });
    }

    /**
     * Handles a proactive operation, useful for `continueConversation` invocations.
     *
     * @param {ClaimsIdentity} claimsIdentity a set of claims
     * @param {Partial<ConversationReference>} reference a conversation reference
     * @param {string} audience the audience
     * @param {BotLogic} logic the bot's actual logic
     * @returns {Promise<void>} a promise representing the async operation
     */
    protected processProactive(
        claimsIdentity: ClaimsIdentity,
        reference: Partial<ConversationReference>,
        audience: string | undefined,
        logic: BotLogic
    ): Promise<void>;
    protected async processProactive(
        claimsIdentity: unknown,
        reference: unknown,
        audience: unknown,
        logic: unknown
    ): Promise<void> {
        ClaimsIdentity.assert(claimsIdentity, ['claimsIdentity']);
        assertPartialConversationReference(reference, ['reference']);
        assert.maybeString(audience, ['audience']);
        assertBotLogic(logic, ['logic']);

        const activity = TurnContext.applyConversationReference(
            { type: ActivityTypes.Event, name: ActivityEventNames.ContinueConversation },
            reference,
            true
        );

        const proactiveCredentials = await this._botFrameworkAuthentication.getProactiveCredentials(
            claimsIdentity,
            audience
        );

        const connectorClient = this.createConnectorClient(proactiveCredentials.credentials, activity.serviceUrl);

        const turnContext = this.createTurnContext(
            activity,
            claimsIdentity,
            proactiveCredentials.scope,
            connectorClient,
            logic
        );

        try {
            await this.runMiddleware(turnContext, logic);
        } finally {
            this.disposeTurnContext(turnContext);
        }
    }

    /**
     * Handles an activity
     *
     * @param {string} authHeader an HTTP auth header
     * @param {Activity} activity the activity
     * @param {BotLogic} botLogic the bot's logic
     * @returns {Promise<void>} a promise that resolves to an invoke response
     */
    processActivity(authHeader: string | undefined, activity: Activity, logic: BotLogic): Promise<InvokeResponse>;
    async processActivity(authHeader: unknown, activity: unknown, logic: unknown): Promise<InvokeResponse> {
        assert.maybeString(authHeader, ['authHeader']);
        assertPartialActivity(activity, ['activity']);
        assertBotLogic(logic, ['logic']);

        const authenticateResult = await this._botFrameworkAuthentication.authenticateRequest(activity, authHeader);
        activity.callerId = authenticateResult.callerId;

        const connectorClient = this.createConnectorClient(authenticateResult.credentials, activity.serviceUrl);

        const turnContext = this.createTurnContext(
            activity,
            authenticateResult.claimsIdentity,
            authenticateResult.scope,
            connectorClient,
            logic
        );

        try {
            await this.runMiddleware(turnContext, logic);
            return this.processTurnResults(turnContext);
        } finally {
            this.disposeTurnContext(turnContext);
        }
    }

    private createTurnContext(
        activity: Partial<Activity>,
        claimsIdentity: ClaimsIdentity,
        oauthScope: string,
        connectorClient: ConnectorClient,
        logic: BotLogic
    ): TurnContext {
        const turnContext = new TurnContext(this, activity);
        turnContext.turnState.set(this.BotIdentityKey, claimsIdentity);
        turnContext.turnState.set(this.OAuthScopeKey, oauthScope);
        turnContext.turnState.set(this.ConnectorClientKey, connectorClient);
        turnContext.turnState.set(this.BotLogicKey, logic);
        return turnContext;
    }

    private disposeTurnContext(turnContext: TurnContext) {
        turnContext.turnState.set(this.ConnectorClientKey, null);
    }

    private turnContextConnectorClient(turnContext: TurnContext): ConnectorClient {
        const connectorClient = turnContext.turnState.get(this.ConnectorClientKey);
        ConnectorClient.assert(connectorClient, ['turnContext', 'turnState', 'get', 'ConnectorClientKey']);

        return connectorClient;
    }

    private processTurnResults(turnContext: TurnContext): InvokeResponse | null {
        const activity = turnContext.activity;

        if (activity.deliveryMode === DeliveryModes.ExpectReplies) {
            return { status: StatusCodes.OK, body: turnContext.bufferedReplyActivities };
        }

        if (activity.type === ActivityTypes.Invoke) {
            const invokeResponse = turnContext.turnState.get(this.InvokeResponseKey);
            if (!invokeResponse) {
                return { status: StatusCodes.NOT_IMPLEMENTED };
            } else {
                assertInvokeResponse(invokeResponse, ['turnContext', 'turnState', 'get', 'InvokeResponseKey']);
                return invokeResponse;
            }
        }

        return null;
    }
}
