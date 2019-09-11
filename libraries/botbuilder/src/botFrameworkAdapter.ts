/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, ActivityTypes, BotAdapter, ChannelAccount, ConversationAccount, ConversationParameters, ConversationReference, ConversationsResult, IUserTokenProvider, ResourceResponse, TokenResponse, TurnContext } from 'botbuilder-core';
import { AuthenticationConstants, ChannelValidation, ConnectorClient, EmulatorApiClient, GovernmentConstants, GovernmentChannelValidation, JwtTokenValidation, MicrosoftAppCredentials, SimpleCredentialProvider, TokenApiClient, TokenStatus, TokenApiModels } from 'botframework-connector';
import * as os from 'os';

/**
 * Represents an Express or Restify request object.
 * 
 * > [!NOTE] This interface supports the framework and is not intended to be called directly for your code.
 */
export interface WebRequest {
    /**
     * Optional. The request body.
     */
    body?: any;

    /***
     * Optional. The request headers.
     */
    headers: any;

    /**
     * Adds a listener for an event. The framework uses this method to retrieve the request body
     * when the [body](xref:botbuilder.WebRequest.body) property is `null` or `undefined`.
     * 
     * @param event The event name.
     * @param args The event listener.
     * 
     * @returns A reference to the request object.
     */
    on(event: string, ...args: any[]): any;
}

/**
 * Represents an Express or Restify response object.
 * 
 * > [!NOTE] This interface supports the framework and is not intended to be called directly for your code.
 */
export interface WebResponse {
    /**
     * Sends a FIN packet.
     * 
     * @param args The arguments for the end event.
     * 
     * @returns A reference to the response object.
     */
    end(...args: any[]): any;

    /**
     * Sends the response.
     * 
     * @param body The response payload.
     * 
     * @returns A reference to the response object.
     */
    send(body: any): any;

    /**
     * Sets the HTTP status code for the response.
     * 
     * @param status The status code to use.
     * 
     * @returns The status code.
     */
    status(status: number): any;
}

/**
 * Settings used to configure a [BotFrameworkAdapter](xref:botbuilder.BotFrameworkAdapter) instance.
 */
export interface BotFrameworkAdapterSettings {
    /**
     * The ID assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).
     */
    appId: string;

    /**
     * The password assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).
     */
    appPassword: string;

    /**
     * Optional. The tenant to acquire the bot-to-channel token from.
     */
    channelAuthTenant?: string;

    /**
     * Optional. The OAuth API endpoint for your bot to use.
     */
    oAuthEndpoint?: string;

    /**
     * Optional. The Open ID Metadata endpoint for your bot to use.
     */
    openIdMetadata?: string;

    /**
     * Optional. The channel service option for this bot to validate connections from Azure or other channel locations.
     */
    channelService?: string;
}

/**
 * Represents a response returned by a bot when it receives an `invoke` activity.
 * 
 * > [!NOTE] This interface supports the framework and is not intended to be called directly for your code.
 */
export interface InvokeResponse {
    /**
     * The HTTP status code of the response.
     */
    status: number;

    /**
     * Optional. The body of the response.
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
const OAUTH_ENDPOINT = 'https://api.botframework.com';
const US_GOV_OAUTH_ENDPOINT = 'https://api.botframework.azure.us';
const INVOKE_RESPONSE_KEY: symbol = Symbol('invokeResponse');

/**
 * A [BotAdapter](xref:botbuilder-core.BotAdapter) that can connect a bot to a service endpoint.
 * Implements [IUserTokenProvider](xref:botbuilder-core.IUserTokenProvider).
 *
 * @remarks
 * The bot adapter encapsulates authentication processes and sends activities to and receives
 * activities from the Bot Connector Service. When your bot receives an activity, the adapter
 * creates a turn context object, passes it to your bot application logic, and sends responses
 * back to the user's channel.
 *
 * The adapter processes and directs incoming activities in through the bot middleware pipeline to
 * your bot logic and then back out again. As each activity flows in and out of the bot, each
 * piece of middleware can inspect or act upon the activity, both before and after the bot logic runs.
 * Use the [use](xref:botbuilder-core.BotAdapter.use) method to add [Middleware](xref:botbuilder-core.Middleware)
 * objects to your adapter's middleware collection.
 * 
 * For more information, see the articles on
 * [How bots work](https://docs.microsoft.com/azure/bot-service/bot-builder-basics) and
 * [Middleware](https://docs.microsoft.com/azure/bot-service/bot-builder-concept-middleware).
 *
 * This shows the typical adapter setup:
 *
 * ```JavaScript
 * const { BotFrameworkAdapter } = require('botbuilder');
 *
 * const adapter = new BotFrameworkAdapter({
 *     appId: process.env.MicrosoftAppId,
 *     appPassword: process.env.MicrosoftAppPassword
 * });
 * 
 * adapter.onTurnError = async (context, error) => {
 *     // Catch-all logic for errors.
 * };
 * ```
 */
export class BotFrameworkAdapter extends BotAdapter implements IUserTokenProvider {
    protected readonly credentials: MicrosoftAppCredentials;
    protected readonly credentialsProvider: SimpleCredentialProvider;
    protected readonly settings: BotFrameworkAdapterSettings;
    private isEmulatingOAuthCards: boolean;

    /**
     * Creates a new instance of the [BotFrameworkAdapter](xref:botbuilder.BotFrameworkAdapter) class.
     *
     * @param settings Optional. The settings to use for this adapter instance.
     *
     * @remarks
     * If the `settings` parameter does not include
     * [channelService](xref:botbuilder.BotFrameworkAdapterSettings.channelService) or
     * [openIdMetadata](xref:botbuilder.BotFrameworkAdapterSettings.openIdMetadata) values, the
     * constructor checks the process' environment variables for these values. These values may be
     * set when a bot is provisioned on Azure and if so are required for the bot to work properly
     * in the global cloud or in a national cloud.
     * 
     * The [BotFrameworkAdapterSettings](xref:botbuilder.BotFrameworkAdapterSettings) class defines
     * the available adapter settings.
     */
    constructor(settings?: Partial<BotFrameworkAdapterSettings>) {
        super();
        this.settings = { appId: '', appPassword: '', ...settings };
        this.credentials = new MicrosoftAppCredentials(this.settings.appId, this.settings.appPassword || '', this.settings.channelAuthTenant);
        this.credentialsProvider = new SimpleCredentialProvider(this.credentials.appId, this.credentials.appPassword);
        this.isEmulatingOAuthCards = false;

        // If no channelService or openIdMetadata values were passed in the settings, check the process' Environment Variables for values.
        // These values may be set when a bot is provisioned on Azure and if so are required for the bot to properly work in Public Azure or a National Cloud.
        this.settings.channelService = this.settings.channelService || process.env[AuthenticationConstants.ChannelService];
        this.settings.openIdMetadata = this.settings.openIdMetadata || process.env[AuthenticationConstants.BotOpenIdMetadataKey];

        if (this.settings.openIdMetadata) {
            ChannelValidation.OpenIdMetadataEndpoint = this.settings.openIdMetadata;
            GovernmentChannelValidation.OpenIdMetadataEndpoint = this.settings.openIdMetadata;
        }
        if (JwtTokenValidation.isGovernment(this.settings.channelService)) {
            this.credentials.oAuthEndpoint = GovernmentConstants.ToChannelFromBotLoginUrl;
            this.credentials.oAuthScope = GovernmentConstants.ToChannelFromBotOAuthScope;
        }

        // Relocate the tenantId field used by MS Teams to a new location (from channelData to conversation)
        // This will only occur on activities from teams that include tenant info in channelData but NOT in conversation,
        // thus should be future friendly.  However, once the the transition is complete. we can remove this.
        this.use(async(context, next) => {
            if (context.activity.channelId === 'msteams' && context.activity && context.activity.conversation && !context.activity.conversation.tenantId && context.activity.channelData && context.activity.channelData.tenant) {
                context.activity.conversation.tenantId = context.activity.channelData.tenant.id;
            }
            await next();
        });

    }

    /**
     * Resumes a conversation with a user, possibly after some time has gone by.
     *
     * @param reference A reference to the conversation to continue.
     * @param logic The bot logic to run after the adapter middleware runs.
     * 
     * @remarks
     * This is often referred to as a _proactive notification_, the bot can proactively
     * send a message to a conversation or user without waiting for an incoming message.
     * Scenarios like sending notifications or coupons to a user are enabled by this method.
     *
     * To send a proactive message:
     * 1. Save a copy of a [ConversationReference](xref:botframework-schema.ConversationReference)
     *    from an incoming activity. For example, you can store the reference in a database.
     * 1. Call this method to resume the conversation at a later time. Use the saved reference to access the conversation.
     * 1. On success, the adapter generates a [TurnContext](xref:botbuilder-core.TurnContext) object and calls the `logic` function handler.
     *    Use the `logic` function to send the proactive message.
     * 
     * To copy the reference from any incoming activity in the conversation, use the
     * [TurnContext.getConversationReference](xref:botbuilder-core.TurnContext.getConversationReference) method.
     *
     * The processing steps for this method are very similar to [processActivity](xref:botbuilder.BotFrameworkAdapter.processActivity).
     * The adapter creates a [TurnContext](xref:botbuilder-core.TurnContext) and routes it through
     * middleware before calling the `logic` handler. The created activity will have a
     * [type](xref:botframework-schema.Activity.type) of 'event' and a
     * [name](xref:botframework-schema.Activity.name) of 'continueConversation'.
     *
     * ```JavaScript
     * server.post('/api/notifyUser', async (req, res) => {
     *    // Lookup previously saved conversation reference.
     *    const reference = await findReference(req.body.refId);
     *
     *    // Proactively notify the user.
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
     * Requests that a channel create and start a conversation on behalf of the bot.
     *
     * @param reference A reference for the conversation to create.
     * @param logic The bot logic to call after the adapter middleware runs.
     * 
     * @remarks
     * To use this method, you need both the bot's and the user's account information on that channel.
     * Note that while the Bot Connector service supports the creating of group conversations, this
     * method and most channels only support initiating a direct message (non-group) conversation.
     * 
     * To create and start a new conversation:
     * 1. Get a copy of a [ConversationReference](xref:botframework-schema.ConversationReference)
     *    from an incoming activity. Set the [user](xref:botframework-schema.ConversationReference.user)
     *    property to the [ChannelAccount](xref:botframework-schema.ChannelAccount) for the intended recipient.
     * 1. Call this method to request that the channel create a new conversation with the specified user.
     * 1. On success, the adapter generates a turn context and calls the `logic` function handler.
     * 
     * To copy the reference from any incoming activity in the conversation, use the
     * [TurnContext.getConversationReference](xref:botbuilder-core.TurnContext.getConversationReference) method.
     *
     * If the channel establishes the conversation, the generated event activity's
     * [conversation](xref:botframework-schema.Activity.conversation) property will contain the
     * ID of the new conversation.
     *
     * The processing steps for this method are very similar to [processActivity](xref:botbuilder.BotFrameworkAdapter.processActivity).
     * The adapter creates a [TurnContext](xref:botbuilder-core.TurnContext) and routes it through
     * middleware before calling the `logic` handler. The created activity will have a
     * [type](xref:botframework-schema.Activity.type) of 'event' and a
     * [name](xref:botframework-schema.Activity.name) of 'createConversation'.
     *
     * ```JavaScript
     * // Get group members conversation reference
     * const reference = TurnContext.getConversationReference(context.activity);
     * 
     * // ...
     * // Start a new conversation with the user
     * await adapter.createConversation(reference, async (ctx) => {
     *    await ctx.sendActivity(`Hi (in private)`);
     * });
     * ```
     */
    public async createConversation(reference: Partial<ConversationReference>, logic?: (context: TurnContext) => Promise<void>): Promise<void> {
        if (!reference.serviceUrl) { throw new Error(`BotFrameworkAdapter.createConversation(): missing serviceUrl.`); }

        // Create conversation
        const parameters: ConversationParameters = { bot: reference.bot, members: [reference.user], isGroup: false, activity: null, channelData: null };
        const client: ConnectorClient = this.createConnectorClient(reference.serviceUrl);

        // Mix in the tenant ID if specified. This is required for MS Teams.
        if (reference.conversation && reference.conversation.tenantId) {
            // Putting tenantId in channelData is a temporary solution while we wait for the Teams API to be updated
            parameters.channelData = { tenant: { id: reference.conversation.tenantId } };

            // Permanent solution is to put tenantId in parameters.tenantId
            parameters.tenantId = reference.conversation.tenantId;

        }

        const response = await client.conversations.createConversation(parameters);

        // Initialize request and copy over new conversation ID and updated serviceUrl.
        const request: Partial<Activity> = TurnContext.applyConversationReference(
            { type: 'event', name: 'createConversation' },
            reference,
            true
        );

        const conversation: ConversationAccount = {
            id: response.id,
            isGroup: false,
            conversationType: null,
            tenantId: null,
            name: null,
        };
        request.conversation = conversation;

        if (response.serviceUrl) { request.serviceUrl = response.serviceUrl; }

        // Create context and run middleware
        const context: TurnContext = this.createContext(request);
        await this.runMiddleware(context, logic as any);
    }

    /**
     * Deletes an existing activity.
     * 
     * > [!NOTE]
     * > - This interface supports the framework and is not intended to be called directly for your code.
     * > - Not all channels support this operation. For channels that don't, this call may throw an exception.
     * 
     * @param context The context object for the turn.
     * @param reference Conversation reference information for the activity being deleted.
     * 
     * @remarks
     * Use [TurnContext.deleteActivity](xref:botbuilder-core.TurnContext.deleteActivity) to delete
     * an activity from your bot code.
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
     * Removes a member from the current conversation.
     *
     * > [!NOTE] Not all channels support this operation. For channels that don't, this call may throw an exception.
     * 
     * @param context The context object for the turn.
     * @param memberId The ID of the member to remove from the conversation.
     *
     * @remarks
     * Remove a member's identity information from the conversation.
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
     * Lists the members of a given activity.
     * 
     * @param context The context object for the turn.
     * @param activityId Optional. The ID of the activity to get the members of. If not specified, the current activity ID is used.
     *
     * @returns An array of [ChannelAccount](xref:botframework-schema.ChannelAccount) objects representing
     * the users involved in a given activity.
     * 
     * @remarks
     * Returns an array of [ChannelAccount](xref:botframework-schema.ChannelAccount) objects representing
     * the users involved in a given activity.
     *
     * This is different from [getConversationMembers](xref:botbuilder.BotFrameworkAdapter.getConversationMembers)
     * in that it will return only those users directly involved in the activity, not all members of the conversation.
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
     * Lists the members of the current conversation.
     * 
     * @param context The context object for the turn.
     *
     * @returns An array of [ChannelAccount](xref:botframework-schema.ChannelAccount) objects representing
     * all users currently involved in a conversation.
     * 
     * @remarks
     * Returns an array of [ChannelAccount](xref:botframework-schema.ChannelAccount) objects representing
     * all users currently involved in a conversation.
     *
     * This is different from [getActivityMembers](xref:botbuilder.BotFrameworkAdapter.getActivityMembers)
     * in that it will return all members of the conversation, not just those directly involved in a specific activity.
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
     * For a given channel server, lists the conversations in which this bot has participated.
     * 
     * @param contextOrServiceUrl The URL of the channel server to query or a [TurnContext](xref:botbuilder-core.TurnContext).
     * @param continuationToken Optional. The continuation token from the previous page of results.
     * Use `undefined` to retrieve the first page of results.
     * 
     * @returns A [ConversationsResult](xref:botframework-schema.ConversationsResult) containing a page of results and a continuation token.
     *
     * @remarks
     * The result's [conversations](xref:botframework-schema.ConversationsResult.conversations) property contains a page of
     * [ConversationMembers](xref:botframework-schema.ConversationMembers) objects. Each object's
     * [id](xref:botframework-schema.ConversationMembers.id) is the ID of a conversation in which the bot has participated on this channel.
     * 
     * This method can be called from outside the context of a conversation, as only the bot's service URL and credentials are required.
     * 
     * The channel server returns results in pages. If the result's
     * [continuationToken](xref:botframework-schema.ConversationsResult.continuationToken) property is not empty, then
     * there are more pages to get. Use the returned token to get the next page of results.
     * 
     * If the `contextOrServiceUrl` parameter is a [TurnContext](xref:botbuilder-core.TurnContext), the URL of the channel server is
     * retrieved from
     * `contextOrServiceUrl`.[activity](xref:botbuilder-core.TurnContext.activity).[serviceUrl](xref:botframework-schema.Activity.serviceUrl).
     */
    public async getConversations(contextOrServiceUrl: TurnContext | string, continuationToken?: string): Promise<ConversationsResult> {
        const url: string = typeof contextOrServiceUrl === 'object' ? contextOrServiceUrl.activity.serviceUrl : contextOrServiceUrl;
        const client: ConnectorClient = this.createConnectorClient(url);

        return await client.conversations.getConversations(continuationToken ? { continuationToken: continuationToken } : undefined);
    }

    /**
     * Retrieves the OAuth token for a user that is in a sign-in flow.
     * 
     * @param context The context object for the turn.
     * @param connectionName Name of the auth connection to use.
     * @param magicCode Optional. User entered validation code.
     */
    public async getUserToken(context: TurnContext, connectionName: string, magicCode?: string): Promise<TokenResponse> {
        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(`BotFrameworkAdapter.getUserToken(): missing from or from.id`);
        }
        if (!connectionName) {
        	throw new Error('getUserToken() requires a connectionName but none was provided.');
        }
        this.checkEmulatingOAuthCards(context);
        const userId: string = context.activity.from.id;
        const url: string = this.oauthApiUrl(context);
        const client: TokenApiClient = this.createTokenApiClient(url);

        const result: TokenApiModels.UserTokenGetTokenResponse = await client.userToken.getToken(userId, connectionName, { code: magicCode, channelId: context.activity.channelId });
        if (!result || !result.token || result._response.status == 404) {
            return undefined;
        } else {
            return result as TokenResponse;
        }
    }

    /**
     * Signs the user out with the token server.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param userId id of user to sign out.
     * @returns A promise that represents the work queued to execute.
     */
    public async signOutUser(context: TurnContext, connectionName?: string, userId?: string): Promise<void> {
        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(`BotFrameworkAdapter.signOutUser(): missing from or from.id`);
        }
        if (!userId){
            userId = context.activity.from.id;
        }
        
        this.checkEmulatingOAuthCards(context);
        const url: string = this.oauthApiUrl(context);
        const client: TokenApiClient = this.createTokenApiClient(url);
        await client.userToken.signOut(userId, { connectionName: connectionName, channelId: context.activity.channelId } );
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
        return (await client.botSignIn.getSignInUrl(finalState, { channelId: context.activity.channelId }))._response.bodyAsText;
    }

    /** 
     * Retrieves the token status for each configured connection for the given user.
     * @param context Context for the current turn of conversation with the user.
     * @param userId The user Id for which token status is retrieved.
     * @param includeFilter Optional comma seperated list of connection's to include. Blank will return token status for all configured connections.
     * @returns Array of TokenStatus
     * */ 
    
    public async getTokenStatus(context: TurnContext, userId?: string, includeFilter?: string ): Promise<TokenStatus[]>
    {
        if (!userId && (!context.activity.from || !context.activity.from.id)) {
            throw new Error(`BotFrameworkAdapter.getTokenStatus(): missing from or from.id`);
        }
        this.checkEmulatingOAuthCards(context);
        userId = userId || context.activity.from.id;
        const url: string = this.oauthApiUrl(context);
        const client: TokenApiClient = this.createTokenApiClient(url);
        
        return (await client.userToken.getTokenStatus(userId, {channelId: context.activity.channelId, include: includeFilter}))._response.parsedBody;
    }

    /**
     * Signs the user out with the token server.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     */
    public async getAadTokens(context: TurnContext, connectionName: string, resourceUrls: string[]): Promise<{
        [propertyName: string]: TokenResponse;
    }> {
        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(`BotFrameworkAdapter.getAadTokens(): missing from or from.id`);
        }
        this.checkEmulatingOAuthCards(context);
        const userId: string = context.activity.from.id;
        const url: string = this.oauthApiUrl(context);
        const client: TokenApiClient = this.createTokenApiClient(url);

        return (await client.userToken.getAadTokens(userId, connectionName, { resourceUrls: resourceUrls }, { channelId: context.activity.channelId }))._response.parsedBody as {[propertyName: string]: TokenResponse };
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
        if (body) { res.send(body); }
        res.end();

        // Check for an error
        if (status >= 400) {
            console.warn(`BotFrameworkAdapter.processActivity(): ${ status } ERROR - ${ body.toString() }`);
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
        const client: ConnectorClient = new ConnectorClient(this.credentials, { baseUri: serviceUrl, userAgent: USER_AGENT} );
        return client;
    }

    /**
     * Allows for mocking of the OAuth API Client in unit tests.
     * @param serviceUrl Clients service url.
     */
    protected createTokenApiClient(serviceUrl: string): TokenApiClient {
        const client = new TokenApiClient(this.credentials, { baseUri: serviceUrl, userAgent: USER_AGENT} );
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
            let requestData = '';
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
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}