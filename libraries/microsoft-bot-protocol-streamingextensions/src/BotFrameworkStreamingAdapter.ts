import { BotFrameworkAdapter, BotFrameworkAdapterSettings, TurnContext } from 'botbuilder';
import { ConnectorClient } from 'botframework-connector';
import { IStreamingTransportServer } from 'microsoft-bot-protocol';
import { StreamingHttpClient } from './StreamingHttpClient';

export class BotFrameworkStreamingAdapter extends BotFrameworkAdapter {
  private readonly server: IStreamingTransportServer;

  constructor(server: IStreamingTransportServer, settings?: Partial<BotFrameworkAdapterSettings>) {
    super(settings);

    this.server = server;
  }

  public createConnectorClient(serviceUrl: string): ConnectorClient {
    return new ConnectorClient(
      this.credentials,
      {
        baseUri: serviceUrl,
        userAgent: 'TODO',
        httpClient: new StreamingHttpClient(this.server)
      });
  }

  // Used to allow the request handler to run the middleware pipeline for incoming activities.
  public async executePipeline(context: TurnContext, logic: (Context: TurnContext) => Promise<void>) {
    await this.runMiddleware(context, logic);
  }

  // Incoming requests should be handled by the request handler, not the adapter.
  public async processActivity(req, res, logic) {
    throw new Error('Not implemented.');
  }
}
