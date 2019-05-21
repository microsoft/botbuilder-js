import { ActivityHandler, BotFrameworkAdapterSettings } from 'botbuilder';
import { NamedPipeServer } from 'microsoft-bot-protocol-namedpipe';
import { StreamingRequestHandler } from './StreamingRequestHandler';

export class NamedPipeConnector {
  private logger;
  private readonly pipeName: string;
  private readonly bot: ActivityHandler;
  private readonly defaultPipeName = 'bfv4.pipes';

  constructor(bot: ActivityHandler, pipeName?: string, logger?) {
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

    if (pipeName === undefined) {
      this.pipeName = this.defaultPipeName;
    } else {
      this.pipeName = pipeName;
    }

  }

  public async processAsync(settings: BotFrameworkAdapterSettings) {

    let handler = new StreamingRequestHandler(this.bot);
    this.logger.log('Creating server for Named Pipe connection.');
    let server = new NamedPipeServer(this.pipeName, handler);
    handler.setServer(server);
    handler.adapterSettings = settings;
    this.logger.log(`Listening on Named Pipe: ${this.pipeName}`);
    await server.startAsync();
  }
}
