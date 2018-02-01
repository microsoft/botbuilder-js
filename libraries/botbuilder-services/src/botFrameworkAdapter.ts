/**
* @module botbuilder-services
*/
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Activity, ActivityTypes, ActivityAdapter, ConversationReference, ConversationResourceResponse, ConversationParameters, ConversationAccount } from 'botbuilder';
import { MicrosoftAppCredentials, BotAuthenticator, Headers, BotCredentials } from 'botframework-connector-auth';
import ConnectorClient = require('botframework-connector');

/** Express or Restify Request object. */
export interface WebRequest {
    body: any;
    headers: Headers;
    on(event: string, ...args: any[]): void;
}

/** Express or Restify Response object. */
export interface WebResponse {
    end(): this;
    send(status: number, body?: any): this;
    send(body: any): this;
    status(code: number): this;
}

/** Express or Restify Middleware Function. */
export interface WebMiddleware {
    (req: WebRequest, res: WebResponse, next?: Function): void;
}

/** Bot Framework Adapter Settings */
export interface BotAdapterSettings {
    appId?: string,
    appPassword?: string
}

/**
* ActivityAdapter class needed to communicate with a Bot Framework channel or the Emulator.
*
* **Usage Example**
*
* ```js
* import { Bot } from 'botbuilder-core';
* import { BotFrameworkAdapter } from 'botbuilder-services';
* import * as restify from 'restify';
* 
 * // Create server
* let server = restify.createServer();
* server.listen(process.env.port || process.env.PORT || 3978, function () {
*     console.log('%s listening to %s', server.name, server.url);
* });
* 
 * // Create activity adapter and listen to our servers '/api/messages' route.
* const activityAdapter = new BotFrameworkAdapter({ appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD});
* server.post('/api/messages', activityAdapter.listen() as any);
* 
 * // Initialize bot by passing it a activity Adapter
* const bot = new Bot(activityAdapter)
*     .onReceive((context) => {
*         context.reply(`Hello World`);
*     });
* ```
*/
export class BotFrameworkAdapter implements ActivityAdapter {
    private nextId = 0;
    private credentials: MicrosoftAppCredentials;
    private authenticator: BotAuthenticator;

    /**
     * Creates a new instance of the activity adapter.
     *
     * @param settings (optional) settings object
     */
    public constructor(settings?: BotAdapterSettings) {
        settings = settings === undefined ? {appId: '', appPassword: ''} : settings;
        const botCredentials: BotCredentials = { appId: settings.appId, appPassword: settings.appPassword };
        this.credentials = new MicrosoftAppCredentials(botCredentials);
        this.authenticator = new BotAuthenticator(botCredentials);
        this.onReceive = undefined as any;
    }

    public onReceive: (activity: Partial<Activity>) => Promise<void>;

    /**
     * Creates a new conversation
     *
     * @param {ConversationParameters} conversationParameters
     * @param {ConversationReference} conversationReference
     * @returns {Promise<ConversationResourceResponse>}
     */
    public createConversation(conversationParameters: ConversationParameters, conversationReference: ConversationReference): Promise<ConversationResourceResponse> {
        let conversationResourceResponse: ConversationResourceResponse = {
            activityId: conversationReference.activityId,
            serviceUrl: conversationReference.serviceUrl,
            id: ''
        };
        return new Promise<ConversationResourceResponse>(async (resolve, reject) => {
            try {
                let client = new ConnectorClient(this.credentials);
                let response = await client.conversations.createConversation(conversationParameters);
                let body = typeof response.body === 'string' ? response.body : JSON.parse(response.body);
                conversationResourceResponse.id = body.id;
                resolve(conversationResourceResponse);
            }
            catch (err) {
                reject(err);
            }
        });
    }

    
    public update(activity: Partial<Activity>): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                let client = new ConnectorClient(this.credentials);
                await client.conversations.updateActivity((activity.conversation as any).id, activity.id as string, activity as any);
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    }

    public delete(activity: Partial<Activity>): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                let client = new ConnectorClient(this.credentials);
                await client.conversations.deleteActivity((activity.conversation as any).id, activity.id as string);
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    }

    public post(activities: Partial<Activity>[]): Promise<ConversationResourceResponse[]> {
        return new Promise(async (resolve, reject) => {
            const credentials = this.credentials;
            const clientCache: { [url:string]: ConnectorClient; } = {};
            function createClient(serviceUrl: string|undefined): ConnectorClient|undefined {
                if (serviceUrl) {
                    if (!clientCache.hasOwnProperty(serviceUrl)) {
                        clientCache[serviceUrl] = new ConnectorClient(credentials, serviceUrl)
                    }
                    return clientCache[serviceUrl];
                }
            }

            const responses: ConversationResourceResponse[] = [];
            function next(i: number) {
                if (i < activities.length) {
                    const activity = activities[i];
                    switch (activity.type) {
                        case 'delay':
                            setTimeout(() => {
                                responses.push({});
                                next(i + 1);
                            }, activity.value || 1);
                            break;
                        default:
                            const client = createClient(activity.serviceUrl);
                            if (client) {
                                if (activity.conversation && activity.conversation.id) {
                                    client.conversations.sendToConversation(activity, activity.conversation.id)
                                                        .then((result) => {
                                                            responses.push(result || {});
                                                            next(i + 1);
                                                        }, (err) => {
                                                            reject(err);
                                                        });
                                } else {
                                    reject(new Error(`BotFrameworkAdapter: activity missing 'conversation.id'.`));
                                }
                            } else {
                                reject(new Error(`BotFrameworkAdapter: activity missing 'serviceUrl'.`));
                            }
                            break;
                    }
                } else {
                    resolve(responses);
                }
            }
            next(0);
        });
    }

    /**
     * Listens for incoming activities off a Restify or Express.js POST route.
     */
    public listen(): WebMiddleware {
        return async (req: WebRequest, res: WebResponse) => {
            if (req.body) {
                await this.processRequest(req, res);
            } else {
                let requestData = '';
                req.on('data', (chunk: string) => {
                    requestData += chunk
                });
                req.on('end', async () => {
                    req.body = JSON.parse(requestData);
                    await this.processRequest(req, res);
                });
            }
        };
    }

    private async processRequest(req: WebRequest, res: WebResponse) {
        let activity: Activity = req.body;
        
        try {
            // authenticate the incoming request
            await this.authenticator.authenticate(req.headers, activity.channelId, activity.serviceUrl);
            // call onReceive delegate
            await this.onReceive(activity);

            // TODO: Add logic to return 'invoke' response
            res.send(202); 
        } catch (err) {
            // TODO: Added logic to unpack error
            res.send(500, err.message);
            /*
            if (err.status !== undefined) {
                result.status = err.status;
                result.body = err;
            }
            */
        }

        /*
        if (result.status === undefined) {
            if (result.body === undefined) {
                res.send(202);
            } else {
                res.send(200, result.body);
            }
        } else {
            res.send(result.status, result.body);
        }
        */
    }
}

// END OF LINE


