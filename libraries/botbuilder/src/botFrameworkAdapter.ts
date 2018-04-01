/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotAdapter, TurnContext, Promiseable, ActivityTypes, Activity, ConversationReference, ResourceResponse, ConversationResourceResponse, ConversationParameters, ConversationAccount } from 'botbuilder-core';
import { ConnectorClient, SimpleCredentialProvider, MicrosoftAppCredentials, JwtTokenValidation } from 'botframework-connector';

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
export class BotFrameworkAdapter extends BotAdapter {
    private readonly invokeResponses: { [key:string]: Partial<Activity>; } = {};
    protected readonly credentials: MicrosoftAppCredentials;
    protected readonly credentialsProvider: SimpleCredentialProvider;
    protected readonly settings: BotFrameworkAdapterSettings;

    /**
     * Creates a new BotFrameworkAdapter instance.
     * @param settings (optional) configuration settings for the adapter.
     */
    constructor(settings?: Partial<BotFrameworkAdapterSettings>) {
        super();
        this.settings = Object.assign({ appId: '', appPassword: '' }, settings);
        this.credentials = new MicrosoftAppCredentials(this.settings.appId, this.settings.appPassword || '');
        this.credentialsProvider = new SimpleCredentialProvider(this.credentials.appId, this.credentials.appPassword);
    }

    public processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promiseable<any>): Promise<void> {
        // Parse body of request
        let errorCode = 500;
        return parseRequest(req).then((request) => {
            // Authenticate the incoming request
            errorCode = 401;
            const authHeader = req.headers["authorization"] || '';
            return this.authenticateRequest(request, authHeader).then(() => {
                // Process received activity
                errorCode = 500;
                const context = this.createContext(request);
                return this.runMiddleware(context, logic as any)
                    .then(() => {
                        if (request.type === ActivityTypes.Invoke) {
                            const key = request.channelId + '/' + request.id;
                            try {
                                const invokeResponse = this.invokeResponses[key];
                                if (invokeResponse && invokeResponse.value) {
                                    const value = invokeResponse.value as InvokeResponse;
                                    res.send(value.status, value.body);
                                    res.end();
                                } else {
                                    throw new Error(`Bot failed to return a valid 'invokeResponse' activity.`);
                                }
                            } finally {
                                if (this.invokeResponses.hasOwnProperty(key)) { delete this.invokeResponses[key] }
                            }
                        } else {
                            res.send(202);
                            res.end();
                        }
                    });
            });
        }).catch((err) => {
            // Reject response with error code
            console.warn(`BotFrameworkAdapter.processRequest(): ${errorCode} ERROR - ${err.toString()}`);
            res.send(errorCode, err.toString());
            res.end();
            throw err;
        });
    }

    public continueConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promiseable<void>): Promise<void> {
        const request = TurnContext.applyConversationReference({}, reference, true);
        const context = this.createContext(request);
        return this.runMiddleware(context, logic as any);
    }

    public createConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promiseable<void>): Promise<void> {
        try {
            if (!reference.serviceUrl) { throw new Error(`BotFrameworkAdapter.createConversation(): missing serviceUrl.`) }
            
            // Create conversation
            const parameters = { bot: reference.bot } as ConversationParameters;
            const client = this.createConnectorClient(reference.serviceUrl);
            return client.conversations.createConversation(parameters).then((response) => {
                // Initialize request and copy over new conversation ID and updated serviceUrl.
                const request = TurnContext.applyConversationReference({}, reference, true);
                request.conversation = { id: response.id } as ConversationAccount;
                if (response.serviceUrl) { request.serviceUrl = response.serviceUrl }

                // Create context and run middleware
                const context = this.createContext(request);
                return this.runMiddleware(context, logic as any);
            });
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        return new Promise((resolve, reject) => {
            const responses: ResourceResponse[] = [];
            const that = this;
            function next(i: number) {
                if (i < activities.length) {
                    try {
                        const activity = activities[i];
                        switch (activity.type) {
                            case 'delay':
                                setTimeout(() => {
                                    responses.push({} as ResourceResponse);
                                    next(i + 1);
                                }, typeof activity.value === 'number' ? activity.value : 1000);
                                break;
                            case 'invokeResponse':
                                const key = activity.channelId + '/' + activity.replyToId;
                                that.invokeResponses[key] = activity;
                                next(i + 1);
                                break;
                            default:
                                if (!activity.serviceUrl) { throw new Error(`BotFrameworkAdapter.sendActivity(): missing serviceUrl.`) }
                                if (!activity.conversation || !activity.conversation.id) { throw new Error(`BotFrameworkAdapter.sendActivity(): missing conversation id.`) }
                                let p: Promise<ResourceResponse>;
                                const client = that.createConnectorClient(activity.serviceUrl);
                                if (activity.replyToId) {
                                    p = client.conversations.replyToActivity(
                                        activity.conversation.id,
                                        activity.replyToId,
                                        activity as Activity
                                    );
                                } else {
                                    p = client.conversations.sendToConversation(
                                        activity.conversation.id,
                                        activity as Activity
                                    );
                                }
                                p.then((response) => {
                                    responses.push(response);
                                    next(i + 1);
                                }, (err) => reject(err));
                                break;
                        }
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    resolve(responses);
                }
            }
            next(0);
        });
    }

    public updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        try {
            if (!activity.serviceUrl) { throw new Error(`BotFrameworkAdapter.updateActivity(): missing serviceUrl`) }
            if (!activity.conversation || !activity.conversation.id) { throw new Error(`BotFrameworkAdapter.updateActivity(): missing conversation or conversation.id`) }
            if (!activity.id) { throw new Error(`BotFrameworkAdapter.updateActivity(): missing activity.id`) }
            const client = this.createConnectorClient(activity.serviceUrl);
            return client.conversations.updateActivity(
                activity.conversation.id,
                activity.id,
                activity as Activity 
            ).then(() => {});
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        try {
            if (!reference.serviceUrl) { throw new Error(`BotFrameworkAdapter.deleteActivity(): missing serviceUrl`) }
            if (!reference.conversation || !reference.conversation.id) { throw new Error(`BotFrameworkAdapter.deleteActivity(): missing conversation or conversation.id`) }
            if (!reference.activityId) { throw new Error(`BotFrameworkAdapter.deleteActivity(): missing activityId`) }
            const client = this.createConnectorClient(reference.serviceUrl);
            return client.conversations.deleteActivity(reference.conversation.id, reference.activityId);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    protected authenticateRequest(request: Partial<Activity>, authHeader: string): Promise<void> {
        return JwtTokenValidation.assertValidActivity(request as Activity, authHeader, this.credentialsProvider);
    }

    protected createConnectorClient(serviceUrl: string): ConnectorClient {
        return new ConnectorClient(this.credentials, serviceUrl);
    }

    protected createContext(request: Partial<Activity>): TurnContext {
        return new TurnContext(this as any, request);
    }
}


function parseRequest(req: WebRequest): Promise<Activity> {
    return new Promise((resolve, reject) => {
        function returnActivity(activity: Activity) {
            if (typeof activity !== 'object') { throw new Error(`BotFrameworkAdapter.parseRequest(): invalid request body.`) }
            if (typeof activity.type !== 'string') { throw new Error(`BotFrameworkAdapter.parseRequest(): missing activity type.`) }
            resolve(activity);
        }

        if (req.body) {
            try {
                returnActivity(req.body);                
            } catch (err) {
                reject(err);
            }
        } else {
            let requestData = '';
            req.on('data', (chunk: string) => {
                requestData += chunk
            });
            req.on('end', () => {
                try {
                    req.body = JSON.parse(requestData);
                    returnActivity(req.body);
                } catch (err) {
                    reject(err);
                }
            });
        }
    });
} 



