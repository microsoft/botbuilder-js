/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotAdapter, TurnContext, Promiseable, Activity, ConversationReference, ResourceResponse, TokenResponse, ConversationsResult, ChannelAccount } from 'botbuilder-core';
import { ConnectorClient, SimpleCredentialProvider, MicrosoftAppCredentials, OAuthApiClient } from 'botframework-connector';
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
    send(status: number, body?: any): any;
}
/**
 * Bot Framework Adapter Settings.
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
/**
 * ActivityAdapter class needed to communicate with a Bot Framework channel or the Emulator.
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
export declare class BotFrameworkAdapter extends BotAdapter {
    protected readonly credentials: MicrosoftAppCredentials;
    protected readonly credentialsProvider: SimpleCredentialProvider;
    protected readonly settings: BotFrameworkAdapterSettings;
    /**
     * Creates a new BotFrameworkAdapter instance.
     * @param settings (optional) configuration settings for the adapter.
     */
    constructor(settings?: Partial<BotFrameworkAdapterSettings>);
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
    continueConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promiseable<void>): Promise<void>;
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
    createConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promiseable<void>): Promise<void>;
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
    deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void>;
    /**
     * Deletes a member from the current conversation.
     * @param context Context for the current turn of conversation with the user.
     * @param memberId ID of the member to delete from the conversation.
     */
    deleteConversationMember(context: TurnContext, memberId: string): Promise<void>;
    /**
     * Lists the members of a given activity.
     * @param context Context for the current turn of conversation with the user.
     * @param activityId (Optional) activity ID to enumerate. If not specified the current activities ID will be used.
     */
    getActivityMembers(context: TurnContext, activityId?: string): Promise<ChannelAccount[]>;
    /**
     * Lists the members of the current conversation.
     * @param context Context for the current turn of conversation with the user.
     */
    getConversationMembers(context: TurnContext): Promise<ChannelAccount[]>;
    /**
     * Lists the Conversations in which this bot has participated for a given channel server. The
     * channel server returns results in pages and each page will include a `continuationToken`
     * that can be used to fetch the next page of results from the server.
     * @param contextOrServiceUrl The URL of the channel server to query or a TurnContext.  This can be retrieved from `context.activity.serviceUrl`.
     * @param continuationToken (Optional) token used to fetch the next page of results from the channel server. This should be left as `undefined` to retrieve the first page of results.
     */
    getConversations(contextOrServiceUrl: TurnContext | string, continuationToken?: string): Promise<ConversationsResult>;
    /**
     * Attempts to retrieve the token for a user that's in a signin flow.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param magicCode (Optional) Optional user entered code to validate.
     */
    getUserToken(context: TurnContext, connectionName: string, magicCode?: string): Promise<TokenResponse>;
    /**
     * Signs the user out with the token server.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     */
    signOutUser(context: TurnContext, connectionName: string): Promise<void>;
    /**
     * Gets a signin link from the token server that can be sent as part of a SigninCard.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     */
    getSignInLink(context: TurnContext, connectionName: string): Promise<string>;
    /**
     * Tells the token service to emulate the sending of OAuthCards for a channel.
     * @param contextOrServiceUrl The URL of the channel server to query or a TurnContext.  This can be retrieved from `context.activity.serviceUrl`.
     * @param emulate If `true` the token service will emulate the sending of OAuthCards.
     */
    emulateOAuthCards(contextOrServiceUrl: TurnContext | string, emulate: boolean): Promise<void>;
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
    processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promiseable<any>): Promise<void>;
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
    sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]>;
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
    updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void>;
    /**
     * Allows for the overriding of authentication in unit tests.
     * @param request Received request.
     * @param authHeader Received authentication header.
     */
    protected authenticateRequest(request: Partial<Activity>, authHeader: string): Promise<void>;
    /**
     * Allows for mocking of the connector client in unit tests.
     * @param serviceUrl Clients service url.
     */
    protected createConnectorClient(serviceUrl: string): ConnectorClient;
    /**
     * Allows for mocking of the OAuth API Client in unit tests.
     * @param serviceUrl Clients service url.
     */
    protected createOAuthApiClient(serviceUrl: string): OAuthApiClient;
    /**
     * Allows for the overriding of the context object in unit tests and derived adapters.
     * @param request Received request.
     */
    protected createContext(request: Partial<Activity>): TurnContext;
}
