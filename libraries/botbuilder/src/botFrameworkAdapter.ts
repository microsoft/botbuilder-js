/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, ActivityTypes, BotAdapter, ChannelAccount, ConversationAccount, ConversationParameters, ConversationReference, ConversationsResult, IUserTokenProvider, ResourceResponse, TokenResponse, TurnContext } from 'botbuilder-core';
import { AuthenticationConstants, ChannelValidation, ConnectorClient, EmulatorApiClient, GovernmentConstants, GovernmentChannelValidation, JwtTokenValidation, MicrosoftAppCredentials, SimpleCredentialProvider, TokenApiClient,  TokenApiModels } from 'botframework-connector';
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
     * When implemented in a derived class, adds a listener for an event.
     * The framework uses this method to retrieve the request body when the
     * [body](xref:botbuilder.WebRequest.body) property is `null` or `undefined`.
     * 
     * @param event The event name.
     * @param args Arguments used to handle the event.
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
     * When implemented in a derived class, sends a FIN packet.
     * 
     * @param args The arguments for the end event.
     * 
     * @returns A reference to the response object.
     */
    end(...args: any[]): any;

    /**
     * When implemented in a derived class, sends the response.
     * 
     * @param body The response payload.
     * 
     * @returns A reference to the response object.
     */
    send(body: any): any;

    /**
     * When implemented in a derived class, sets the HTTP status code for the response.
     * 
     * @param status The status code to use.
     * 
     * @returns The status code.
     */
    status(status: number): any;
}

/**
 * Contains settings used to configure a [BotFrameworkAdapter](xref:botbuilder.BotFrameworkAdapter) instance.
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
 * For example:
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
     * An asynchronous method that resumes a conversation with a user, possibly after some time has gone by.
     *
     * @param reference A reference to the conversation to continue.
     * @param logic The asynchronous method to call after the adapter middleware runs.
     * 
     * @remarks
     * This is often referred to as a _proactive notification_, the bot can proactively
     * send a message to a conversation or user without waiting for an incoming message.
     * For example, a bot can use this method to send notifications or coupons to a user.
     *
     * To send a proactive message:
     * 1. Save a copy of a [ConversationReference](xref:botframework-schema.ConversationReference)
     *    from an incoming activity. For example, you can store the conversation reference in a database.
     * 1. Call this method to resume the conversation at a later time. Use the saved reference to access the conversation.
     * 1. On success, the adapter generates a [TurnContext](xref:botbuilder-core.TurnContext) object and calls the `logic` function handler.
     *    Use the `logic` function to send the proactive message.
     * 
     * To copy the reference from any incoming activity in the conversation, use the
     * [TurnContext.getConversationReference](xref:botbuilder-core.TurnContext.getConversationReference) method.
     *
     * This method is similar to the [processActivity](xref:botbuilder.BotFrameworkAdapter.processActivity) method.
     * The adapter creates a [TurnContext](xref:botbuilder-core.TurnContext) and routes it through
     * its middleware before calling the `logic` handler. The created activity will have a
     * [type](xref:botframework-schema.Activity.type) of 'event' and a
     * [name](xref:botframework-schema.Activity.name) of 'continueConversation'.
     *
     * For example:
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
     * An asynchronous method that creates and starts a conversation with a user on a channel.
     *
     * @param reference A reference for the conversation to create.
     * @param logic The asynchronous method to call after the adapter middleware runs.
     * 
     * @remarks
     * To use this method, you need both the bot's and the user's account information on a channel.
     * The Bot Connector service supports the creating of group conversations; however, this
     * method and most channels only support initiating a direct message (non-group) conversation.
     * 
     * To create and start a new conversation:
     * 1. Get a copy of a [ConversationReference](xref:botframework-schema.ConversationReference) from an incoming activity.
     * 1. Set the [user](xref:botframework-schema.ConversationReference.user) property to the
     *    [ChannelAccount](xref:botframework-schema.ChannelAccount) value for the intended recipient.
     * 1. Call this method to request that the channel create a new conversation with the specified user.
     * 1. On success, the adapter generates a turn context and calls the `logic` function handler.
     * 
     * To get the initial reference, use the
     * [TurnContext.getConversationReference](xref:botbuilder-core.TurnContext.getConversationReference)
     * method on any incoming activity in the conversation.
     *
     * If the channel establishes the conversation, the generated event activity's
     * [conversation](xref:botframework-schema.Activity.conversation) property will contain the
     * ID of the new conversation.
     *
     * This method is similar to the [processActivity](xref:botbuilder.BotFrameworkAdapter.processActivity) method.
     * The adapter creates a [TurnContext](xref:botbuilder-core.TurnContext) and routes it through
     * middleware before calling the `logic` handler. The created activity will have a
     * [type](xref:botframework-schema.Activity.type) of 'event' and a
     * [name](xref:botframework-schema.Activity.name) of 'createConversation'.
     *
     * For example:
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
        const parameters: ConversationParameters = { bot: reference.bot, members: [reference.user], isGroup: false, activity: null, channelData: null, headers: {} };
        const client: ConnectorClient = this.createConnectorClient(reference.serviceUrl);

        // Mix in the tenant ID if specified. This is required for MS Teams.
        if (reference.conversation && reference.conversation.tenantId) {
            // Putting tenantId in channelData is a temporary solution while we wait for the Teams API to be updated
            parameters.channelData = { tenant: { id: reference.conversation.tenantId } };

            // Permanent solution is to put tenantId in parameters.tenantId
            parameters.tenantId = reference.conversation.tenantId;

        }
        //TODO: Modify this to use the new client
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
            tenantId: reference.conversation.tenantId,
            name: null,
        };
        request.conversation = conversation;
        request.channelData = parameters.channelData;

        if (response.serviceUrl) { request.serviceUrl = response.serviceUrl; }

        // Create context and run middleware
        const context: TurnContext = this.createContext(request);
        await this.runMiddleware(context, logic as any);
    }

    /**
     * An asynchronous method that deletes an existing activity.
     * 
     * > [!NOTE]
     * > - This interface supports the framework and is not intended to be called directly for your code.
     * > - Not all channels support this operation. For channels that don't, this call may throw an exception.
     * 
     * @param context The context object for the turn.
     * @param reference Conversation reference information for the activity to delete.
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

        //TODO: Modify to use new client
        await client.conversations.deleteActivity(reference.conversation.id, reference.activityId);
    }

    /**
     * An asynchronous method that removes a member from the current conversation.
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

        //TODO: Modify to use new client
        await client.conversations.deleteConversationMember(conversationId, memberId);
    }

    /**
     * An asynchronous method that lists the members of a given activity.
     * 
     * @param context The context object for the turn.
     * @param activityId Optional. The ID of the activity to get the members of. If not specified, the current activity ID is used.
     *
     * @returns An array of [ChannelAccount](xref:botframework-schema.ChannelAccount) objects for
     * the users involved in a given activity.
     * 
     * @remarks
     * Returns an array of [ChannelAccount](xref:botframework-schema.ChannelAccount) objects for
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
        //TODO: Modify to use new client
        return await client.conversations.getActivityMembers(conversationId, activityId);
    }

    /**
     * An asynchronous method that lists the members of the current conversation.
     * 
     * @param context The context object for the turn.
     *
     * @returns An array of [ChannelAccount](xref:botframework-schema.ChannelAccount) objects for
     * all users currently involved in a conversation.
     * 
     * @remarks
     * Returns an array of [ChannelAccount](xref:botframework-schema.ChannelAccount) objects for
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
        //TODO: Modify to use new client
        return await client.conversations.getConversationMembers(conversationId);
    }

    /**
     * An asynchronous method that, for the specified channel, gets a page of the conversations in which this bot has participated.
     * 
     * @param contextOrServiceUrl The URL of the channel server to query or a
     * [TurnContext](xref:botbuilder-core.TurnContext) object from a conversation on the channel.
     * @param continuationToken Optional. The continuation token from the previous page of results.
     * Omit this parameter or use `undefined` to retrieve the first page of results.
     * 
     * @returns A [ConversationsResult](xref:botframework-schema.ConversationsResult) object containing a page of results
     * and a continuation token.
     *
     * @remarks
     * The the return value's [conversations](xref:botframework-schema.ConversationsResult.conversations) property contains a page of
     * [ConversationMembers](xref:botframework-schema.ConversationMembers) objects. Each object's
     * [id](xref:botframework-schema.ConversationMembers.id) is the ID of a conversation in which the bot has participated on this channel.
     * This method can be called from outside the context of a conversation, as only the bot's service URL and credentials are required.
     * 
     * The channel batches results in pages. If the result's
     * [continuationToken](xref:botframework-schema.ConversationsResult.continuationToken) property is not empty, then
     * there are more pages to get. Use the returned token to get the next page of results.
     * If the `contextOrServiceUrl` parameter is a [TurnContext](xref:botbuilder-core.TurnContext), the URL of the channel server is
     * retrieved from
     * `contextOrServiceUrl`.[activity](xref:botbuilder-core.TurnContext.activity).[serviceUrl](xref:botframework-schema.Activity.serviceUrl).
     */
    public async getConversations(contextOrServiceUrl: TurnContext | string, continuationToken?: string): Promise<ConversationsResult> {
        const url: string = typeof contextOrServiceUrl === 'object' ? contextOrServiceUrl.activity.serviceUrl : contextOrServiceUrl;
        const client: ConnectorClient = this.createConnectorClient(url);
        //TODO: Modify to use new client

        return await client.conversations.getConversations(continuationToken ? { continuationToken: continuationToken, headers: {} } : undefined);
    }

    /**
     * An asynchronous method that attempts to retrieve the token for a user that's in a login flow.
     * 
     * @param context The context object for the turn.
     * @param connectionName The name of the auth connection to use.
     * @param magicCode Optional. The validation code the user entered.
     * 
     * @returns A [TokenResponse](xref:botframework-schema.TokenResponse) object that contains the user token.
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
        
        //Custom token Api
        const customClient: TokenApiClient = this.createTokenApiClient(url);                    

        const result: TokenApiModels.UserTokenGetTokenResponse = await client.userToken.getToken(userId, connectionName, { code: magicCode, channelId: context.activity.channelId });
        // TO-DO TODO
        // const customResult: CustomModels.UserTokenGetTokenResponse = await customClient.userToken.getToken(userId, connectionName, { code: magicCode, channelId: context.activity.channelId });
        
        if (!result || !result.token || result._response.statusCode == 404) {
            return undefined;
        } else {
            return result as TokenResponse;
        }
    }

    /**
     * An asynchronous method that signs out the user from the token server.
     * 
     * @param context The context object for the turn.
     * @param connectionName The name of the auth connection to use.
     * @param userId The ID of user to sign out.
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
     * An asynchronous method that gets a sign-in link from the token server that can be sent as part
     * of a [SigninCard](xref:botframework-schema.SigninCard).
     * 
     * @param context The context object for the turn.
     * @param connectionName The name of the auth connection to use.
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
        return (await client.botSignIn.getSignInUrl(finalState, { channelId: context.activity.channelId, headers: {} }))._response.bodyAsText;
    }

    /** 
     * An asynchronous method that retrieves the token status for each configured connection for the given user.
     * 
     * @param context The context object for the turn.
     * @param userId Optional. If present, the ID of the user to retrieve the token status for.
     *      Otherwise, the ID of the user who sent the current activity is used.
     * @param includeFilter Optional. A comma-separated list of connection's to include. If present,
     *      the `includeFilter` parameter limits the tokens this method returns.
    public async getTokenStatus(context: TurnContext, userId?: string, includeFilter?: string ): Promise<TokenApiModels.TokenStatus[]>
     * @returns The [TokenStatus](xref:botframework-connector.TokenStatus) objects retrieved.
     */
    public async getTokenStatus(context: TurnContext, userId?: string, includeFilter?: string ): Promise<TokenApiModels.TokenStatus[]>
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
     * An asynchronous method that signs out the user from the token server.
     * 
     * @param context The context object for the turn.
     * @param connectionName The name of the auth connection to use.
     * @param resourceUrls The list of resource URLs to retrieve tokens for.
     * 
     * @returns A map of the [TokenResponse](xref:botframework-schema.TokenResponse) objects by resource URL.
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
     * An asynchronous method that sends an emulated OAuth card for a channel.
     * > [!NOTE] This method supports the framework and is not intended to be called directly for your code.
     * 
     * @param contextOrServiceUrl The URL of the emulator.
     * @param emulate `true` to send an emulated OAuth card to the emulator; or `false` to not send the card.
     * 
     * @remarks
     * When testing a bot in the Bot Framework Emulator, this method can emulate the OAuth card interaction.
     */
    public async emulateOAuthCards(contextOrServiceUrl: TurnContext | string, emulate: boolean): Promise<void> {
        this.isEmulatingOAuthCards = emulate;
        const url: string = this.oauthApiUrl(contextOrServiceUrl);
        await EmulatorApiClient.emulateOAuthCards(this.credentials as MicrosoftAppCredentials,  url, emulate);
    }

    /**
     * An asynchronous method that creates a turn context and runs the middleware pipeline for an incoming activity.
     *
     * @param req An Express or Restify style request object.
     * @param res An Express or Restify style response object.
     * @param logic The function to call at the end of the middleware pipeline.
     * 
     * @remarks
     * This is the main way a bot receives incoming messages and defines a turn in the conversation. This method:
     * 
     * 1. Parses and authenticates an incoming request.
     *    - The activity is read from the body of the incoming request. An error will be returned
     *      if the activity can't be parsed.
     *    - The identity of the sender is authenticated as either the Emulator or a valid Microsoft
     *      server, using the bot's `appId` and `appPassword`. The request is rejected if the sender's
     *      identity is not verified.
     * 1. Creates a [TurnContext](xref:botbuilder-core.TurnContext) object for the received activity.
     *    - This object is wrapped with a [revocable proxy](https://www.ecma-international.org/ecma-262/6.0/#sec-proxy.revocable).
     *    - When this method completes, the proxy is revoked.
     * 1. Sends the turn context through the adapter's middleware pipeline.
     * 1. Sends the turn context to the `logic` function.
     *    - The bot may perform additional routing or processing at this time.
     *      Returning a promise (or providing an `async` handler) will cause the adapter to wait for any asynchronous operations to complete.
     *    - After the `logic` function completes, the promise chain set up by the middleware is resolved.
     *
     * Middleware can _short circuit_ a turn. When this happens, subsequent middleware and the
     * `logic` function is not called; however, all middleware prior to this point still run to completion.
     * For more information about the middleware pipeline, see the
     * [how bots work](https://docs.microsoft.com/azure/bot-service/bot-builder-basics) and
     * [middleware](https://docs.microsoft.com/azure/bot-service/bot-builder-concept-middleware) articles.
     * Use the adapter's [use](xref:botbuilder-core.BotAdapter.use) method to add middleware to the adapter.
     *
     * For example:
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
     *
     * > [!TIP]
     * > If you see the error `TypeError: Cannot perform 'set' on a proxy that has been revoked`
     * > in your bot's console output, the likely cause is that an async function was used
     * > without using the `await` keyword. Make sure all async functions use await!
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
     * An asynchronous method that sends a set of outgoing activities to a channel server.
     * > [!NOTE] This method supports the framework and is not intended to be called directly for your code.
     *
     * @param context The context object for the turn.
     * @param activities The activities to send.
     * 
     * @returns An array of [ResourceResponse](xref:)
     * 
     * @remarks
     * The activities will be sent one after another in the order in which they're received. A
     * response object will be returned for each sent activity. For `message` activities this will
     * contain the ID of the delivered message.
     *
     * Use the turn context's [sendActivity](xref:botbuilder-core.TurnContext.sendActivity) or
     * [sendActivities](xref:botbuilder-core.TurnContext.sendActivities) method, instead of directly
     * calling this method. The [TurnContext](xref:botbuilder-core.TurnContext) ensures that outgoing
     * activities are properly addressed and that all registered response event handlers are notified.
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
                                //TODO: Modify to use new client

                        responses.push(await client.conversations.replyToActivity(
                            activity.conversation.id,
                            activity.replyToId,
                            activity as Activity
                        ));
                    } else {
                                //TODO: Modify to use new client

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
     * An asynchronous method that replaces a previous activity with an updated version.
     * 
     * > [!NOTE]
     * > - This interface supports the framework and is not intended to be called directly for your code.
     * > - Not all channels support this operation. For channels that don't, this call may throw an exception.
     * 
     * @param context The context object for the turn.
     * @param activity The updated version of the activity to replace.
     * 
     * @remarks
     * Use [TurnContext.updateActivity](xref:botbuilder-core.TurnContext.updateActivity) to update
     * an activity from your bot code.
     */
    public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        if (!activity.serviceUrl) { throw new Error(`BotFrameworkAdapter.updateActivity(): missing serviceUrl`); }
        if (!activity.conversation || !activity.conversation.id) {
            throw new Error(`BotFrameworkAdapter.updateActivity(): missing conversation or conversation.id`);
        }
        if (!activity.id) { throw new Error(`BotFrameworkAdapter.updateActivity(): missing activity.id`); }
        const client: ConnectorClient = this.createConnectorClient(activity.serviceUrl);
                //TODO: Modify to use new client

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
     * Creates a connector client.
     * 
     * @param serviceUrl The client's service URL.
     * 
     * @remarks
     * Override this in a derived class to create a mock connector client for unit testing.
     */
    protected createConnectorClient(serviceUrl: string): ConnectorClient {
        const client: ConnectorClient = new ConnectorClient(this.credentials, { baseUri: serviceUrl} );
        return client;
    }

    /**
     * Creates an OAuth API client.
     * 
     * @param serviceUrl The client's service URL.
     * 
     * @remarks
     * Override this in a derived class to create a mock OAuth API client for unit testing.
     */
    protected createTokenApiClient(serviceUrl: string): TokenApiClient {
        const client = new TokenApiClient(this.credentials, { baseUri: serviceUrl, userAgent: USER_AGENT} );
        return client;
    }

    // TO-DO TODO
    // Custom token Api Client
    // protected createCustomTokenApiClient(serviceUrl: string): CustomTokenApiClient {
    //     const customClient = new CustomTokenApiClient(this.credentials, { baseUri: serviceUrl } );                

    //     return customClient;
    // }

    /**
     * Gets the OAuth API endpoint.
     * 
     * @param contextOrServiceUrl The URL of the channel server to query or
     * a [TurnContext](xref:botbuilder-core.TurnContext). For a turn context, the context's
     * [activity](xref:botbuilder-core.TurnContext.activity).[serviceUrl](xref:botframework-schema.Activity.serviceUrl)
     * is used for the URL.
     * 
     * @remarks
     * Override this in a derived class to create a mock OAuth API endpoint for unit testing.
     */
    protected oauthApiUrl(contextOrServiceUrl: TurnContext | string): string {
        return this.isEmulatingOAuthCards ?
            (typeof contextOrServiceUrl === 'object' ? contextOrServiceUrl.activity.serviceUrl : contextOrServiceUrl) :
            (this.settings.oAuthEndpoint ? this.settings.oAuthEndpoint : 
                JwtTokenValidation.isGovernment(this.settings.channelService) ?
                    US_GOV_OAUTH_ENDPOINT : OAUTH_ENDPOINT);
    }

    /**
     * Checks the environment and can set a flag to emulate OAuth cards.
     * 
     * @param context The context object for the turn.
     * 
     * @remarks
     * Override this in a derived class to control how OAuth cards are emulated for unit testing.
     */
    protected checkEmulatingOAuthCards(context: TurnContext): void {
        if (!this.isEmulatingOAuthCards &&
            context.activity.channelId === 'emulator' &&
            (!this.credentials.appId || !this.credentials.appPassword)) {
            this.isEmulatingOAuthCards = true;
        }
    }

    /**
     * Creates a turn context.
     * 
     * @param request An incoming request body.
     * 
     * @remarks
     * Override this in a derived class to modify how the adapter creates a turn context.
     */
    protected createContext(request: Partial<Activity>): TurnContext {
        return new TurnContext(this as any, request);
    }
}

/**
 * Handles incoming webhooks from the botframework
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