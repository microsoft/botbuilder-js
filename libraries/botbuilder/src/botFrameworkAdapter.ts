/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    ClaimsIdentity,
    ConnectorClient,
    JwtTokenValidation,
    MicrosoftAppCredentials,
    OAuthApiClient,
    SimpleCredentialProvider,
    ChannelValidation
} from 'botframework-connector';

import {
    Activity,
    ActivityTypes,
    BotAdapter,
    ChannelAccount,
    ConversationAccount,
    ConversationParameters,
    ConversationReference,
    ConversationResourceResponse,
    ConversationsResult,
    ResourceResponse,
    TokenResponse,
    TokenResponseMap,
    TurnContext
} from 'botbuilder-core';

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
     * The OAuth API Endpoint for your bot to use.
     */
    oAuthEndpoint?: string;
    /**
     * The Open ID Metadata Endpoint for your bot to use.
     */
    openIdMetadata?: string;
    /**
     * The optional channel service option for this bot to validate connections from Azure or other channel locations
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
const USER_AGENT: string = `Microsoft-BotFramework/3.1 BotBuilder/${ pjson.version } ` +
    `(Node.js,Version=${ NODE_VERSION }; ${ TYPE } ${ RELEASE }; ${ ARCHITECTURE })`;
const OAUTH_ENDPOINT: string = 'https://api.botframework.com';
const INVOKE_RESPONSE_KEY: symbol = Symbol('invokeResponse');

/**
 * BotAdapter class needed to communicate with a Bot Framework channel or the Emulator.
 *
 * @remarks
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
     * @param settings (optional) configuration settings for the adapter.
     */
    constructor(settings?: Partial<BotFrameworkAdapterSettings>) {
        super();
        this.settings = { appId: '', appPassword: '', ...settings};
        this.credentials = new MicrosoftAppCredentials(this.settings.appId, this.settings.appPassword || '');
        this.credentialsProvider = new SimpleCredentialProvider(this.credentials.appId, this.credentials.appPassword);
        this.isEmulatingOAuthCards = false;
        if (this.settings.openIdMetadata) {
            ChannelValidation.OpenIdMetadataEndpoint = this.settings.openIdMetadata;
        }
    }

    /**
     * Continues a conversation with a user. This is often referred to as the bots "Proactive Messaging"
     * flow as its lets the bot proactively send messages to a conversation or user that its already
     * communicated with. Scenarios like sending notifications or coupons to a user are enabled by this
     * method.
     *
     * @remarks
     * The processing steps for this method are very similar to [processActivity()](#processactivity)
     * in that a `TurnContext` will be created which is then routed through the adapters middleware
     * before calling the passed in logic handler. The key difference being that since an activity
     * wasn't actually received it has to be created.  The created activity will have its address
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
     * @param reference A `ConversationReference` saved during a previous message from a user.  This can be calculated for any incoming activity using `TurnContext.getConversationReference(context.activity)`.
     * @param logic A function handler that will be called to perform the bots logic after the the adapters middleware has been run.
     */
    public continueConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promise<void>): Promise<void> {
        const request: Partial<Activity> = TurnContext.applyConversationReference(
            {type: 'event',  name: 'continueConversation' },
            reference,
            true
        );
        const context: TurnContext = this.createContext(request);

        return this.runMiddleware(context, logic as any);
    }

    /**
     * Starts a new conversation with a user. This is typically used to Direct Message (DM) a member
     * of a group.
     *
     * @remarks
     * The processing steps for this method are very similar to [processActivity()](#processactivity)
     * in that a `TurnContext` will be created which is then routed through the adapters middleware
     * before calling the passed in logic handler. The key difference being that since an activity
     * wasn't actually received it has to be created.  The created activity will have its address
     * related fields populated but will have a `context.activity.type === undefined`.
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
     * @param reference A `ConversationReference` of the user to start a new conversation with.  This can be calculated for any incoming activity using `TurnContext.getConversationReference(context.activity)`.
     * @param logic A function handler that will be called to perform the bots logic after the the adapters middleware has been run.
     */
    public createConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promise<void>): Promise<void> {
        try {
            if (!reference.serviceUrl) { throw new Error(`BotFrameworkAdapter.createConversation(): missing serviceUrl.`); }

            // Create conversation
            const parameters: ConversationParameters = { bot: reference.bot } as ConversationParameters;
            const client: ConnectorClient = this.createConnectorClient(reference.serviceUrl);

            return client.conversations.createConversation(parameters).then((response: ConversationResourceResponse) => {
                // Initialize request and copy over new conversation ID and updated serviceUrl.
                const request: Partial<Activity> = TurnContext.applyConversationReference(
                    {type: 'event', name: 'createConversation' },
                    reference,
                    true
                );
                request.conversation = { id: response.id } as ConversationAccount;
                if (response.serviceUrl) { request.serviceUrl = response.serviceUrl; }

                // Create context and run middleware
                const context: TurnContext = this.createContext(request);

                return this.runMiddleware(context, logic as any);
            });
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Deletes an activity that was previously sent to a channel. It should be noted that not all
     * channels support this feature.
     *
     * @remarks
     * Calling `TurnContext.deleteActivity()` is the preferred way of deleting activities as that
     * will ensure that any interested middleware has been notified.
     * @param context Context for the current turn of conversation with the user.
     * @param reference Conversation reference information for the activity being deleted.
     */
    public deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        try {
            if (!reference.serviceUrl) { throw new Error(`BotFrameworkAdapter.deleteActivity(): missing serviceUrl`); }
            if (!reference.conversation || !reference.conversation.id) {
                throw new Error(`BotFrameworkAdapter.deleteActivity(): missing conversation or conversation.id`);
            }
            if (!reference.activityId) { throw new Error(`BotFrameworkAdapter.deleteActivity(): missing activityId`); }
            const client: ConnectorClient = this.createConnectorClient(reference.serviceUrl);

            return client.conversations.deleteActivity(reference.conversation.id, reference.activityId);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Deletes a member from the current conversation.
     * @param context Context for the current turn of conversation with the user.
     * @param memberId ID of the member to delete from the conversation.
     */
    public deleteConversationMember(context: TurnContext, memberId: string): Promise<void> {
        try {
            if (!context.activity.serviceUrl) { throw new Error(`BotFrameworkAdapter.deleteConversationMember(): missing serviceUrl`); }
            if (!context.activity.conversation || !context.activity.conversation.id) {
                throw new Error(`BotFrameworkAdapter.deleteConversationMember(): missing conversation or conversation.id`);
            }
            const serviceUrl: string = context.activity.serviceUrl;
            const conversationId: string = context.activity.conversation.id;
            const client: ConnectorClient = this.createConnectorClient(serviceUrl);

            return client.conversations.deleteConversationMember(conversationId, memberId);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Lists the members of a given activity.
     * @param context Context for the current turn of conversation with the user.
     * @param activityId (Optional) activity ID to enumerate. If not specified the current activities ID will be used.
     */
    public getActivityMembers(context: TurnContext, activityId?: string): Promise<ChannelAccount[]> {
        try {
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

            return client.conversations.getActivityMembers(conversationId, activityId);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Lists the members of the current conversation.
     * @param context Context for the current turn of conversation with the user.
     */
    public getConversationMembers(context: TurnContext): Promise<ChannelAccount[]> {
        try {
            if (!context.activity.serviceUrl) { throw new Error(`BotFrameworkAdapter.getConversationMembers(): missing serviceUrl`); }
            if (!context.activity.conversation || !context.activity.conversation.id) {
                throw new Error(`BotFrameworkAdapter.getConversationMembers(): missing conversation or conversation.id`);
            }
            const serviceUrl: string = context.activity.serviceUrl;
            const conversationId: string = context.activity.conversation.id;
            const client: ConnectorClient = this.createConnectorClient(serviceUrl);

            return client.conversations.getConversationMembers(conversationId);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Lists the Conversations in which this bot has participated for a given channel server. The
     * channel server returns results in pages and each page will include a `continuationToken`
     * that can be used to fetch the next page of results from the server.
     * @param contextOrServiceUrl The URL of the channel server to query or a TurnContext.  This can be retrieved from `context.activity.serviceUrl`.
     * @param continuationToken (Optional) token used to fetch the next page of results from the channel server. This should be left as `undefined` to retrieve the first page of results.
     */
    public getConversations(contextOrServiceUrl: TurnContext|string, continuationToken?: string): Promise<ConversationsResult> {
        const url: string = typeof contextOrServiceUrl === 'object' ? contextOrServiceUrl.activity.serviceUrl : contextOrServiceUrl;
        const client: ConnectorClient = this.createConnectorClient(url);

        return client.conversations.getConversations(continuationToken ? { continuationToken: continuationToken } : undefined);
    }

    /**
     * Attempts to retrieve the token for a user that's in a signin flow.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param magicCode (Optional) Optional user entered code to validate.
     */
    public getUserToken(context: TurnContext, connectionName: string, magicCode?: string): Promise<TokenResponse> {
        try {
            if (!context.activity.from || !context.activity.from.id) {
                throw new Error(`BotFrameworkAdapter.getUserToken(): missing from or from.id`);
            }
            this.checkEmulatingOAuthCards(context);
            const userId: string = context.activity.from.id;
            const url: string = this.oauthApiUrl(context);
            const client: OAuthApiClient = this.createOAuthApiClient(url);

            return client.getUserToken(userId, connectionName, magicCode);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Signs the user out with the token server.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     */
    public signOutUser(context: TurnContext, connectionName: string): Promise<void> {
        try {
            if (!context.activity.from || !context.activity.from.id) {
                throw new Error(`BotFrameworkAdapter.signOutUser(): missing from or from.id`);
            }
            this.checkEmulatingOAuthCards(context);
            const userId: string = context.activity.from.id;
            const url: string = this.oauthApiUrl(context);
            const client: OAuthApiClient = this.createOAuthApiClient(url);

            return client.signOutUser(userId, connectionName);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Gets a signin link from the token server that can be sent as part of a SigninCard.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     */
    public getSignInLink(context: TurnContext, connectionName: string): Promise<string> {
        this.checkEmulatingOAuthCards(context);
        const conversation: Partial<ConversationReference> = TurnContext.getConversationReference(context.activity);
        const url: string = this.oauthApiUrl(context);
        const client: OAuthApiClient = this.createOAuthApiClient(url);

        return client.getSignInLink(conversation as ConversationReference, connectionName);
    }

        /**
     * Signs the user out with the token server.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     */
    public getAadTokens(context: TurnContext, connectionName: string, resourceUrls: string[]): Promise<TokenResponseMap> {
        try {
            if (!context.activity.from || !context.activity.from.id) {
                throw new Error(`BotFrameworkAdapter.getAadTokens(): missing from or from.id`);
            }
            this.checkEmulatingOAuthCards(context);
            const userId: string = context.activity.from.id;
            const url: string = this.oauthApiUrl(context);
            const client: OAuthApiClient = this.createOAuthApiClient(url);

            return client.getAadTokens(userId, connectionName, { resourceUrls: resourceUrls });
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Tells the token service to emulate the sending of OAuthCards for a channel.
     * @param contextOrServiceUrl The URL of the channel server to query or a TurnContext.  This can be retrieved from `context.activity.serviceUrl`.
     * @param emulate If `true` the token service will emulate the sending of OAuthCards.
     */
    public emulateOAuthCards(contextOrServiceUrl: TurnContext|string, emulate: boolean): Promise<void> {
        this.isEmulatingOAuthCards = emulate;
        const url: string = this.oauthApiUrl(contextOrServiceUrl);
        const client: OAuthApiClient = this.createOAuthApiClient(url);

        return client.emulateOAuthCards(emulate);
    }

    /**
     * Processes an activity received by the bots web server. This includes any messages sent from a
     * user and is the method that drives what's often referred to as the bots "Reactive Messaging"
     * flow.
     *
     * @remarks
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
     *   in `next()` function. This is called the "Leading Edge" of the request and middleware will
     *   get a second chance to run on the "Trailing Edge" of the request after the bots logic has run.
     * - Assuming the context hasn't been intercepted by a piece of middleware, the context will be
     *   passed to the logic handler passed in.  The bot may perform an additional routing or
     *   processing at this time. Returning a promise (or providing an `async` handler) will cause the
     *   adapter to wait for any asynchronous operations to complete.
     * - Once the bots logic completes the promise chain setup by the middleware stack will be resolved
     *   giving middleware a second chance to run on the "Trailing Edge" of the request.
     * - After the middleware stacks promise chain has been fully resolved the context object will be
     *   `revoked()` and any future calls to the context will result in a `TypeError: Cannot perform
     *   'set' on a proxy that has been revoked` being thrown.
     *
     * ```JavaScript
     * server.post('/api/messages', (req, res) => {
     *    // Route received request to adapter for processing
     *    adapter.processActivity(req, res, async (context) => {
     *        // Process any messages received
     *        if (context.activity.type === 'message') {
     *            await context.sendActivity(`Hello World`);
     *        }
     *    });
     * });
     * ```
     * @param req An Express or Restify style Request object.
     * @param res An Express or Restify style Response object.
     * @param logic A function handler that will be called to perform the bots logic after the received activity has been pre-processed by the adapter and routed through any middleware for processing.
     */
    public processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {
        // Parse body of request
        let errorCode: number = 500;

        return parseRequest(req).then((request: Activity) => {
            // Authenticate the incoming request
            errorCode = 401;
            const authHeader: string = req.headers.authorization || '';

            return this.authenticateRequest(request, authHeader).then(() => {
                // Process received activity
                errorCode = 500;
                const context: TurnContext = this.createContext(request);

                return this.runMiddleware(context, logic as any)
                    .then(() => {
                        if (request.type === ActivityTypes.Invoke) {
                            // Retrieve cached invoke response.
                            const invokeResponse: any = context.turnState.get(INVOKE_RESPONSE_KEY);
                            if (invokeResponse && invokeResponse.value) {
                                const value: InvokeResponse = invokeResponse.value as InvokeResponse;
                                res.status(value.status);
                                res.send(value.body);
                                res.end();
                            } else {
                                throw new Error(`Bot failed to return a valid 'invokeResponse' activity.`);
                            }
                        } else {
                            res.status(202);
                            res.end();
                        }
                    });
            });
        }).catch((err: Error) => {
            // Reject response with error code
            console.warn(`BotFrameworkAdapter.processActivity(): ${errorCode} ERROR - ${err.toString()}`);
            res.status(errorCode);
            res.send(err.toString());
            res.end();
            throw err;
        });
    }

    /**
     * Sends a set of activities to a channels server(s). The activities will be sent one after
     * another in the order in which they're received.  A response object will be returned for each
     * sent activity. For `message` activities this will contain the ID of the delivered message.
     *
     * @remarks
     * Calling `TurnContext.sendActivities()` or `TurnContext.sendActivity()` is the preferred way of
     * sending activities as that will ensure that outgoing activities have been properly addressed
     * and that any interested middleware has been notified.
     *
     * The primary scenario for calling this method directly is when you want to explicitly bypass
     * going through any middleware. For instance, periodically sending a `typing` activity might
     * be a good reason to call this method directly as it would avoid any false signals from being
     * logged.
     * @param context Context for the current turn of conversation with the user.
     * @param activities List of activities to send.
     */
    public sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        return new Promise((resolve: any, reject: any): void => {
            const responses: ResourceResponse[] = [];
            const that: BotFrameworkAdapter = this;
            function next(i: number): void {
                if (i < activities.length) {
                    try {
                        const activity: Partial<Activity> = activities[i];
                        switch (activity.type) {
                            case 'delay':
                                setTimeout(
                                    () => {
                                    responses.push({} as ResourceResponse);
                                    next(i + 1);
                                    },
                                    typeof activity.value === 'number' ? activity.value : 1000
                                );
                                break;
                            case 'invokeResponse':
                                // Cache response to context object. This will be retrieved when turn completes.
                                context.turnState.set(INVOKE_RESPONSE_KEY, activity);
                                responses.push({} as ResourceResponse);
                                next(i + 1);
                                break;
                            default:
                                if (!activity.serviceUrl) { throw new Error(`BotFrameworkAdapter.sendActivity(): missing serviceUrl.`); }
                                if (!activity.conversation || !activity.conversation.id) {
                                    throw new Error(`BotFrameworkAdapter.sendActivity(): missing conversation id.`);
                                }
                                let p: Promise<ResourceResponse>;
                                const client: ConnectorClient = that.createConnectorClient(activity.serviceUrl);
                                if (activity.type === 'trace' && activity.channelId !== 'emulator') {
                                    // Just eat activity
                                    p = Promise.resolve({} as ResourceResponse);
                                } else if (activity.replyToId) {
                                    p = client.conversations.replyToActivity(
                                        activity.conversation.id,
                                        activity.replyToId,
                                        activity as Activity
                                    );
                                } else {
                                    p = client.conversations.sendToConversation(
                                        activity.conversation.id,
                                        activity as Activity
                                    );
                                }
                                p.then(
                                    (response: ResourceResponse) => {
                                    responses.push(response);
                                    next(i + 1);
                                    },
                                    reject
                                );
                                break;
                        }
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    resolve(responses);
                }
            }
            next(0);
        });
    }

    /**
     * Replaces an activity that was previously sent to a channel. It should be noted that not all
     * channels support this feature.
     *
     * @remarks
     * Calling `TurnContext.updateActivity()` is the preferred way of updating activities as that
     * will ensure that any interested middleware has been notified.
     * @param context Context for the current turn of conversation with the user.
     * @param activity New activity to replace a current activity with.
     */
    public updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        try {
            if (!activity.serviceUrl) { throw new Error(`BotFrameworkAdapter.updateActivity(): missing serviceUrl`); }
            if (!activity.conversation || !activity.conversation.id) {
                throw new Error(`BotFrameworkAdapter.updateActivity(): missing conversation or conversation.id`);
            }
            if (!activity.id) { throw new Error(`BotFrameworkAdapter.updateActivity(): missing activity.id`); }
            const client: ConnectorClient = this.createConnectorClient(activity.serviceUrl);

            return client.conversations.updateActivity(
                activity.conversation.id,
                activity.id,
                activity as Activity
            ).then(() => {
                // noop
            });
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Allows for the overriding of authentication in unit tests.
     * @param request Received request.
     * @param authHeader Received authentication header.
     */
    protected authenticateRequest(request: Partial<Activity>, authHeader: string): Promise<void> {
        return JwtTokenValidation.authenticateRequest(
            request as Activity, authHeader,
            this.credentialsProvider,
            this.settings.channelService
        ).then((claims: ClaimsIdentity) => {
            if (!claims.isAuthenticated) { throw new Error('Unauthorized Access. Request is not authorized'); }
        });
    }

    /**
     * Allows for mocking of the connector client in unit tests.
     * @param serviceUrl Clients service url.
     */
    protected createConnectorClient(serviceUrl: string): ConnectorClient {
        const client: ConnectorClient = new ConnectorClient(this.credentials, serviceUrl);
        client.addUserAgentInfo(USER_AGENT);

        return client;
    }

    /**
     * Allows for mocking of the OAuth API Client in unit tests.
     * @param serviceUrl Clients service url.
     */
    protected createOAuthApiClient(serviceUrl: string): OAuthApiClient {
        return new OAuthApiClient(this.createConnectorClient(serviceUrl));
    }

    /**
     * Allows for mocking of the OAuth Api URL in unit tests.
     * @param contextOrServiceUrl The URL of the channel server to query or a TurnContext.  This can be retrieved from `context.activity.serviceUrl`.
     */
    protected oauthApiUrl(contextOrServiceUrl: TurnContext|string): string {
        return this.isEmulatingOAuthCards ?
            (typeof contextOrServiceUrl === 'object' ? contextOrServiceUrl.activity.serviceUrl : contextOrServiceUrl) :
            (this.settings.oAuthEndpoint ? this.settings.oAuthEndpoint : OAUTH_ENDPOINT);
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
