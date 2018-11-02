/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, ActivityTypes, BotAdapter, ChannelAccount, ConversationAccount, ConversationParameters, ConversationReference, ConversationsResult, ResourceResponse, TurnContext } from 'botbuilder-core';
import { ChannelValidation, ConnectorClient, EmulatorApiClient, GovernmentConstants, JwtTokenValidation, MicrosoftAppCredentials, SimpleCredentialProvider, TokenApiClient, TokenApiModels } from 'botframework-connector';
import * as os from 'os';


/**
 * Express or Restify Request object.
 */
export interface WebRequest {
    body?: any;
    headers: any;
    on(event: string, ...args: any[]): any;
}

/**
 * Express or Restify Response object.
 */
export interface WebResponse {
    end(...args: any[]): any;
    send(body: any): any;
    status(status: number): any;
}

/**
 * Settings used to configure a `BotFrameworkAdapter` instance.
 */
export interface BotFrameworkAdapterSettings {
    /**
     * ID assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).
     */
    appId: string;

    /**
     * Password assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).
     */
    appPassword: string;
    /**
     * (Optional) The OAuth API Endpoint for your bot to use.
     */
    oAuthEndpoint?: string;
    /**
     * (Optional) The Open ID Metadata Endpoint for your bot to use.
     */
    openIdMetadata?: string;
    /**
     * (Optional) The channel service option for this bot to validate connections from Azure or other channel locations
     */
    channelService?: string;
}

/**
 * Response object expected to be sent in response to an `invoke` activity.
 */
export interface InvokeResponse {
    /**
     * Status code to return for response.
     */
    status: number;

    /**
     * (Optional) body to return for response.
     */
    body?: any;
}

// Retrieve additional information, i.e., host operating system, host OS release, architecture, Node.js version
const ARCHITECTURE: any = os.arch();
const TYPE: any = os.type();
const RELEASE: any = os.release();
const NODE_VERSION: any = process.version;

// tslint:disable-next-line:no-var-requires no-require-imports
const pjson: any = require('../package.json');
const USER_AGENT: string = `Microsoft-BotFramework/3.1 BotBuilder/${pjson.version} ` +
    `(Node.js,Version=${NODE_VERSION}; ${TYPE} ${RELEASE}; ${ARCHITECTURE})`;
const OAUTH_ENDPOINT: string = 'https://api.botframework.com';
const US_GOV_OAUTH_ENDPOINT: string = 'https://api.botframework.azure.us';
const INVOKE_RESPONSE_KEY: symbol = Symbol('invokeResponse');

/**
 * A BotAdapter class that connects your bot to Bot Framework channels and the Emulator.
 *
 * @remarks
 * Use this adapter to connect your bot to the Bot Framework service, through which
 * your bot can reach many chat channels like Skype, Slack, and Teams. This adapter
 * also allows your bot to work with the Bot Framework Emulator, which simulates
 * the Bot Framework service and provides a chat interface for testing and debugging.
 *
 * The following example shows the typical adapter setup:
 *
 * ```JavaScript
 * const { BotFrameworkAdapter } = require('botbuilder');
 *
 * const adapter = new BotFrameworkAdapter({
 *    appId: process.env.MICROSOFT_APP_ID,
 *    appPassword: process.env.MICROSOFT_APP_PASSWORD
 * });
 * ```
 */
export class BotFrameworkAdapter extends BotAdapter {
    protected readonly credentials: MicrosoftAppCredentials;
    protected readonly credentialsProvider: SimpleCredentialProvider;
    protected readonly settings: BotFrameworkAdapterSettings;
    private isEmulatingOAuthCards: boolean;

    /**
     * Creates a new BotFrameworkAdapter instance.
     *
     * @remarks
     * Settings for this adapter include:
     * ```javascript
     * {
     *      "appId": "ID assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).",
     *      "appPassword": "Password assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).",
     *      "openIdMetadata": "The Open ID Metadata Endpoint for your bot to use.",
     *      "oAuthEndpoint": "The OAuth API Endpoint for your bot to use.",
     *      "channelService": "(Optional) The channel service option for this bot to validate connections from Azure or other channel locations"
     *  }
     * ```
     * @param settings (optional) configuration settings for the adapter.
     */
    constructor(settings?: Partial<BotFrameworkAdapterSettings>) {
        super();
        this.settings = { appId: '', appPassword: '', ...settings };
        this.credentials = new MicrosoftAppCredentials(this.settings.appId, this.settings.appPassword || '');
        this.credentialsProvider = new SimpleCredentialProvider(this.credentials.appId, this.credentials.appPassword);
        this.isEmulatingOAuthCards = false;
        if (this.settings.openIdMetadata) {
            ChannelValidation.OpenIdMetadataEndpoint = this.settings.openIdMetadata;
        }
        if (JwtTokenValidation.isGovernment(this.settings.channelService)) {
            this.credentials.oAuthEndpoint = GovernmentConstants.ToChannelFromBotLoginUrl;
            this.credentials.oAuthScope = GovernmentConstants.ToChannelFromBotOAuthScope;
        }
    }

    /**
     * Resume a conversation with a user, possibly after some time has gone by.
     *
     * @remarks
     * This is often referred to as the bot's "Proactive Messaging" flow as it lets the bot proactively
     * send messages to a conversation or user without having to reply directly to an incoming message.
     * Scenarios like sending notifications or coupons to a user are enabled by this method.
     *
     * In order to use this method, a ConversationReference must first be extracted from an incoming
     * activity. This reference can be stored in a database and used to resume the conversation at a later time.
     * The reference can be created from any incoming activity using `TurnContext.getConversationReference(context.activity)`.
     *
     * The processing steps for this method are very similar to [processActivity()](#processactivity)
     * in that a `TurnContext` will be created which is then routed through the adapters middleware
     * before calling the passed in logic handler. The key difference is that since an activity
     * wasn't actually received from outside, it has to be created by the bot.  The created activity will have its address
     * related fields populated but will have a `context.activity.type === undefined`.
     *
     * ```JavaScript
     * server.post('/api/notifyUser', async (req, res) => {
     *    // Lookup previously saved conversation reference
     *    const reference = await findReference(req.body.refId);
     *
     *    // Proactively notify the user
     *    if (reference) {
     *       await adapter.continueConversation(reference, async (context) => {
     *          await context.sendActivity(req.body.message);
     *       });
     *       res.send(200);
     *    } else {
     *       res.send(404);
     *    }
     * });
     * ```
     * @param reference A `ConversationReference` saved during a previous incoming activity.
     * @param logic A function handler that will be called to perform the bots logic after the the adapters middleware has been run.
     */
    public async continueConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promise<void>): Promise<void> {
        const request: Partial<Activity> = TurnContext.applyConversationReference(
            { type: 'event', name: 'continueConversation' },
            reference,
            true
        );
        const context: TurnContext = this.createContext(request);

        await this.runMiddleware(context, logic as any);
    }

    /**
     * Starts a new conversation with a user. This is typically used to Direct Message (DM) a member
     * of a group.
     *
     * @remarks
     * This function creates a new conversation between the bot and a single user, as specified by
     * the ConversationReference passed in. In multi-user chat environments, this typically means
     * starting a 1:1 direct message conversation with a single user. If called on a reference
     * already representing a 1:1 conversation, the new conversation will continue to be 1:1.
     *
     * * In order to use this method, a ConversationReference must first be extracted from an incoming
     * activity. This reference can be stored in a database and used to resume the conversation at a later time.
     * The reference can be created from any incoming activity using `TurnContext.getConversationReference(context.activity)`.
     *
     * The processing steps for this method are very similar to [processActivity()](#processactivity)
     * in that a `TurnContext` will be created which is then routed through the adapters middleware
     * before calling the passed in logic handler. The key difference is that since an activity
     * wasn't actually received from outside, it has to be created by the bot.  The created activity will have its address
     * related fields populated but will have a `context.activity.type === undefined`..
     *
     * ```JavaScript
     * // Get group members conversation reference
     * const reference = TurnContext.getConversationReference(context.activity);
     *
     * // Start a new conversation with the user
     * await adapter.createConversation(reference, async (ctx) => {
     *    await ctx.sendActivity(`Hi (in private)`);
     * });
     * ```
     * @param reference A `ConversationReference` of the user to start a new conversation with.
     * @param logic A function handler that will be called to perform the bot's logic after the the adapters middleware has been run.
     */
    public async createConversation(reference: Partial<ConversationReference>, logic?: (context: TurnContext) => Promise<void>): Promise<void> {
        if (!reference.serviceUrl) { throw new Error(`BotFrameworkAdapter.createConversation(): missing serviceUrl.`); }

        // Create conversation
        const parameters: ConversationParameters = { bot: reference.bot, members: [reference.user] } as ConversationParameters;
        const client: ConnectorClient = this.createConnectorClient(reference.serviceUrl);
        const response = await client.conversations.createConversation(parameters);

        // Initialize request and copy over new conversation ID and updated serviceUrl.
        const request: Partial<Activity> = TurnContext.applyConversationReference(
            { type: 'event', name: 'createConversation' },
            reference,
            true
        );
        request.conversation = { id: response.id } as ConversationAccount;
        if (response.serviceUrl) { request.serviceUrl = response.serviceUrl; }

        // Create context and run middleware
        const context: TurnContext = this.createContext(request);
        await this.runMiddleware(context, logic as any);
    }

    /**
     * Deletes an activity that was previously sent to a channel.
     *
     * @remarks
     * Calling `TurnContext.deleteActivity()` is the preferred way of deleting activities (rather than calling it directly from the adapter), as that
     * will ensure that any interested middleware will be notified.
     *
     * > [!TIP]
     * > Note: Not all chat channels support this method. Calling it on an unsupported channel may result in an error.
     * @param context Context for the current turn of conversation with the user.
     * @param reference Conversation reference information for the activity being deleted.
     */
    public async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        if (!reference.serviceUrl) { throw new Error(`BotFrameworkAdapter.deleteActivity(): missing serviceUrl`); }
        if (!reference.conversation || !reference.conversation.id) {
            throw new Error(`BotFrameworkAdapter.deleteActivity(): missing conversation or conversation.id`);
        }
        if (!reference.activityId) { throw new Error(`BotFrameworkAdapter.deleteActivity(): missing activityId`); }
        const client: ConnectorClient = this.createConnectorClient(reference.serviceUrl);
        await client.conversations.deleteActivity(reference.conversation.id, reference.activityId);
    }

    /**
     * Deletes a member from the current conversation.
     *
     * @remarks
     * Remove a member's identity information from the conversation.
     *
     * Note that this method does not apply to all channels.
     * @param context Context for the current turn of conversation with the user.
     * @param memberId ID of the member to delete from the conversation.
     */
    public async deleteConversationMember(context: TurnContext, memberId: string): Promise<void> {
        if (!context.activity.serviceUrl) { throw new Error(`BotFrameworkAdapter.deleteConversationMember(): missing serviceUrl`); }
        if (!context.activity.conversation || !context.activity.conversation.id) {
            throw new Error(`BotFrameworkAdapter.deleteConversationMember(): missing conversation or conversation.id`);
        }
        const serviceUrl: string = context.activity.serviceUrl;
        const conversationId: string = context.activity.conversation.id;
        const client: ConnectorClient = this.createConnectorClient(serviceUrl);
        await client.conversations.deleteConversationMember(conversationId, memberId);
    }

    /**
     * Lists the members of a given activity as specified in a TurnContext.
     *
     * @remarks
     * Returns an array of ChannelAccount objects representing the users involved in a given activity.
     *
     * This is different from `getConversationMembers()` in that it will return only those users
     * directly involved in the activity, not all members of the conversation.
     * @param context Context for the current turn of conversation with the user.
     * @param activityId (Optional) activity ID to enumerate. If not specified the current activities ID will be used.
     */
    public async getActivityMembers(context: TurnContext, activityId?: string): Promise<ChannelAccount[]> {
        if (!activityId) { activityId = context.activity.id; }
        if (!context.activity.serviceUrl) { throw new Error(`BotFrameworkAdapter.getActivityMembers(): missing serviceUrl`); }
        if (!context.activity.conversation || !context.activity.conversation.id) {
            throw new Error(`BotFrameworkAdapter.getActivityMembers(): missing conversation or conversation.id`);
        }
        if (!activityId) {
            throw new Error(`BotFrameworkAdapter.getActivityMembers(): missing both activityId and context.activity.id`);
        }
        const serviceUrl: string = context.activity.serviceUrl;
        const conversationId: string = context.activity.conversation.id;
        const client: ConnectorClient = this.createConnectorClient(serviceUrl);

        return await client.conversations.getActivityMembers(conversationId, activityId);
    }

    /**
     * Lists the members of the current conversation as specified in a TurnContext.
     *
     * @remarks
     * Returns an array of ChannelAccount objects representing the users currently involved in the conversation
     * in which an activity occured.
     *
     * This is different from `getActivityMembers()` in that it will return all
     * members of the conversation, not just those directly involved in the activity.
     * @param context Context for the current turn of conversation with the user.
     */
    public async getConversationMembers(context: TurnContext): Promise<ChannelAccount[]> {
        if (!context.activity.serviceUrl) { throw new Error(`BotFrameworkAdapter.getConversationMembers(): missing serviceUrl`); }
        if (!context.activity.conversation || !context.activity.conversation.id) {
            throw new Error(`BotFrameworkAdapter.getConversationMembers(): missing conversation or conversation.id`);
        }
        const serviceUrl: string = context.activity.serviceUrl;
        const conversationId: string = context.activity.conversation.id;
        const client: ConnectorClient = this.createConnectorClient(serviceUrl);

        return await client.conversations.getConversationMembers(conversationId);
    }

    /**
     * Lists the Conversations in which this bot has participated for a given channel server.
     *
     * @remarks
     * The channel server returns results in pages and each page will include a `continuationToken`
     * that can be used to fetch the next page of results from the server.
     * @param contextOrServiceUrl The URL of the channel server to query or a TurnContext.  This can be retrieved from `context.activity.serviceUrl`.
     * @param continuationToken (Optional) token used to fetch the next page of results from the channel server. This should be left as `undefined` to retrieve the first page of results.
     */
    public async getConversations(contextOrServiceUrl: TurnContext | string, continuationToken?: string): Promise<ConversationsResult> {
        const url: string = typeof contextOrServiceUrl === 'object' ? contextOrServiceUrl.activity.serviceUrl : contextOrServiceUrl;
        const client: ConnectorClient = this.createConnectorClient(url);

        return await client.conversations.getConversations(continuationToken ? { continuationToken: continuationToken } : undefined);
    }

    /**
     * Retrieves the OAuth token for a user that is in a sign-in flow.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param magicCode (Optional) Optional user entered code to validate.
     */
    public async getUserToken(context: TurnContext, connectionName: string, magicCode?: string): Promise<TokenApiModels.TokenResponse> {
        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(`BotFrameworkAdapter.getUserToken(): missing from or from.id`);
        }
        this.checkEmulatingOAuthCards(context);
        const userId: string = context.activity.from.id;
        const url: string = this.oauthApiUrl(context);
        const client: TokenApiClient = this.createTokenApiClient(url);

        const result: TokenApiModels.UserTokenGetTokenResponse = await client.userToken.getToken(userId, connectionName, { code: magicCode });
        if (!result || !result.token || result._response.status == 404) {
            return undefined;
        } else {
            return result;
        }
    }

    /**
     * Signs the user out with the token server.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     */
    public async signOutUser(context: TurnContext, connectionName: string): Promise<void> {
        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(`BotFrameworkAdapter.signOutUser(): missing from or from.id`);
        }
        this.checkEmulatingOAuthCards(context);
        const userId: string = context.activity.from.id;
        const url: string = this.oauthApiUrl(context);
        const client: TokenApiClient = this.createTokenApiClient(url);
        await client.userToken.signOut(userId, { connectionName: connectionName } );
    }

    /**
     * Gets a signin link from the token server that can be sent as part of a SigninCard.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     */
    public async getSignInLink(context: TurnContext, connectionName: string): Promise<string> {
        this.checkEmulatingOAuthCards(context);
        const conversation: Partial<ConversationReference> = TurnContext.getConversationReference(context.activity);
        const url: string = this.oauthApiUrl(context);
        const client: TokenApiClient = this.createTokenApiClient(url);
        const state: any = {
            ConnectionName: connectionName,
            Conversation: conversation,
            MsAppId: (client.credentials as MicrosoftAppCredentials).appId
        };

        const finalState: string = Buffer.from(JSON.stringify(state)).toString('base64');
        return (await client.botSignIn.getSignInUrl(finalState, null))._response.bodyAsText;
    }

    /**
     * Signs the user out with the token server.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     */
    public async getAadTokens(context: TurnContext, connectionName: string, resourceUrls: string[]): Promise<{
        [propertyName: string]: TokenApiModels.TokenResponse;
    }> {
        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(`BotFrameworkAdapter.getAadTokens(): missing from or from.id`);
        }
        this.checkEmulatingOAuthCards(context);
        const userId: string = context.activity.from.id;
        const url: string = this.oauthApiUrl(context);
        const client: TokenApiClient = this.createTokenApiClient(url);

        return (await client.userToken.getAadTokens(userId, connectionName, { resourceUrls: resourceUrls }))._response.parsedBody;
    }

    /**
     * Tells the token service to emulate the sending of OAuthCards for a channel.
     * @param contextOrServiceUrl The URL of the emulator.
     * @param emulate If `true` the emulator will emulate the sending of OAuthCards.
     */
    public async emulateOAuthCards(contextOrServiceUrl: TurnContext | string, emulate: boolean): Promise<void> {
        this.isEmulatingOAuthCards = emulate;
        const url: string = this.oauthApiUrl(contextOrServiceUrl);
        await EmulatorApiClient.emulateOAuthCards(this.credentials as MicrosoftAppCredentials,  url, emulate);
    }

    /**
     * Processes an incoming request received by the bots web server into a TurnContext.
     *
     * @remarks
     * This method is the main way a bot receives incoming messages.
     *
     * This method takes a raw incoming request object from a webserver and processes it into a
     * normalized TurnContext that can be used by the bot. This includes any messages sent from a
     * user and is the method that drives what is often referred to as the bot's "Reactive Messaging"
     * flow.
     *
     * The following steps will be taken to process the activity:
     *
     * - The identity of the sender will be verified to be either the Emulator or a valid Microsoft
     *   server. The bots `appId` and `appPassword` will be used during this process and the request
     *   will be rejected if the senders identity can't be verified.
     * - The activity will be parsed from the body of the incoming request. An error will be returned
     *   if the activity can't be parsed.
     * - A `TurnContext` instance will be created for the received activity and wrapped with a
     *   [Revocable Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/revocable).
     * - The context will be routed through any middleware registered with the adapter using
     *   [use()](#use).  Middleware is executed in the order in which it's added and any middleware
     *   can intercept or prevent further routing of the context by simply not calling the passed
     *   in `next()` function. This is called the "Leading Edge" of the request; middleware will
     *   get a second chance to run on the "Trailing Edge" of the request after the bots logic has run.
     * - Assuming the context hasn't been intercepted by a piece of middleware, the context will be
     *   passed to the logic handler passed in.  The bot may perform additional routing or
     *   processing at this time. Returning a promise (or providing an `async` handler) will cause the
     *   adapter to wait for any asynchronous operations to complete.
     * - Once the bot's logic completes, the promise chain set up by the middleware stack will be resolved,
     *   giving middleware a second chance to run on the "Trailing Edge" of the request.
     * - After the middleware stack's promise chain has been fully resolved the context object will be
     *   `revoked()` and any future calls to the context will result in a `TypeError: Cannot perform
     *   'set' on a proxy that has been revoked` being thrown.
     *
     * > [!TIP]
     * > Note: If you see the error `TypeError: Cannot perform 'set' on a proxy that has been revoked`
     * > appearing in your bot's console output, the likely cause is that an async function was used
     * > without using the `await` keyword. Make sure all async functions use await!
     *
     * ```JavaScript
     * server.post('/api/messages', (req, res) => {
     *    // Route received request to adapter for processing
     *    adapter.processActivity(req, res, async (context) => {
     *        // Process any messages received
     *        if (context.activity.type === ActivityTypes.Message) {
     *            await context.sendActivity(`Hello World`);
     *        }
     *    });
     * });
     * ```
     * @param req An Express or Restify style Request object.
     * @param res An Express or Restify style Response object.
     * @param logic A function handler that will be called to perform the bots logic after the received activity has been pre-processed by the adapter and routed through any middleware for processing.
     */
    public async processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {
        let body: any;
        let status: number;
        try {
            // Parse body of request
            status = 400;
            const request = await parseRequest(req);

            // Authenticate the incoming request
            status = 401;
            const authHeader: string = req.headers.authorization || req.headers.Authorization || '';
            await this.authenticateRequest(request, authHeader);

            // Process received activity
            status = 500;
            const context: TurnContext = this.createContext(request);
            await this.runMiddleware(context, logic);

            // Retrieve cached invoke response.
            if (request.type === ActivityTypes.Invoke) {
                const invokeResponse: any = context.turnState.get(INVOKE_RESPONSE_KEY);
                if (invokeResponse && invokeResponse.value) {
                    const value: InvokeResponse = invokeResponse.value;
                    status = value.status;
                    body = value.body;
                } else {
                    status = 501;
                }
            } else {
                status = 200;
            }
        } catch (err) {
            body = err.toString();
        }

        // Return status 
        res.status(status);
        if (body) { res.send(body) }
        res.end();

        // Check for an error
        if (status >= 400) {
            console.warn(`BotFrameworkAdapter.processActivity(): ${status} ERROR - ${body.toString()}`);
            throw new Error(body.toString());
        }
    }

    /**
     * Sends a set of outgoing activities to the appropriate channel server.
     *
     * @remarks
     * The activities will be sent one after another in the order in which they're received. A response object will be returned for each
     * sent activity. For `message` activities this will contain the id of the delivered message.
     *
     * Instead of calling these methods directly on the adapter, calling `TurnContext.sendActivities()` or `TurnContext.sendActivity()`
     * is the preferred way of sending activities as that will ensure that outgoing activities have been properly addressed
     * and that any interested middleware has been notified.
     *
     * The primary scenario for calling this method directly is when you want to explicitly bypass
     * going through any middleware. For instance, sending the `typing` activity might
     * be a good reason to call this method directly as those activities are unlikely to require
     * handling by middleware.
     * @param context Context for the current turn of conversation with the user.
     * @param activities List of activities to send.
     */
    public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const responses: ResourceResponse[] = [];
        for (let i = 0; i < activities.length; i++) {
            const activity: Partial<Activity> = activities[i];
            switch (activity.type) {
                case 'delay':
                    await delay(typeof activity.value === 'number' ? activity.value : 1000);
                    responses.push({} as ResourceResponse);
                    break;
                case 'invokeResponse':
                    // Cache response to context object. This will be retrieved when turn completes.
                    context.turnState.set(INVOKE_RESPONSE_KEY, activity);
                    responses.push({} as ResourceResponse);
                    break;
                default:
                    if (!activity.serviceUrl) { throw new Error(`BotFrameworkAdapter.sendActivity(): missing serviceUrl.`); }
                    if (!activity.conversation || !activity.conversation.id) {
                        throw new Error(`BotFrameworkAdapter.sendActivity(): missing conversation id.`);
                    }
                    const client: ConnectorClient = this.createConnectorClient(activity.serviceUrl);
                    if (activity.type === 'trace' && activity.channelId !== 'emulator') {
                        // Just eat activity
                        responses.push({} as ResourceResponse);
                    } else if (activity.replyToId) {
                        responses.push(await client.conversations.replyToActivity(
                            activity.conversation.id,
                            activity.replyToId,
                            activity as Activity
                        ));
                    } else {
                        responses.push(await client.conversations.sendToConversation(
                            activity.conversation.id,
                            activity as Activity
                        ));
                    }
                    break;
            }
        }
        return responses;
    }

    /**
     * Replaces an activity that was previously sent to a channel with an updated version.
     *
     * @remarks
     * Calling `TurnContext.updateActivity()` is the preferred way of updating activities (rather than calling it directly from the adapter) as that
     * will ensure that any interested middleware has been notified.
     *
     * It should be noted that not all channels support this feature.
     * @param context Context for the current turn of conversation with the user.
     * @param activity New activity to replace a current activity with.
     */
    public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        if (!activity.serviceUrl) { throw new Error(`BotFrameworkAdapter.updateActivity(): missing serviceUrl`); }
        if (!activity.conversation || !activity.conversation.id) {
            throw new Error(`BotFrameworkAdapter.updateActivity(): missing conversation or conversation.id`);
        }
        if (!activity.id) { throw new Error(`BotFrameworkAdapter.updateActivity(): missing activity.id`); }
        const client: ConnectorClient = this.createConnectorClient(activity.serviceUrl);
        await client.conversations.updateActivity(
            activity.conversation.id,
            activity.id,
            activity as Activity
        );
    }

    /**
     * Allows for the overriding of authentication in unit tests.
     * @param request Received request.
     * @param authHeader Received authentication header.
     */
    protected async authenticateRequest(request: Partial<Activity>, authHeader: string): Promise<void> {
        const claims = await JwtTokenValidation.authenticateRequest(
            request as Activity, authHeader,
            this.credentialsProvider,
            this.settings.channelService
        );
        if (!claims.isAuthenticated) { throw new Error('Unauthorized Access. Request is not authorized'); }
    }

    /**
     * Allows for mocking of the connector client in unit tests.
     * @param serviceUrl Clients service url.
     */
    protected createConnectorClient(serviceUrl: string): ConnectorClient {
        const client: ConnectorClient = new ConnectorClient(this.credentials, { baseUri: serviceUrl} );
        client.addUserAgentInfo(USER_AGENT);

        return client;
    }

    /**
     * Allows for mocking of the OAuth API Client in unit tests.
     * @param serviceUrl Clients service url.
     */
    protected createTokenApiClient(serviceUrl: string): TokenApiClient {
        const client = new TokenApiClient(this.credentials, { baseUri: serviceUrl} );
        client.addUserAgentInfo(USER_AGENT);
        return client;
    }

    /**
     * Allows for mocking of the OAuth Api URL in unit tests.
     * @param contextOrServiceUrl The URL of the channel server to query or a TurnContext.  This can be retrieved from `context.activity.serviceUrl`.
     */
    protected oauthApiUrl(contextOrServiceUrl: TurnContext | string): string {
        return this.isEmulatingOAuthCards ?
            (typeof contextOrServiceUrl === 'object' ? contextOrServiceUrl.activity.serviceUrl : contextOrServiceUrl) :
            (this.settings.oAuthEndpoint ? this.settings.oAuthEndpoint : 
                JwtTokenValidation.isGovernment(this.settings.channelService) ?
                US_GOV_OAUTH_ENDPOINT : OAUTH_ENDPOINT);
    }

    /**
     * Allows for mocking of toggling the emulating OAuthCards in unit tests.
     * @param context The TurnContext
     */
    protected checkEmulatingOAuthCards(context: TurnContext): void {
        if (!this.isEmulatingOAuthCards &&
            context.activity.channelId === 'emulator' &&
            (!this.credentials.appId || !this.credentials.appPassword)) {
            this.isEmulatingOAuthCards = true;
        }
    }

    /**
     * Allows for the overriding of the context object in unit tests and derived adapters.
     * @param request Received request.
     */
    protected createContext(request: Partial<Activity>): TurnContext {
        return new TurnContext(this as any, request);
    }
}

/**
 * Handle incoming webhooks from the botframework
 * @private
 * @param req incoming web request
 */
function parseRequest(req: WebRequest): Promise<Activity> {
    return new Promise((resolve: any, reject: any): void => {
        function returnActivity(activity: Activity): void {
            if (typeof activity !== 'object') { throw new Error(`BotFrameworkAdapter.parseRequest(): invalid request body.`); }
            if (typeof activity.type !== 'string') { throw new Error(`BotFrameworkAdapter.parseRequest(): missing activity type.`); }
            if (typeof activity.timestamp === 'string') { activity.timestamp = new Date(activity.timestamp); }
            if (typeof activity.localTimestamp === 'string') { activity.localTimestamp = new Date(activity.localTimestamp); }
            if (typeof activity.expiration === 'string') { activity.expiration = new Date(activity.expiration); }
            resolve(activity);
        }

        if (req.body) {
            try {
                returnActivity(req.body);
            } catch (err) {
                reject(err);
            }
        } else {
            let requestData: string = '';
            req.on('data', (chunk: string) => {
                requestData += chunk;
            });
            req.on('end', () => {
                try {
                    req.body = JSON.parse(requestData);
                    returnActivity(req.body);
                } catch (err) {
                    reject(err);
                }
            });
        }
    });
}

function delay(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, timeout);
    });
}