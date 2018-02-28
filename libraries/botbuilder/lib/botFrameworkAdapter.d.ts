/**
* @module botbuilder
*/
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotAdapter, BotContext, Promiseable, Activity, ConversationReference, ResourceResponse, ConversationResourceResponse, ConversationParameters } from 'botbuilder-core';
import { ConnectorClient, SimpleCredentialProvider, MicrosoftAppCredentials } from 'botframework-connector';
/** Express or Restify Request object. */
export interface WebRequest {
    body: any;
    headers: Headers;
    on(event: string, ...args: any[]): void;
}
/** Express or Restify Response object. */
export interface Headers {
    [name: string]: string;
}
/** Express or Restify Response object. */
export interface WebResponse {
    end(): this;
    send(status: number, body?: any): this;
}
/** Express or Restify Middleware Function. */
export interface WebMiddleware {
    (req: WebRequest, res: WebResponse, next?: Function): void;
}
/** Bot Framework Adapter Settings */
export interface BotFrameworkAdapterSettings {
    appId: string;
    appPassword: string;
}
/**
* ActivityAdapter class needed to communicate with a Bot Framework channel or the Emulator.
*
* **Usage Example**
*
* ```JavaScript
* ```
*/
export declare class BotFrameworkAdapter extends BotAdapter {
    protected readonly credentials: MicrosoftAppCredentials;
    protected readonly credentialsProvider: SimpleCredentialProvider;
    protected readonly settings: BotFrameworkAdapterSettings;
    /**
     * Creates a new BotFrameworkAdapter instance.
     * @param settings (optional) configuration settings for the adapter.
     */
    constructor(settings?: Partial<BotFrameworkAdapterSettings>);
    processRequest(req: WebRequest, res: WebResponse, logic: (context: BotContext) => Promiseable<void>): Promise<void>;
    continueConversation(reference: Partial<ConversationReference>, logic: (context: BotContext) => Promiseable<void>): Promise<void>;
    startConversation(reference: Partial<ConversationReference>, logic: (context: BotContext) => Promiseable<void>): Promise<void>;
    sendActivities(activities: Partial<Activity>[]): Promise<ResourceResponse[]>;
    updateActivity(activity: Partial<Activity>): Promise<void>;
    deleteActivity(reference: Partial<ConversationReference>): Promise<void>;
    createConversation(serviceUrl: string, parameters: Partial<ConversationParameters>): Promise<ConversationResourceResponse>;
    protected authenticateRequest(request: Partial<Activity>, authHeader: string): Promise<void>;
    protected createConnectorClient(serviceUrl: string): ConnectorClient;
    protected createContext(request: Partial<Activity>): BotContext;
}
