/**
 * @module botbuilder-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotFrameworkAdapterSettings, InvokeResponse, BotFrameworkAdapter, WebRequest, WebResponse } from 'botbuilder';
import { ActivityHandler, Middleware, MiddlewareHandler, TurnContext } from 'botbuilder-core';
import { ConnectorClient, JwtTokenValidation, MicrosoftAppCredentials, SimpleCredentialProvider } from 'botframework-connector';
import { Activity, ActivityTypes } from 'botframework-schema';
import * as os from 'os';
import { ISocket, IStreamingTransportServer, IReceiveRequest, NamedPipeServer, NodeWebSocket,
     RequestHandler, StreamingResponse, WebSocketServer, StreamingRequest } from 'botframework-streaming-extensions'; //TODO: When integration layer is moved this will need to reference the external library.
import { HttpClient, HttpOperationResponse, WebResource } from '@azure/ms-rest-js';
import { Watershed } from 'watershed'; 
import { Request, ServerUpgradeResponse } from 'restify';

export enum StatusCodes {
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    UPGRADE_REQUIRED = 426,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
}

const defaultPipeName = 'bfv4.pipes';
const pjson: any = require('../package.json');
const VERSION_PATH:string = '/api/version';
const MESSAGES_PATH:string = '/api/messages';
const INVOKE_RESPONSE:string = 'BotFrameworkStreamingAdapter.InvokeResponse';
const GET:string = 'GET';
const POST:string = 'POST';
let USER_AGENT:string;

/// <summary>
/// Used to process incoming requests sent over an <see cref="IStreamingTransport"/> and adhering to the Bot Framework Protocol v3 with Streaming Extensions.
/// </summary>
export class BotFrameworkStreamingAdapter extends BotFrameworkAdapter implements RequestHandler {
    private bot: ActivityHandler;
    private logger;
    private server: IStreamingTransportServer;
    private middleWare: (MiddlewareHandler|Middleware)[];

    /// <summary>
    /// Initializes a new instance of the <see cref="StreamingRequestHandler"/> class.
    /// The StreamingRequestHandler serves as a translation layer between the transport layer and bot adapter.
    /// It receives ReceiveRequests from the transport and provides them to the bot adapter in a form
    /// it is able to build activities out of, which are then handed to the bot itself to processed.
    /// Throws error if arguments are null.
    /// </summary>
    /// <param name="bot">The bot to be used for all requests to this handler.</param>
    /// <param name="logger">Optional logger, defaults to console.</param>
    /// <param name="settings">The settings for use with the BotFrameworkAdapter.</param>
    /// <param name="middlewareSet">An optional set of middleware to register with the adapter.</param>
    public constructor(bot: ActivityHandler, logger = console, settings?: BotFrameworkAdapterSettings, middleWare: (MiddlewareHandler|Middleware)[] = []) {
        super(settings);
        this.bot = bot;
        this.logger = logger;
        this.middleWare = middleWare;        
    }

    /// <summary>
    /// Process the initial request to establish a long lived connection via a streaming server.
    /// </summary>
    /// <param name="req">The connection request.</param>
    /// <param name="res">The response sent on error or connection termination.</param>
    /// <param name="settings">Settings to set on the BotframeworkAdapter.</param>
    public async connectWebSocket(req: Request, res: ServerUpgradeResponse, settings: BotFrameworkAdapterSettings): Promise<void> {
        if (!req.isUpgradeRequest()) {
            let e = new Error('Upgrade to WebSockets required.');
            this.logger.log(e);
            res.status(StatusCodes.UPGRADE_REQUIRED);
            res.send(e.message);

            return Promise.resolve();
        }

        const authenticated = await this.authenticateConnection(req, settings.appId, settings.appPassword, settings.channelService);
        if (!authenticated) {
            this.logger.log('Unauthorized connection attempt.');
            res.status(StatusCodes.UNAUTHORIZED);

            return Promise.resolve();
        }

        const upgrade = res.claimUpgrade();
        const ws = new Watershed();
        const socket = ws.accept(req, upgrade.socket, upgrade.head);

        await this.startWebSocket(new NodeWebSocket(socket));
    } 

    /// <summary>
    /// Connects the handler to a Named Pipe server and begins listening for incoming requests.
    /// </summary>
    /// <param name="pipeName">The name of the named pipe to use when creating the server.</param>
    public async connectNamedPipe(pipename: string = defaultPipeName): Promise<void>{
        this.server = new NamedPipeServer(pipename, this);
        await this.server.start();
    }

    /// <summary>
    /// Checks the validity of the request and attempts to map it the correct virtual endpoint,
    /// then generates and returns a response if appropriate.
    /// </summary>
    /// <param name="request">A ReceiveRequest from the connected channel.</param>
    /// <returns>A response created by the BotAdapter to be sent to the client that originated the request.</returns>
    public async processRequest(request: IReceiveRequest): Promise<StreamingResponse> {
        let response = new StreamingResponse();

        if (!request || !request.verb || !request.path) {
            response.statusCode = StatusCodes.BAD_REQUEST;
            this.logger.log('Request missing verb and/or path.');

            return response;
        }

        if (request.verb.toLocaleUpperCase() === GET && request.path.toLocaleLowerCase() === VERSION_PATH) {
            response.statusCode = StatusCodes.OK;
            response.setBody(this.getUserAgent());

            return response;
        }

        let body: Activity;
        try {
            body = await this.readRequestBodyAsString(request);

        } catch (error) {
            response.statusCode = StatusCodes.BAD_REQUEST;
            this.logger.log('Unable to read request body. Error: ' + error);

            return response;
        }

        if (request.verb.toLocaleUpperCase() !== POST) {
            response.statusCode = StatusCodes.METHOD_NOT_ALLOWED;

            return response;
        }

        if (request.path.toLocaleLowerCase() !== MESSAGES_PATH) {
            response.statusCode = StatusCodes.NOT_FOUND;

            return response;
        }

        try {           
            this.middleWare.forEach((mw): void => {
                this.use(mw);
            });
            let context = new TurnContext(this, body);
            await this.runMiddleware(context, async (turnContext): Promise<void> => {
                await this.bot.run(turnContext);
            });

            if (body.type === ActivityTypes.Invoke) {
                let invokeResponse: any = context.turnState.get(INVOKE_RESPONSE);

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
            this.logger.log(error);

            return response;

        }

        return response;
    }

    /// <summary>
    /// Hides the adapter's built in means of creating a connector client
    /// and subtitutes a StreamingHttpClient in place of the standard HttpClient,
    /// thus allowing compatibility with streaming extensions.
    /// </summary>
    public createConnectorClient(serviceUrl: string): ConnectorClient {
        return new ConnectorClient(
            this.credentials,
            {
                baseUri: serviceUrl,
                userAgent: super['USER_AGENT'],
                httpClient: new StreamingHttpClient(this.server)
            });
    }

    private async authenticateConnection(req: WebRequest, appId?: string, appPassword?: string, channelService?: string): Promise<boolean> {
        if (!appId || !appPassword) {
            // auth is disabled
            return true;
        }

        try {
            let authHeader: string = req.headers.authorization || req.headers.Authorization || '';
            let channelIdHeader: string = req.headers.channelid || req.headers.ChannelId || req.headers.ChannelID || '';
            let credentials = new MicrosoftAppCredentials(appId, appPassword);
            let credentialProvider = new SimpleCredentialProvider(credentials.appId, credentials.appPassword);
            let claims = await JwtTokenValidation.validateAuthHeader(authHeader, credentialProvider, channelService, channelIdHeader);

            return claims.isAuthenticated;
        } catch (error) {
            this.logger.log(error);

            return false;
        }
    }
    
    /// <summary>
    /// Connects the handler to a WebSocket server and begins listening for incoming requests.
    /// </summary>
    /// <param name="socket">The socket to use when creating the server.</param>
    private async startWebSocket(socket: ISocket): Promise<void>{
        this.server = new WebSocketServer(socket, this);
        await this.server.start();
    }

    private async readRequestBodyAsString(request: IReceiveRequest): Promise<Activity> {            
        try {
            let contentStream =  request.streams[0];

            return await contentStream.readAsJson<Activity>();
        } catch (error) {
            this.logger.log(error);

            return Promise.reject(error);
        }
    }

    private getUserAgent(): string {
        if(USER_AGENT){
            return USER_AGENT;
        }
        const ARCHITECTURE: any = os.arch();
        const TYPE: any = os.type();
        const RELEASE: any = os.release();
        const NODE_VERSION: any = process.version;
        USER_AGENT = `Microsoft-BotFramework/3.1 BotBuilder/${ pjson.version } ` +
        `(Node.js,Version=${ NODE_VERSION }; ${ TYPE } ${ RELEASE }; ${ ARCHITECTURE })`;

        return USER_AGENT;
    }
}

class StreamingHttpClient implements HttpClient {
    private readonly server: IStreamingTransportServer;

    public constructor(server: IStreamingTransportServer) {
        this.server = server;
    }

    /// <summary>
    /// This function hides the default sendRequest of the HttpClient, replacing it
    /// with a version that takes the WebResource created by the BotFrameworkAdapter
    /// and converting it to a form that can be sent over a streaming transport.
    /// </summary>
    /// <param name="httpRequest">The outgoing request created by the BotframeworkAdapter.</param>
    /// <returns>The streaming transport compatible response to send back to the client.</returns>
    public async sendRequest(httpRequest: WebResource): Promise<HttpOperationResponse> {
        const request = this.mapHttpRequestToProtocolRequest(httpRequest);
        request.path = request.path.substring(request.path.indexOf('/v3'));
        const res = await this.server.send(request);

        return {
            request: httpRequest,
            status: res.statusCode,
            headers: httpRequest.headers,
            readableStreamBody: res.streams.length > 0 ? res.streams[0].getStream() : undefined
        };
    }

    private mapHttpRequestToProtocolRequest(httpRequest: WebResource): StreamingRequest {

        return StreamingRequest.create(httpRequest.method, httpRequest.url, httpRequest.body);
    }
}
