import {
  Activity,
  ActivityHandler,
  ActivityTypes,
  BotFrameworkAdapterSettings,
  InvokeResponse,
  TurnContext
} from 'botbuilder';
import { IStreamingTransportServer, ReceiveRequest, RequestHandler, Response, Request } from 'microsoft-bot-protocol';
import { BotFrameworkStreamingAdapter } from './BotFrameworkStreamingAdapter';

export class StreamingRequestHandler implements RequestHandler {
  public bot: ActivityHandler; // (context: TurnContext) => Promise<any>;
  public adapterSettings: BotFrameworkAdapterSettings;
  public logger;
  public server: IStreamingTransportServer;
  public adapter: BotFrameworkStreamingAdapter;

  constructor(bot: ActivityHandler, logger?, settings?: BotFrameworkAdapterSettings) {

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
  }

  public setServer(server: IStreamingTransportServer) {
    this.server = server;
    this.adapter = new BotFrameworkStreamingAdapter(server, this.adapterSettings);
  }

  public async processRequestAsync(request: ReceiveRequest, logger): Promise<Response> {

    let response = new Response();
    let body = await this.readRequestBodyAsString(request);
    if (body === undefined || request.Streams === undefined) {
      response.statusCode = 500;
      this.logger.log('Request missing body and/or streams.');

      return response;
    }

    try {
      let activity: Activity = body;
      let adapter: BotFrameworkStreamingAdapter = new BotFrameworkStreamingAdapter(this.server, this.adapterSettings);
      let context = new TurnContext(adapter, activity);
      await adapter.executePipeline(context, async (turnContext) => {
        await this.bot.run(turnContext);
      });

      if (activity.type === ActivityTypes.Invoke) {
        // tslint:disable-next-line: no-backbone-get-set-outside-model
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

  public async readRequestBodyAsString(request: ReceiveRequest): Promise<Activity> {
    if (request.Streams !== undefined && request.Streams[0] !== undefined) {
      let contentStream =  request.Streams[0];
// tslint:disable-next-line: no-unnecessary-local-variable
      let streamAsString = await contentStream.readAsJson<Activity>();

      return streamAsString;
    }

    return undefined;
  }
}
