/**
* @module botbuilder-services
*/
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ActivityAdapter, ConversationReference, ConversationResourceResponse, ConversationParameters } from 'botbuilder';
import { Headers } from 'botframework-connector-auth';
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
    appId?: string;
    appPassword?: string;
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
export declare class BotFrameworkAdapter implements ActivityAdapter {
    private nextId;
    private credentials;
    private authenticator;
    /**
     * Creates a new instance of the activity adapter.
     *
     * @param settings (optional) settings object
     */
    constructor(settings?: BotAdapterSettings);
    onReceive: (activity: Partial<Activity>) => Promise<void>;
    /**
     * Creates a new conversation
     *
     * @param {ConversationParameters} conversationParameters
     * @param {ConversationReference} conversationReference
     * @returns {Promise<ConversationResourceResponse>}
     */
    createConversation(conversationParameters: ConversationParameters, conversationReference: ConversationReference): Promise<ConversationResourceResponse>;
    update(activity: Partial<Activity>): Promise<void>;
    delete(activity: Partial<Activity>): Promise<void>;
    post(activities: Partial<Activity>[]): Promise<ConversationResourceResponse[]>;
    /**
     * Listens for incoming activities off a Restify or Express.js POST route.
     */
    listen(): WebMiddleware;
    private processRequest(req, res);
}
