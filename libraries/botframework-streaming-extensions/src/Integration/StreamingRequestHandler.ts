/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    BotFrameworkAdapterSettings,
    InvokeResponse
} from 'botbuilder';
import {
    ActivityHandler,
    Middleware,
    MiddlewareHandler,
    TurnContext
} from 'botbuilder-core';
import {
    Activity,
    ActivityTypes
} from 'botframework-schema';
import * as os from 'os';
import { IStreamingTransportServer, NamedPipeServer, ReceiveRequest, RequestHandler, StreamingResponse, WebSocketServer } from '..';
const pjson: any = require('../../package.json');
import { ISocket } from '../WebSocket';
import { BotFrameworkStreamingAdapter } from './BotFrameworkStreamingAdapter';

/// <summary>
/// Used to process incoming requests sent over an <see cref="IStreamingTransport"/> and adhering to the Bot Framework Protocol v3 with Streaming Extensions.
/// </summary>
export class StreamingRequestHandler implements RequestHandler {
    public bot: ActivityHandler;
    public adapterSettings: BotFrameworkAdapterSettings;
    public logger;
    public server: IStreamingTransportServer;
    public adapter: BotFrameworkStreamingAdapter;
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
    public constructor(bot: ActivityHandler, logger?, settings?: BotFrameworkAdapterSettings, middleWare?: (MiddlewareHandler|Middleware)[]) {

        if (bot === undefined) {
            throw new Error('Undefined Argument: Bot can not be undefined.');
        } else {
            this.bot = bot;
        }

        if (logger === undefined) {
            this.logger = console;
        } else {
            this.logger = logger;
        }

        this.adapterSettings = settings;

        if(middleWare === undefined) {
            this.middleWare = [];
        } else {
            this.middleWare = middleWare;
        }        
    }

    /// <summary>
    /// Connects the handler to a Named Pipe server and begins listening for incoming requests.
    /// </summary>
    /// <param name="pipeName">The name of the named pipe to use when creating the server.</param>
    public async startNamedPipe(pipename: string): Promise<void>{
        this.server = new NamedPipeServer(pipename, this);
        this.adapter = new BotFrameworkStreamingAdapter(this.server, this.adapterSettings);
        await this.server.start();
    }

    /// <summary>
    /// Connects the handler to a WebSocket server and begins listening for incoming requests.
    /// </summary>
    /// <param name="socket">The socket to use when creating the server.</param>
    public async startWebSocket(socket: ISocket): Promise<void>{
        this.server = new WebSocketServer(socket, this);
        this.adapter = new BotFrameworkStreamingAdapter(this.server, this.adapterSettings);
        await this.server.start();
    }


    /// <summary>
    /// Checks the validity of the request and attempts to map it the correct virtual endpoint,
    /// then generates and returns a response if appropriate.
    /// </summary>
    /// <param name="request">A ReceiveRequest from the connected channel.</param>
    /// <returns>A response created by the BotAdapter to be sent to the client that originated the request.</returns>
    public async processRequest(request: ReceiveRequest): Promise<StreamingResponse> {
        let response = new StreamingResponse();
        let body = await this.readRequestBodyAsString(request);
        if (body === undefined || request.Streams === undefined) {
            response.statusCode = 400;
            this.logger.log('Request missing body and/or streams.');

            return response;
        }

        if (!request || !request.Verb || !request.Path) {
            response.statusCode = 400;
            this.logger.log('Request missing verb and/or path.');

            return response;
        }

        if (request.Verb.toLocaleUpperCase() === 'GET' && request.Path.toLocaleLowerCase() === '/api/version') {
            response.statusCode = 200;
            response.setBody(this.getUserAgent());

            return response;
        }

        if (request.Verb.toLocaleUpperCase() !== 'POST') {
            response.statusCode = 405;

            return response;
        }

        if (request.Path.toLocaleLowerCase() !== '/api/messages') {
            response.statusCode = 404;

            return response;
        }

        try {
            let activity: Activity = body;
            let adapter: BotFrameworkStreamingAdapter = new BotFrameworkStreamingAdapter(this.server, this.adapterSettings);
            this.middleWare.forEach((mw): void => {
                adapter.use(mw);
            });
            let context = new TurnContext(adapter, activity);
            await adapter.executePipeline(context, async (turnContext): Promise<void> => {
                await this.bot.run(turnContext);
            });

            if (activity.type === ActivityTypes.Invoke) {
                let invokeResponse: any = context.turnState.get('BotFrameworkStreamingAdapter.InvokeResponse');

                if (invokeResponse && invokeResponse.value) {
                    const value: InvokeResponse = invokeResponse.value;
                    response.statusCode = value.status;
                    response.setBody(value.body);
                } else {
                    response.statusCode = 501;
                }
            } else {
                response.statusCode = 200;
            }
        } catch (error) {
            response.statusCode = 500;
            this.logger.log(error);

            return response;

        }

        return response;
    }

    private async readRequestBodyAsString(request: ReceiveRequest): Promise<Activity> {
        if (request.Streams !== undefined && request.Streams[0] !== undefined) {
            let contentStream =  request.Streams[0];
            try {
                return await contentStream.readAsJson<Activity>();
            } catch (error) {
                this.logger.log(error);
            }
        }

        return;
    }

    private getUserAgent(): string {
        const ARCHITECTURE: any = os.arch();
        const TYPE: any = os.type();
        const RELEASE: any = os.release();
        const NODE_VERSION: any = process.version;

        return `Microsoft-BotFramework/3.1 BotBuilder/${ pjson.version } ` +
        `(Node.js,Version=${ NODE_VERSION }; ${ TYPE } ${ RELEASE }; ${ ARCHITECTURE })`;
    }
}
