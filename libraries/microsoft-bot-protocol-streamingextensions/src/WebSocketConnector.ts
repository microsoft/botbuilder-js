import {
  ActivityHandler,
  BotFrameworkAdapterSettings,
  WebRequest
} from 'botbuilder';

import {
  JwtTokenValidation,
  MicrosoftAppCredentials,
  SimpleCredentialProvider
} from 'botframework-connector';

import { NodeSocket, Server } from 'microsoft-bot-protocol-websocket';
import { StreamingRequestHandler } from './StreamingRequestHandler';

// tslint:disable-next-line:no-var-requires no-require-imports
const Watershed = require('watershed').Watershed;

export class WebSocketConnector {
  private readonly logger;
  private readonly bot: ActivityHandler;

  constructor(bot: ActivityHandler, logger?) {
    if (logger === undefined) {
      this.logger = console;
    }

    if (bot === undefined) {
      throw new Error('Undefined Argument: Bot can not be undefined.');
    } else {
      this.bot = bot;
    }
  }

  public async authenticateConnection(req: WebRequest, appId?: string, appPassword?: string, channelService?: string): Promise<Boolean> {
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

  public async processAsync(req, res, settings: BotFrameworkAdapterSettings) {
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

    // let adapter = new BotFrameworkStreamingAdapter();
    // let handler = new StreamingRequestHandler(
    //   adapter.processActivity(
    //     req,
    //     res,
    //     async (turnContext) => {
    //       // route to bot activity handler.
    //       await bot.run(turnContext);
    //     }));

    const upgrade = res.claimUpgrade();
    const ws = new Watershed();
    const socket = ws.accept(req, upgrade.socket, upgrade.head);

    let handler = new StreamingRequestHandler(this.bot);
    this.logger.log('Creating socket for WebSocket connection.');
    let nodeSocket = new NodeSocket({ serverSocket: socket });
    this.logger.log('Creating server for WebSocket connection.');
    let server = new Server(nodeSocket, handler);
    handler.setServer(server);
    handler.adapterSettings = settings;
    this.logger.log('Listening on WebSocket server.');
    await server.startAsync();
  }
}
