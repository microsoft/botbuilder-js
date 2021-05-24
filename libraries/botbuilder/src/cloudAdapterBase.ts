// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotCallbackHandlerKey, INVOKE_RESPONSE_KEY } from 'botbuilder-core';
import { BotLogic } from './interfaces';
import { delay } from 'botbuilder-stdlib';

import {
    AuthenticateRequestResult,
    AuthenticationConstants,
    BotFrameworkAuthentication,
    ClaimsIdentity,
    ConnectorClient,
    ConnectorFactory,
    UserTokenClient,
} from 'botframework-connector';

import {
    Activity,
    ActivityEx,
    ActivityTypes,
    BotAdapter,
    Channels,
    ConversationReference,
    DeliveryModes,
    InvokeResponse,
    ResourceResponse,
    StatusCodes,
    TurnContext,
} from 'botbuilder-core';

export abstract class CloudAdapterBase extends BotAdapter {
    public readonly ConnectorFactoryKey = Symbol('ConnectorFactory');
    public readonly UserTokenClientKey = Symbol('UserTokenClient');

    /**
     * Create a new [CloudAdapterBase](xref:botbuilder.CloudAdapterBase) instance.
     *
     * @param botFrameworkAuthentication A [BotFrameworkAuthentication](xref:botframework-connector.BotFrameworkAuthentication) used for validating and creating tokens.
     */
    constructor(protected readonly botFrameworkAuthentication: BotFrameworkAuthentication) {
        super();

        if (!botFrameworkAuthentication) {
            throw new TypeError('`botFrameworkAuthentication` parameter required');
        }
    }

    /**
     * @inheritdoc
     */
    public sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        if (!context) {
            throw new TypeError('`context` parameter required');
        }

        if (!activities) {
            throw new TypeError('`activities` parameter required');
        }

        if (!activities.length) {
            throw new Error('Expecting one or more activities, but the array was empty.');
        }

        return Promise.all(
            activities.map(async (activity) => {
                delete activity.id;

                if (activity.type === 'delay') {
                    await delay(typeof activity.value === 'number' ? activity.value : 1000);
                } else if (activity.type === ActivityTypes.InvokeResponse) {
                    context.turnState.set(INVOKE_RESPONSE_KEY, activity);
                } else if (activity.type === ActivityTypes.Trace && activity.channelId !== Channels.Emulator) {
                    // no-op
                } else {
                    const connectorClient = context.turnState.get<ConnectorClient>(this.ConnectorClientKey);
                    if (!connectorClient) {
                        throw new Error('Unable to extract ConnectorClient from turn context.');
                    }

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

                return { id: activity.id ?? '' };
            })
        );
    }

    /**
     * @inheritdoc
     */
    public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<ResourceResponse | void> {
        if (!context) {
            throw new TypeError('`context` parameter required');
        }

        if (!activity) {
            throw new TypeError('`activity` parameter required');
        }

        const connectorClient = context.turnState.get<ConnectorClient>(this.ConnectorClientKey);
        if (!connectorClient) {
            throw new Error('Unable to extract ConnectorClient from turn context.');
        }

        const response = await connectorClient.conversations.updateActivity(
            activity.conversation.id,
            activity.id,
            activity
        );

        return response?.id ? { id: response.id } : undefined;
    }

    /**
     * @inheritdoc
     */
    public async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        if (!context) {
            throw new TypeError('`context` parameter required');
        }

        if (!reference) {
            throw new TypeError('`reference` parameter required');
        }

        const connectorClient = context.turnState.get<ConnectorClient>(this.ConnectorClientKey);
        if (!connectorClient) {
            throw new Error('Unable to extract ConnectorClient from turn context.');
        }

        await connectorClient.conversations.deleteActivity(reference.conversation.id, reference.activityId);
    }

    /**
     * @inheritdoc
     */
    public async continueConversation(reference: Partial<ConversationReference>, logic: BotLogic): Promise<void> {
        return this.processProactive(
            this.createClaimsIdentity(),
            ActivityEx.getContinuationActivity(reference),
            undefined,
            logic
        );
    }

    /**
     * @inheritdoc
     */
    public async continueConversationWithClaims(
        claimsIdentity: ClaimsIdentity,
        reference: Partial<ConversationReference>,
        audience: string | undefined,
        logic: BotLogic
    ): Promise<void> {
        return this.processProactive(claimsIdentity, ActivityEx.getContinuationActivity(reference), audience, logic);
    }

    /**
     * The implementation for continue conversation.
     *
     * @param claimsIdentity The [ClaimsIdentity](xref:botframework-connector.ClaimsIdentity) for the conversation.
     * @param continuationActivity The continuation [Activity](xref:botframework-schema.Activity) used to create the [TurnContext](xref:botbuilder-core.TurnContext).
     * @param audience The audience for the call.
     * @param logic The [BotLogic](xref:botbuilder.BotLogic) to call for the resulting bot turn.
     * @returns a Promise representing the async operation
     */
    protected async processProactive(
        claimsIdentity: ClaimsIdentity,
        continuationActivity: Partial<Activity>,
        audience: string | undefined,
        logic: BotLogic
    ): Promise<void> {
        // Create the connector factory and  the inbound request, extracting parameters and then create a connector for outbound requests.
        const connectorFactory = this.botFrameworkAuthentication.createConnectorFactory(claimsIdentity);

        // Create the connector client to use for outbound requests.
        const connectorClient = await connectorFactory.create(continuationActivity.serviceUrl, audience);

        // Create a UserTokenClient instance for the application to use. (For example, in the OAuthPrompt.)
        const userTokenClient = await this.botFrameworkAuthentication.createUserTokenClient(claimsIdentity);

        // Create a turn context and run the pipeline.
        const context = this.createTurnContext(
            continuationActivity,
            claimsIdentity,
            audience,
            connectorClient,
            userTokenClient,
            logic,
            connectorFactory
        );

        // Run the pipeline.
        await this.runMiddleware(context, logic);
    }

    /**
     * The implementation for processing an Activity sent to this bot.
     *
     * @param authHeader The authorization header from the http request.
     * @param activity The [Activity](xref:botframework-schema.Activity) to process.
     * @param logic The [BotLogic](xref:botbuilder.BotLogic) to call for the resulting bot turn.
     * @returns a Promise resolving to an invoke response, or undefined.
     */
    protected processActivity(
        authHeader: string,
        activity: Activity,
        logic: BotLogic
    ): Promise<InvokeResponse | undefined>;

    /**
     * The implementation for processing an Activity sent to this bot.
     *
     * @param authenticateRequestResult The [AuthenticateRequestResult](xref:botframework-connector.AuthenticateRequestResult) for this turn.
     * @param activity The [Activity](xref:botframework-schema.Activity) to process.
     * @param logic The [BotLogic](xref:botbuilder.BotLogic) to call for the resulting bot turn.
     * @returns a Promise resolving to an invoke response, or undefined.
     */
    protected processActivity(
        authenticateRequestResult: AuthenticateRequestResult,
        activity: Activity,
        logic: BotLogic
    ): Promise<InvokeResponse | undefined>;

    /**
     * @internal
     */
    protected async processActivity(
        authHeaderOrAuthenticateRequestResult: string | AuthenticateRequestResult,
        activity: Activity,
        logic: BotLogic
    ): Promise<InvokeResponse | undefined> {
        // Authenticate the inbound request, extracting parameters and create a ConnectorFactory for creating a Connector for outbound requests.
        const authenticateRequestResult =
            typeof authHeaderOrAuthenticateRequestResult === 'string'
                ? await this.botFrameworkAuthentication.authenticateRequest(
                      activity,
                      authHeaderOrAuthenticateRequestResult
                  )
                : authHeaderOrAuthenticateRequestResult;

        // Set the callerId on the activity.
        activity.callerId = authenticateRequestResult.callerId;

        // Create the connector client to use for outbound requests.
        const connectorClient = await authenticateRequestResult.connectorFactory?.create(
            activity.serviceUrl,
            authenticateRequestResult.audience
        );

        if (!connectorClient) {
            throw new Error('Unable to extract ConnectorClient from turn context.');
        }

        // Create a UserTokenClient instance for the application to use. (For example, it would be used in a sign-in prompt.)
        const userTokenClient = await this.botFrameworkAuthentication.createUserTokenClient(
            authenticateRequestResult.claimsIdentity
        );

        // Create a turn context and run the pipeline.
        const context = this.createTurnContext(
            activity,
            authenticateRequestResult.claimsIdentity,
            authenticateRequestResult.audience,
            connectorClient,
            userTokenClient,
            logic,
            authenticateRequestResult.connectorFactory
        );

        // Run the pipeline.
        await this.runMiddleware(context, logic);

        // If there are any results they will have been left on the TurnContext.
        return this.processTurnResults(context);
    }

    /**
     * This is a helper to create the ClaimsIdentity structure from an appId that will be added to the TurnContext.
     * It is intended for use in proactive and named-pipe scenarios.
     *
     * @param botAppId The bot's application id.
     * @returns a [ClaimsIdentity](xref:botframework-connector.ClaimsIdentity) with the audience and appId claims set to the botAppId.
     */
    protected createClaimsIdentity(botAppId = ''): ClaimsIdentity {
        return new ClaimsIdentity([
            {
                type: AuthenticationConstants.AudienceClaim,
                value: botAppId,
            },
            {
                type: AuthenticationConstants.AppIdClaim,
                value: botAppId,
            },
        ]);
    }

    private createTurnContext(
        activity: Partial<Activity>,
        claimsIdentity: ClaimsIdentity,
        oauthScope: string | undefined,
        connectorClient: ConnectorClient,
        userTokenClient: UserTokenClient,
        logic: BotLogic,
        connectorFactory: ConnectorFactory
    ): TurnContext {
        const context = new TurnContext(this, activity);

        context.turnState.set(this.BotIdentityKey, claimsIdentity);
        context.turnState.set(this.ConnectorClientKey, connectorClient);
        context.turnState.set(this.UserTokenClientKey, userTokenClient);
        context.turnState.set(BotCallbackHandlerKey, logic);
        context.turnState.set(this.ConnectorFactoryKey, connectorFactory);
        context.turnState.set(this.OAuthScopeKey, oauthScope);

        return context;
    }

    private processTurnResults(context: TurnContext): InvokeResponse | undefined {
        // Handle ExpectedReplies scenarios where all activities have been buffered and sent back at once in an invoke response.
        if (context.activity.deliveryMode === DeliveryModes.ExpectReplies) {
            return {
                status: StatusCodes.OK,
                body: {
                    activities: context.bufferedReplyActivities,
                },
            };
        }

        // Handle Invoke scenarios where the bot will return a specific body and return code.
        if (context.activity.type === ActivityTypes.Invoke) {
            const activityInvokeResponse = context.turnState.get<Activity>(INVOKE_RESPONSE_KEY);
            if (!activityInvokeResponse) {
                return { status: StatusCodes.NOT_IMPLEMENTED };
            }

            return activityInvokeResponse.value;
        }

        // No body to return.
        return undefined;
    }
}
