/**
 * @module botbuilder-ws
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    Activity,
    ActivityTypes,
    ResourceResponse,
    TurnContext
} from 'botbuilder-core';
import {
    ConnectorClient,
    JwtTokenValidation,
    MicrosoftAppCredentials,
    SimpleCredentialProvider
} from 'botframework-connector';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { TokenResolver } from './tokenResolver';
import { BotFrameworkAdapter,
    StatusCodes,
    INVOKE_RESPONSE_KEY,
    BotFrameworkAdapterSettings,
    WebRequest,
    USER_AGENT,
    InvokeResponse,
} from './botFrameworkAdapter';
import {
    IReceiveRequest,
    ISocket,
    IStreamingTransportServer,
    NamedPipeServer,
    NodeWebSocketFactoryBase,
    StreamingResponse,
    WebSocketServer,
    WsNodeWebSocketFactory,
} from 'botframework-streaming';
import { StreamingHttpClient } from './streamingHttpClient';

const defaultPipeName = 'bfv4.pipes';
const VERSION_PATH:string = '/api/version';
const MESSAGES_PATH:string = '/api/messages';
const GET:string = 'GET';
const POST:string = 'POST';

export interface StreamingBotFrameworkAdapterSettings extends BotFrameworkAdapterSettings {
    /**
     * Optional. The option to determine if this adapter accepts WebSocket connections
     */
    enableWebSockets?: boolean;

    /**
     * Optional. Used to pass in a NodeWebSocketFactoryBase instance. Allows bot to accept WebSocket connections.
     */
    webSocketFactory?: NodeWebSocketFactoryBase;

    /**
     * Required.
     */
    logic: (context: TurnContext) => Promise<void>;
}

export class StreamingBotFrameworkAdapter extends BotFrameworkAdapter {
    protected logic: (context: TurnContext) => Promise<void>;
    protected streamingServer: IStreamingTransportServer;
    protected webSocketFactory: any;

    constructor(protected readonly settings: StreamingBotFrameworkAdapterSettings) {
        super(settings);

        // If the developer wants to use WebSockets, but didn't provide a WebSocketFactory,
        // create a NodeWebSocketFactory.
        if (this.settings.enableWebSockets && !this.settings.webSocketFactory) {
            this.webSocketFactory = new WsNodeWebSocketFactory();
        }

        if (this.settings.webSocketFactory) {
            this.webSocketFactory = this.settings.webSocketFactory;
        }

        if (!this.settings.logic) {
            throw new Error('logic is a required setting for the StreamingBotFrameworkAdapter');
        }
        this.logic = this.settings.logic;
    }

    /**
     * Setup a `ws` WebSocket connection on a Upgrade request from the service.
     * @remarks
     * This method should be used in an `'upgrade'`-listener off of the `http.Server`.
     * ```ts
     *  const adapter = new StreamingBotFrameworkAdapter();
     * 
     *  const server = require('http').createServer();
     *  server.on('upgrade', (req, socket, head) => {
     *      adapter.processUpgrade(req, socket, head);
     *  }); 
     * ```
     * @param req 
     * @param socket 
     * @param head 
     */
    public async processUpgrade(req: IncomingMessage, socket: Socket, head: Buffer): Promise<void> {
        if (!(req.headers.Upgrade || req.headers.upgrade)) {
            throw new Error('StreamingBotFrameworkAdapter.procesUpgrade(): Appropriate "Upgrade" header not found');
        }

        // Direct Line Speech currently uses the 'GET' verb to initiate a WebSocket connection.
        if (this.settings.enableWebSockets && req.method === GET) {
            if (!this.logic) {
                throw new Error('Streaming logic needs to be provided to `useWebSocket`');
            }

            if (!this.webSocketFactory || !this.webSocketFactory.createWebSocket) {
                throw new Error('BotFrameworkAdapter must have a WebSocketFactory in order to support streaming.');
            }

            const authenticated = await this.authenticateConnection(req, this.settings.channelService);
            if (!authenticated) {
                const msg = this.createSocketResponse(StatusCodes.UNAUTHORIZED);
                socket.end(msg, 'utf-8');
                return;
            }

            const nodeWebSocket = await this.webSocketFactory.createWebSocket(req, socket, head);

            // Connects the handler to a WebSocket server and begins listening for incoming requests.
            this.streamingServer = new WebSocketServer(nodeWebSocket, this);
            await this.streamingServer.start();
        }
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

        if (StreamingBotFrameworkAdapter.isStreamingServiceUrl(serviceUrl)) {

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

        if (request.verb.toLocaleUpperCase() === GET && request.path.toLocaleLowerCase() === VERSION_PATH) {
            response.statusCode = StatusCodes.OK;
            response.setBody({UserAgent: USER_AGENT});

            return response;
        }

        let body: Activity;
        try {
            body = await this.readRequestBodyAsString(request);

        } catch (error) {
            response.statusCode = StatusCodes.BAD_REQUEST;
            response.setBody(`Unable to read request body. Error: ${ error }`);
            return response;
        }

        if (request.verb.toLocaleUpperCase() !== POST) {
            response.statusCode = StatusCodes.METHOD_NOT_ALLOWED;
            response.setBody(`Method ${ request.verb.toLocaleUpperCase() } not allowed. Expected POST.`);
            return response;
        }

        if (request.path.toLocaleLowerCase() !== MESSAGES_PATH) {
            response.statusCode = StatusCodes.NOT_FOUND;
            response.setBody(`Path ${ request.path.toLocaleLowerCase() } not not found. Expected ${ MESSAGES_PATH }}.`);
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

    /**
     * Used to generate a response to send via the `net.Socket`.
     * @param statusCode StatusCodes
     */
    private createSocketResponse(statusCode: StatusCodes): string {
        switch (statusCode) {
            case StatusCodes.UNAUTHORIZED:
                return 'HTTP/1.1 401 Unauthorized';
            
            // Default is for 500 Internal Server Errors.
            default:
                return 'HTTP1/1.1 500 Internal Server Error';
        }
    }

    private async readRequestBodyAsString(request: IReceiveRequest): Promise<Activity> {
        try {
            let contentStream =  request.streams[0];
            return await contentStream.readAsJson<Activity>();
        } catch (error) {
            return Promise.reject(error);
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
                    if (StreamingBotFrameworkAdapter.isFromStreamingConnection(activity as Activity)) {
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
      * Determine if the Activity was sent via an Http/Https connection or Streaming
      * This can be determined by looking at the ServiceUrl property:
      *   (1) All channels that send messages via http/https are not streaming
      *   (2) Channels that send messages via streaming have a ServiceUrl that does not begin with http/https.
      * @param activity the activity.
      */
     protected static isFromStreamingConnection(activity: Activity): boolean {
        return activity && this.isStreamingServiceUrl(activity.serviceUrl);
     }

    /**
      * Determine if the serviceUrl was sent via an Http/Https connection or Streaming
      * This can be determined by looking at the ServiceUrl property:
      *   (1) All channels that send messages via http/https are not streaming
      *   (2) Channels that send messages via streaming have a ServiceUrl that does not begin with http/https.
      * @param serviceUrl the serviceUrl provided in the resquest. 
      */
     protected static isStreamingServiceUrl(serviceUrl: string): boolean {
        return serviceUrl && !serviceUrl.toLowerCase().startsWith('http');
     }

     private async authenticateConnection(req: WebRequest, channelService?: string): Promise<boolean> {
        if (!this.credentials.appId || !this.credentials.appPassword) {
            // auth is disabled
            return true;    
        }

        const authHeader: string = req.headers.authorization || req.headers.Authorization || '';
        const channelIdHeader: string = req.headers.channelid || req.headers.ChannelId || req.headers.ChannelID || '';
        const claims = await JwtTokenValidation.validateAuthHeader(authHeader, this.credentialsProvider, channelService, channelIdHeader);
        return claims.isAuthenticated;
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
}

function delay(timeout: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}
