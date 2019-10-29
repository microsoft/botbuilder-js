/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    BotFrameworkAdapter,
    BotFrameworkAdapterSettings,
    InvokeResponse,
    INVOKE_RESPONSE_KEY,
    StatusCodes,
    WebRequest,
    WebResponse
} from '../botFrameworkAdapter';
import {
    Activity, ActivityTypes, BotCallbackHandlerKey,
    IUserTokenProvider, ResourceResponse, TurnContext } from 'botbuilder-core';
import {
    AuthenticationConstants,
    ChannelValidation,
    ConnectorClient,
    GovernmentConstants,
    GovernmentChannelValidation,
    JwtTokenValidation,
    MicrosoftAppCredentials,
    SimpleCredentialProvider
} from 'botframework-connector';
import { IncomingMessage } from 'http';
import * as os from 'os';

import { StreamingHttpClient } from './streamingHttpClient';
import { TokenResolver } from './tokenResolver';

import { IReceiveRequest, ISocket, IStreamingTransportServer, NamedPipeServer, NodeWebSocketFactory, NodeWebSocketFactoryBase, StreamingResponse, WebSocketServer } from 'botframework-streaming';

// Retrieve additional information, i.e., host operating system, host OS release, architecture, Node.js version
const ARCHITECTURE: any = os.arch();
const TYPE: any = os.type();
const RELEASE: any = os.release();
const NODE_VERSION: any = process.version;

// tslint:disable-next-line:no-var-requires no-require-imports
const pjson: any = require('../../package.json');
const USER_AGENT: string = `Microsoft-BotFramework/3.1 BotBuilder/${ pjson.version } ` +
    `(Node.js,Version=${ NODE_VERSION }; ${ TYPE } ${ RELEASE }; ${ ARCHITECTURE })`;

const defaultPipeName = 'bfv4.pipes';
const VERSION_PATH: string = '/api/version';
const MESSAGES_PATH: string = '/api/messages';
const GET: string = 'GET';
const POST: string = 'POST';


export interface StreamingAdapterSettings extends BotFrameworkAdapterSettings {
    /**
     * Optional. The option to determine if this adapter accepts WebSocket connections
     */
    enableWebSockets?: boolean;

    /**
     * Optional. Used to pass in a NodeWebSocketFactoryBase instance. Allows bot to accept WebSocket connections.
     */
    webSocketFactory?: NodeWebSocketFactoryBase;   
}

export class StreamingAdapter extends BotFrameworkAdapter implements IUserTokenProvider {
    protected readonly credentials: MicrosoftAppCredentials;
    protected readonly credentialsProvider: SimpleCredentialProvider;
    protected readonly settings: StreamingAdapterSettings;

    private logic: (context: TurnContext) => Promise<void>;
    private streamingServer: IStreamingTransportServer;
    private _isEmulatingOAuthCards: boolean;
    private webSocketFactory: NodeWebSocketFactoryBase;

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
    constructor(settings?: Partial<StreamingAdapterSettings>) {
        super(settings);

        this._isEmulatingOAuthCards = false;

        // If the developer wants to use WebSockets, but didn't provide a WebSocketFactory,
        // create a NodeWebSocketFactory.
        if (this.settings.enableWebSockets && !this.settings.webSocketFactory) {
            this.webSocketFactory = new NodeWebSocketFactory();
        }

        if (this.settings.webSocketFactory) {
            this.webSocketFactory = this.settings.webSocketFactory;
        }
    }

    /**
     * Asynchronously creates a turn context and runs the middleware pipeline for an incoming activity.
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
     * > [!TIP]
     * > If you see the error `TypeError: Cannot perform 'set' on a proxy that has been revoked`
     * > in your bot's console output, the likely cause is that an async function was used
     * > without using the `await` keyword. Make sure all async functions use await!
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
     */
    public async processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {
        if (this.settings.enableWebSockets && req.method === GET && (req.headers.Upgrade || req.headers.upgrade)) {
            return this.useWebSocket(req, res, logic);
        }

        let body: any;
        let status: number;
        let processError: Error;
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
            context.turnState.set(BotCallbackHandlerKey, logic);
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
            // Catch the error to try and throw the stacktrace out of processActivity()
            processError = err;
            body = err.toString();
        }

        // Return status 
        res.status(status);
        if (body) { res.send(body); }
        res.end();

        // Check for an error
        if (status >= 400) {
            if (processError && (processError as Error).stack) {
                throw new Error(`BotFrameworkAdapter.processActivity(): ${ status } ERROR\n ${ processError.stack }`);
            } else {
                throw new Error(`BotFrameworkAdapter.processActivity(): ${ status } ERROR`);
            }
        }
    }

    /**
     * Asynchronously creates a turn context and runs the middleware pipeline for an incoming activity.
     *
     * @param activity The activity to process.
     * @param logic The function to call at the end of the middleware pipeline.
     * 
     * @remarks
     * This is the main way a bot receives incoming messages and defines a turn in the conversation. This method:
     * 
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
     */
    public async processActivityDirect(activity: Activity, logic: (context: TurnContext) => Promise<any>): Promise<void> {
        let processError: Error;
        try {   
            // Process activity
            const context: TurnContext = this.createContext(activity);
            context.turnState.set(BotCallbackHandlerKey, logic);
            await this.runMiddleware(context, logic);
        } catch (err) {
            // Catch the error to try and throw the stacktrace out of processActivity()
            processError = err;
        }

        if (processError) {
            if (processError && (processError as Error).stack) {
                throw new Error(`BotFrameworkAdapter.processActivity(): ${ status } ERROR\n ${ processError.stack }`);
            } else {
                throw new Error(`BotFrameworkAdapter.processActivity(): ${ status } ERROR`);
            }
        }
    }

    /**
     * Asynchronously sends a set of outgoing activities to a channel server.
     * 
     * This method supports the framework and is not intended to be called directly for your code.
     * Use the turn context's [sendActivity](xref:botbuilder-core.TurnContext.sendActivity) or
     * [sendActivities](xref:botbuilder-core.TurnContext.sendActivities) method from your bot code.
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
                    if (StreamingAdapter.isFromStreamingConnection(activity as Activity)) {
                        TokenResolver.checkForOAuthCards(this, context, activity as Activity);
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
     * Creates a connector client.
     * 
     * @param serviceUrl The client's service URL.
     * 
     * @remarks
     * Override this in a derived class to create a mock connector client for unit testing.
     */
    public createConnectorClient(serviceUrl: string): ConnectorClient {

        if (StreamingAdapter.isStreamingServiceUrl(serviceUrl)) {

            // Check if we have a streaming server. Otherwise, requesting a connector client
            // for a non-existent streaming connection results in an error
            if (!this.streamingServer) {
                throw new Error(`Cannot create streaming connector client for serviceUrl ${serviceUrl} without a streaming connection. Call 'useWebSocket' or 'useNamedPipe' to start a streaming connection.`)
            }

            return new ConnectorClient(
                this.credentials,
                {
                    baseUri: serviceUrl,
                    userAgent: USER_AGENT,
                    httpClient: new StreamingHttpClient(this.streamingServer)
                });
        }

        const client: ConnectorClient = new ConnectorClient(this.credentials, { baseUri: serviceUrl, userAgent: USER_AGENT} );
        return client;
    }

    /**
     * Checks the validity of the request and attempts to map it the correct virtual endpoint,
     * then generates and returns a response if appropriate.
     * @param request A ReceiveRequest from the connected channel.
     * @returns A response created by the BotAdapter to be sent to the client that originated the request.
     */
    public async processRequest(request: IReceiveRequest): Promise<StreamingResponse> {
        let response = new StreamingResponse();

        if (!request) {
            response.statusCode = StatusCodes.BAD_REQUEST;
            response.setBody(`No request provided.`);
            return response;
        }

        if (!request.verb || !request.path) {
            response.statusCode = StatusCodes.BAD_REQUEST;
            response.setBody(`Request missing verb and/or path. Verb: ${ request.verb }. Path: ${ request.path }`);
            return response;
        }

        if (request.verb.toLocaleUpperCase() !== POST && request.verb.toLocaleUpperCase() !== GET) {
            response.statusCode = StatusCodes.METHOD_NOT_ALLOWED;
            response.setBody(`Invalid verb received. Only GET and POST are accepted. Verb: ${ request.verb }`);
        }

        if (request.path.toLocaleLowerCase() === VERSION_PATH) {
            return await this.handleVersionRequest(request, response);
        }

        // Convert the StreamingRequest into an activity the Adapter can understand.
        let body: Activity;
        try {
            body = await this.readRequestBodyAsString(request);

        } catch (error) {
            response.statusCode = StatusCodes.BAD_REQUEST;
            response.setBody(`Request body missing or malformed: ${ error }`);
            return response;
        }

        if (request.path.toLocaleLowerCase() !== MESSAGES_PATH) {
            response.statusCode = StatusCodes.NOT_FOUND;
            response.setBody(`Path ${ request.path.toLocaleLowerCase() } not not found. Expected ${ MESSAGES_PATH }}.`);
            return response;
        }

        if (request.verb.toLocaleUpperCase() !== POST) {
            response.statusCode = StatusCodes.METHOD_NOT_ALLOWED;
            response.setBody(`Invalid verb received for ${ request.verb.toLocaleLowerCase() }. Only GET and POST are accepted. Verb: ${ request.verb }`);
            return response;
        }

        try {
            let context = new TurnContext(this, body);
            await this.runMiddleware(context, this.logic);

            if (body.type === ActivityTypes.Invoke) {
                let invokeResponse: any = context.turnState.get(INVOKE_RESPONSE_KEY);

                if (invokeResponse && invokeResponse.value) {
                    const value: InvokeResponse = invokeResponse.value;
                    response.statusCode = value.status;
                    response.setBody(value.body);
                } else {
                    response.statusCode = StatusCodes.NOT_IMPLEMENTED;
                }
            } else {
                response.statusCode = StatusCodes.OK;
            }
        } catch (error) {
            response.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
            response.setBody(error);
            return response;
        }

        return response;
    }

    private async handleVersionRequest(request: IReceiveRequest, response: StreamingResponse): Promise<StreamingResponse> {
        if (request.verb.toLocaleUpperCase() === GET) {
            response.statusCode = StatusCodes.OK;

            if (!this.credentials.appId) {
                response.setBody({ UserAgent: USER_AGENT });
                return response;
            }
            
            let token = '';
            try {
                token = await this.credentials.getToken();

            } catch (err) {
                /**
                 * In reality a missing BotToken will cause the channel to close the connection,
                 * but we still send the response and allow the channel to make that decision
                 * instead of proactively disconnecting. This allows the channel to know why
                 * the connection has been closed and make the choice not to make endless reconnection
                 * attempts that will end up right back here.
                 */
                console.error(err.message);
            }
            response.setBody({ UserAgent: USER_AGENT, BotToken: token });

        } else {
            response.statusCode = StatusCodes.METHOD_NOT_ALLOWED;
            response.setBody(`Invalid verb received for path: ${ request.path }. Only GET is accepted. Verb: ${ request.verb }`);
        }

        return response;
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
     * Checks the environment and can set a flag to emulate OAuth cards.
     * 
     * @param context The context object for the turn.
     * 
     * @remarks
     * Override this in a derived class to control how OAuth cards are emulated for unit testing.
     */
    protected checkEmulatingOAuthCards(context: TurnContext): void {
        if (!this._isEmulatingOAuthCards &&
            context.activity.channelId === 'emulator' &&
            (!this.credentials.appId)) {
            this._isEmulatingOAuthCards = true;
        }
    }

    /**
      * Determine if the Activity was sent via an Http/Https connection or Streaming
      * This can be determined by looking at the ServiceUrl property:
      *   (1) All channels that send messages via http/https are not streaming
      *   (2) Channels that send messages via streaming have a ServiceUrl that does not begin with http/https.
      * @param activity the activity.
      */
     private static isFromStreamingConnection(activity: Activity): boolean {
        return activity && this.isStreamingServiceUrl(activity.serviceUrl);
     }

    /**
      * Determine if the serviceUrl was sent via an Http/Https connection or Streaming
      * This can be determined by looking at the ServiceUrl property:
      *   (1) All channels that send messages via http/https are not streaming
      *   (2) Channels that send messages via streaming have a ServiceUrl that does not begin with http/https.
      * @param serviceUrl the serviceUrl provided in the resquest. 
      */
     private static isStreamingServiceUrl(serviceUrl: string): boolean {
        return serviceUrl && !serviceUrl.toLowerCase().startsWith('http');
     }

    private async authenticateConnection(req: WebRequest, channelService?: string): Promise<void> {
        if (!this.credentials.appId) {
            // auth is disabled
            return;
        }

        const authHeader: string = req.headers.authorization || req.headers.Authorization || '';
        const channelIdHeader: string = req.headers.channelid || req.headers.ChannelId || req.headers.ChannelID || '';
        // Validate the received Upgrade request from the channel.
        const claims = await JwtTokenValidation.validateAuthHeader(authHeader, this.credentialsProvider, channelService, channelIdHeader);

        // Add serviceUrl from claim to static cache to trigger token refreshes.
        const serviceUrl = claims.getClaimValue(AuthenticationConstants.ServiceUrlClaim);
        MicrosoftAppCredentials.trustServiceUrl(serviceUrl);

        if (!claims.isAuthenticated) { throw new Error('Unauthorized Access. Request is not authorized'); }
    }

    /**
     * Connects the handler to a Named Pipe server and begins listening for incoming requests.
     * @param pipeName The name of the named pipe to use when creating the server.
     * @param logic The logic that will handle incoming requests.
     */
    private async useNamedPipe(pipeName: string = defaultPipeName, logic: (context: TurnContext) => Promise<any>): Promise<void>{
        if (!logic) {
            throw new Error('Bot logic needs to be provided to `useNamedPipe`');
        }

        this.logic = logic;

        this.streamingServer = new NamedPipeServer(pipeName, this);
        await this.streamingServer.start();
    }

    /**
     * Process the initial request to establish a long lived connection via a streaming server.
     * @param req The connection request.
     * @param res The response sent on error or connection termination.
     * @param logic The logic that will handle incoming requests.
     */
    private async useWebSocket(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {   
        if (!logic) {
            throw new Error('Streaming logic needs to be provided to `useWebSocket`');
        }

        if (!this.webSocketFactory || !this.webSocketFactory.createWebSocket) {
            throw new Error('BotFrameworkAdapter must have a WebSocketFactory in order to support streaming.');
        }

        this.logic = logic;

        // Restify-specific check.
        if (typeof((res as any).claimUpgrade) !== 'function') {
            throw new Error('ClaimUpgrade is required for creating WebSocket connection.');
        }

        try {
            await this.authenticateConnection(req, this.settings.channelService);
        } catch (err) {
            // Set the correct status code for the socket to send back to the channel.
            res.status(StatusCodes.UNAUTHORIZED);
            res.send(err.message);
            // Re-throw the error so the developer will know what occurred.
            throw err;
        }

        const upgrade = (res as any).claimUpgrade();
        const socket = this.webSocketFactory.createWebSocket(req as IncomingMessage, upgrade.socket, upgrade.head);

        await this.startWebSocket(socket);
    }

    /**
     * Connects the handler to a WebSocket server and begins listening for incoming requests.
     * @param socket The socket to use when creating the server.
     */
    private async startWebSocket(socket: ISocket): Promise<void>{
        this.streamingServer = new WebSocketServer(socket, this);
        await this.streamingServer.start();
    }

    private async readRequestBodyAsString(request: IReceiveRequest): Promise<Activity> {
        const contentStream = request.streams[0];
        return await contentStream.readAsJson<Activity>();
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