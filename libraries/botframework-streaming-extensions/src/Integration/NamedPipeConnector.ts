/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotFrameworkAdapterSettings } from 'botbuilder';
import { ActivityHandler, Middleware, MiddlewareHandler } from 'botbuilder-core';
import { StreamingRequestHandler } from './StreamingRequestHandler';

export class NamedPipeConnector {
/*  The default named pipe all instances of DL ASE listen on is named bfv4.pipes
    Unfortunately this name is no longer very discriptive, but for the time being
    we're unable to change it without coordinated updates to DL ASE, which we
    currently are unable to perform.
*/
    private readonly defaultPipeName = 'bfv4.pipes';
    private readonly pipeName: string;
    private readonly logger;
    private readonly bot: ActivityHandler;
    private readonly middleWare: (MiddlewareHandler|Middleware)[];

    /// <summary>
    /// Initializes a new instance of the <see cref="NamedPipeConnector"/> class.
    /// Constructor for use when establishing a connection with a NamedPipe server.
    /// </summary>
    /// <param name="bot">The bot to use when processing requests on this connection.</param>
    /// <param name="logger">Optional logger.</param>
    /// <param name="middleware">Optional collection of middleware.</param>
    public constructor(bot: ActivityHandler, logger?, pipeName?: string, middleWare?: (MiddlewareHandler|Middleware)[]) {        
        this.bot = bot;        

        if (logger === undefined) {
            this.logger = console;
        }

        if (pipeName === undefined) {
            this.pipeName = this.defaultPipeName;
        } else {
            this.pipeName = pipeName;
        }

        this.middleWare = middleWare;
    }

    /// <summary>
    /// Process the initial request to establish a long lived connection via a streaming server.
    /// </summary>
    /// <param name="settings">Settings to set on the BotframeworkAdapter.</param>
    public async process(settings: BotFrameworkAdapterSettings): Promise<void> {
        let handler = new StreamingRequestHandler( this.bot, this.logger, settings, this.middleWare);

        await handler.startNamedPipe(this.pipeName);
    }
}
