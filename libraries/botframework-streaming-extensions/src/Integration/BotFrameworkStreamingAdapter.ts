/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotFrameworkAdapter, BotFrameworkAdapterSettings } from 'botbuilder';
import { TurnContext } from 'botbuilder-core';
import { ConnectorClient } from 'botframework-connector';
import { IStreamingTransportServer } from '../IStreamingTransportServer';
import { StreamingHttpClient } from './StreamingHttpClient';

export class BotFrameworkStreamingAdapter extends BotFrameworkAdapter {
    private readonly server: IStreamingTransportServer;

    /// <summary> 
    /// Creates a new instance of the BotFrameworkStreamingAdapter class.
    /// <param name="server"> The streaming transport server to send responses over. </param>
    /// <param name="settings"> The assorted settings to register with the base adapter. </param>
    /// </summary>
    public constructor(server: IStreamingTransportServer, settings?: Partial<BotFrameworkAdapterSettings>) {
        super(settings);

        this.server = server;
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

    // Used to allow the request handler to run the middleware pipeline for incoming activities.
    public async executePipeline(context: TurnContext, logic: (Context: TurnContext) => Promise<void>): Promise<void> {
        await this.runMiddleware(context, logic);
    }

    // Incoming requests should be handled by the request handler, not the adapter.
    public async processActivity(req, res, logic): Promise<void> {
        throw new Error(`Not implemented. ${ req }, ${ res }, ${ logic }.`);
    }
}
