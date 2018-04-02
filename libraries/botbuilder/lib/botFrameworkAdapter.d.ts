/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotAdapter, TurnContext, Promiseable, Activity, ConversationReference, ResourceResponse } from 'botbuilder-core';
import { ConnectorClient, SimpleCredentialProvider, MicrosoftAppCredentials } from 'botframework-connector';
/**
 * :package: **botbuilder-core**
 *
 * Express or Restify Request object.
 */
export interface WebRequest {
    body?: any;
    headers: any;
    on(event: string, ...args: any[]): any;
}
/**
 * :package: **botbuilder-core**
 *
 * Express or Restify Response object.
 */
export interface WebResponse {
    end(...args: any[]): any;
    send(status: number, body?: any): any;
}
/**
 * :package: **botbuilder-core**
 *
 * Bot Framework Adapter Settings.
 */
export interface BotFrameworkAdapterSettings {
    appId: string;
    appPassword: string;
}
export interface InvokeResponse {
    status: number;
    body?: any;
}
/**
 * :package: **botbuilder-core**
 *
 * ActivityAdapter class needed to communicate with a Bot Framework channel or the Emulator.
 *
 * **Usage Example**
 *
 * ```JavaScript
 * ```
 */
export declare class BotFrameworkAdapter extends BotAdapter {
    private readonly invokeResponses;
    protected readonly credentials: MicrosoftAppCredentials;
    protected readonly credentialsProvider: SimpleCredentialProvider;
    protected readonly settings: BotFrameworkAdapterSettings;
    /**
     * Creates a new BotFrameworkAdapter instance.
     * @param settings (optional) configuration settings for the adapter.
     */
    constructor(settings?: Partial<BotFrameworkAdapterSettings>);
    processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promiseable<any>): Promise<void>;
    continueConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promiseable<void>): Promise<void>;
    createConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promiseable<void>): Promise<void>;
    sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]>;
    updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void>;
    deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void>;
    protected authenticateRequest(request: Partial<Activity>, authHeader: string): Promise<void>;
    protected createConnectorClient(serviceUrl: string): ConnectorClient;
    protected createContext(request: Partial<Activity>): TurnContext;
}
