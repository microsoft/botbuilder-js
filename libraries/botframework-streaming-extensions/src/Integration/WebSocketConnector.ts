/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    BotFrameworkAdapterSettings,
    WebRequest
} from 'botbuilder';
import {
    ActivityHandler,
    Middleware,
    MiddlewareHandler
} from 'botbuilder-core';
import {
    JwtTokenValidation,
    MicrosoftAppCredentials,
    SimpleCredentialProvider
} from 'botframework-connector';
import { Watershed } from 'watershed';
import { StreamingRequestHandler } from './StreamingRequestHandler';
import { NodeWebSocket } from '..';

export class WebSocketConnector {
    private readonly logger;
    private readonly bot: ActivityHandler;
    private readonly middleWare: (MiddlewareHandler|Middleware)[];

    /// <summary>
    /// Initializes a new instance of the <see cref="WebSocketConnector"/> class.
    /// Constructor for use when establishing a connection with a WebSocket server.
    /// </summary>
    /// <param name="bot">The bot to use when processing requests on this connection.</param>
    /// <param name="logger">Optional logger.</param>
    /// <param name="middleware">Optional collection of middleware.</param>
    public constructor(bot: ActivityHandler, logger?, middleWare?: (MiddlewareHandler|Middleware)[]) {
        if (bot === undefined) {
            throw new Error('Undefined Argument: Bot can not be undefined.');
        } else {
            this.bot = bot;
        }

        if (logger === undefined) {
            this.logger = console;
        }

        this.middleWare = middleWare;
    }

    /// <summary>
    /// Process the initial request to establish a long lived connection via a streaming server.
    /// </summary>
    /// <param name="req">The connection request.</param>
    /// <param name="res">The response sent on error or connection termination.</param>
    /// <param name="settings">Settings to set on the BotframeworkAdapter.</param>
    public async process(req, res, settings: BotFrameworkAdapterSettings): Promise<void> {
        if (!res.claimUpgrade) {
            let e = new Error('Upgrade to WebSockets required.');
            this.logger.log(e);
            res.status(426);
            res.send(e.message);

            return;
        }

        if (req === undefined) {
            let e = new Error('Argument Null Exception: Request cannot be undefined.');
            this.logger.log(e);
            res.status(400);
            res.send(e.message);

            return;
        }

        if (res === undefined) {
            let e = new Error('Argument Null Exception: Response cannot be undefined.');
            this.logger.log(e);
            res.status(400);
            res.send(e.message);

            return;
        }

        const authenticated = await this.authenticateConnection(req, settings.appId, settings.appPassword, settings.channelService);
        if (!authenticated) {
            this.logger.log('Unauthorized connection attempt.');
            res.status(401);

            return;
        }

        const upgrade = res.claimUpgrade();
        const ws = new Watershed();
        const socket = ws.accept(req, upgrade.socket, upgrade.head);
        let handler = new StreamingRequestHandler(this.bot, this.logger, settings, this.middleWare);

        await handler.startWebSocket(new NodeWebSocket(socket));
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
}
