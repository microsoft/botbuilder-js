/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotFrameworkAdapterSettings, InvokeResponse, BotFrameworkAdapter } from 'botbuilder';
import { ActivityHandler, Middleware, MiddlewareHandler, TurnContext } from 'botbuilder-core';
import { ConnectorClient } from 'botframework-connector';
import { Activity, ActivityTypes } from 'botframework-schema';
import * as os from 'os';
import { NamedPipeServer, RequestHandler, StreamingResponse, WebSocketServer } from '..';
import { ISocket, IStreamingTransportServer, IReceiveRequest } from '../Interfaces';
import { StreamingHttpClient } from './StreamingHttpClient';

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

const pjson: any = require('../../package.json');
const VERSION_PATH:string = '/api/version';
const MESSAGES_PATH:string = '/api/messages';
const INVOKE_RESPONSE:string = 'BotFrameworkStreamingAdapter.InvokeResponse';
const GET:string = 'GET';
const POST:string = 'POST';
let USER_AGENT:string;

/// <summary>
/// Used to process incoming requests sent over an <see cref="IStreamingTransport"/> and adhering to the Bot Framework Protocol v3 with Streaming Extensions.
/// </summary>
export class StreamingRequestHandler extends BotFrameworkAdapter implements RequestHandler {
    public bot: ActivityHandler;
    public logger;
    public server: IStreamingTransportServer;
    public middleWare: (MiddlewareHandler|Middleware)[];

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
    /// Connects the handler to a Named Pipe server and begins listening for incoming requests.
    /// </summary>
    /// <param name="pipeName">The name of the named pipe to use when creating the server.</param>
    public async startNamedPipe(pipename: string): Promise<void>{
        this.server = new NamedPipeServer(pipename, this);
        await this.server.start();
    }

    /// <summary>
    /// Connects the handler to a WebSocket server and begins listening for incoming requests.
    /// </summary>
    /// <param name="socket">The socket to use when creating the server.</param>
    public async startWebSocket(socket: ISocket): Promise<void>{
        this.server = new WebSocketServer(socket, this);
        await this.server.start();
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


    /// <summary>
    /// Checks the validity of the request and attempts to map it the correct virtual endpoint,
    /// then generates and returns a response if appropriate.
    /// </summary>
    /// <param name="request">A ReceiveRequest from the connected channel.</param>
    /// <returns>A response created by the BotAdapter to be sent to the client that originated the request.</returns>
    public async processRequest(request: IReceiveRequest): Promise<StreamingResponse> {
        let response = new StreamingResponse();
        let body = await this.readRequestBodyAsString(request);
        if (body === undefined || request.streams === undefined) {
            response.statusCode = StatusCodes.BAD_REQUEST;
            this.logger.log('Request missing body and/or streams.');

            return response;
        }

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

        if (request.verb.toLocaleUpperCase() !== POST) {
            response.statusCode = StatusCodes.METHOD_NOT_ALLOWED;

            return response;
        }

        if (request.path.toLocaleLowerCase() !== MESSAGES_PATH) {
            response.statusCode = StatusCodes.NOT_FOUND;

            return response;
        }

        try {
            let activity: Activity = body;
           
            this.middleWare.forEach((mw): void => {
                this.use(mw);
            });
            let context = new TurnContext(this, activity);
            await this.runMiddleware(context, async (turnContext): Promise<void> => {
                await this.bot.run(turnContext);
            });

            if (activity.type === ActivityTypes.Invoke) {
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

    private async readRequestBodyAsString(request: IReceiveRequest): Promise<Activity> {
        if (request.streams !== undefined && request.streams[0] !== undefined) {
            let contentStream =  request.streams[0];
            try {
                return await contentStream.readAsJson<Activity>();
            } catch (error) {
                this.logger.log(error);
            }
        }

        return;
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
