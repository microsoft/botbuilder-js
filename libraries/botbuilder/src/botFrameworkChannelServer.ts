/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { WebRequest, WebResponse, InvokeResponse } from './botFrameworkAdapter';
import { Activity, ActivityTypes, ConversationReference, ConversationAccount, TurnContext } from 'botbuilder-core';

export interface BotFrameworkChannelServerSettings {
    /**
     * The ID assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).
     */
    appId: string;

    /**
     * The password assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).
     */
    appPassword: string;
}

export enum BotFrameworkChannelServerMethods {
    CreateConversation = 'BotFramework.CreateConversation',
    SendToConversation = 'BotFramework.SendToConversation',
    SendConversationHistory = 'BotFramework.SendConversationHistory',
    ReplyToActivity = 'BotFramework.ReplyToActivity',
    UpdateActivity = 'BotFramework.UpdateActivity',
    DeleteActivity = 'BotFramework.DeleteActivity',
    GetConversations = 'BotFramework.GetConversations',
    GetConversationMembers = 'BotFramework.GetConversationMembers',
    GetConversationPagedMembers = 'BotFramework.GetConversationPagedMembers',
    DeleteConversationMember = 'BotFramework.DeleteConversationMember',
    GetActivityMembers = 'BotFramework.GetActivityMembers',
    UploadAttachment = 'BotFramework.UploadAttachment'
}

export class BotFrameworkChannelServer {

    public async processRequest(req: WebRequest, res: WebResponse, logic: (activity: Partial<Activity>) => Promise<InvokeResponse>): Promise<void> {
        let body: any;
        let status: number;
        try {
            // Authenticate the incoming request
            status = 401;
            await this.authenticateRequest(req);

            // Convert request into an activity
            status = 404;
            const activity = await this.requestToActivity(req);

            // Process activity
            status = 500;
            const response = await logic(activity);
            if (response) {
                status = response.status;
                body = response.body;
            } else {
                status = 200;
            }
        } catch (err) {
            body = err.toString();
        }

        // Return status 
        res.status(status);
        if (body) { res.send(body); }
        res.end();

        // Check for an error
        if (status >= 400) { throw new Error(body.toString()) }
    }

    /**
     * Allows for the overriding of authentication in unit tests.
     * @param req Received request.
     */
    protected async authenticateRequest(req: WebRequest): Promise<void> {
        const authHeader: string = req.headers.authorization || req.headers.Authorization || '';
    }

    protected async requestToActivity(req: WebRequest): Promise<Partial<Activity>> {
        const pos = req.url.indexOf('/v3/');
        if (pos < 0) { throw new Error(`BotFrameworkChannelServer: '/v3/' api path not found in url.`) }
        const url = `${req.method}:${req.url.substr(pos)}`;

        // Find invoked method
        let method: string, args: object;
        for (let i = 0; i < routeTable.length; i++) {
            const matched = routeTable[i].exp.exec(url);
            if (matched) {
                method = routeTable[i].method;
                args = matched.groups || {};
                break;
            }
        }
        if (method == undefined) { throw new Error(`BotFrameworkChannelServer: '${url}' path not supported.`) }

        // Check for embedded service URL or original conversation ID
        if (args.hasOwnProperty('conversationId')) {
            const conversationId: string = args['conversationId'];
            if (conversationId.indexOf('cid=') >= 0 || conversationId.indexOf('url') >= 0) {
                // Extract original conversation ID and service URL
                conversationId.split('&').forEach((kv) => {
                    const pair = kv.split('=');
                    switch (pair[0]) {
                        case 'cid':
                            args['conversationId'] = decodeURIComponent(args[1]);
                            break;
                        case 'url':
                            args['serviceUrl'] = decodeURIComponent(args[1]);
                            break;
                    }
                });
            }
        }

        // Map to invoke activity
        let activity: Partial<Activity> = { 
            type: ActivityTypes.Invoke,
            name: method,
            value: args
        };
        
        // Add body contents to args
        switch (method) {
            case BotFrameworkChannelServerMethods.CreateConversation:
                activity.value.parameters = await parseBody(req);
                break;
            case BotFrameworkChannelServerMethods.SendConversationHistory:
                activity.value.history = await parseBody(req);
                break;
            case BotFrameworkChannelServerMethods.UploadAttachment:
                activity.value.attachmentUpload = await parseBody(req);
                break;
            case BotFrameworkChannelServerMethods.SendToConversation:
            case BotFrameworkChannelServerMethods.ReplyToActivity:
            case BotFrameworkChannelServerMethods.UpdateActivity:
                activity.value.activity = await parseBody(req);
                break;
        }

        // Decode any embedded conversation id's
        // - For skills we tunnel through the original conversationId and serviceUrl as part
        //   of the conversationId.  We want to unpack this info such that the invoke activity
        //   we generate references the original conversationId and serviceUrl.
        if (activity.value.hasOwnProperty('conversationId')) {
            const ref = decodeConversationId(activity.value['conversationId']);
            activity.value['conversationId'] = ref.conversation.id;
            if (ref.serviceUrl) { activity.value['serviceUrl'] = ref.serviceUrl }
        }

        // Re-address passed in activities
        // - Similar to above, we need to fixup the conversationId and serviceUrl embedded in any
        //   activities sent to us by a skill. We'll preserve the conversationId for the skill
        //   instance by moving it to a relatesTo field off the activity. That way the bot can still
        //   tell which skill it was invoked by.
        // - NOTE: we're currently assuming that the "from" information sent by a skill will contain
        //   the ID of the bot and not the skill. Therefore there's no need for us to correct it here.
        if (activity.value.hasOwnProperty('activity')) {
            const a: Partial<Activity> = activity.value['activity'];
            a.relatesTo = TurnContext.getConversationReference(a) as ConversationReference;
            const ref = decodeConversationId(a.conversation.id);
            a.conversation.id = ref.conversation.id;
            if (ref.serviceUrl) { a.serviceUrl = ref.serviceUrl }
        }

        // Check for activities that should be passed through to the bot for processing.
        // - Any EndOfConversation or Event activities sent from a skill should be processed by
        //   the bot versus being forwarded to the user.
        switch (method) {
            case BotFrameworkChannelServerMethods.SendToConversation:
            case BotFrameworkChannelServerMethods.ReplyToActivity:
                const a: Partial<Activity> = activity.valueType['a'];
                switch (a.type) {
                    case ActivityTypes.EndOfConversation:
                    case ActivityTypes.Event:
                        // Just return the activity sent instead of an 'invoke'.
                        activity = a;
                        break;               
                }
        } 

        return activity;
    }
}

/**
 * Parses the incoming request body as JSON
 * @private
 * @param req incoming web request
 */
function parseBody(req: WebRequest): Promise<object> {
    return new Promise((resolve: any, reject: any): void => {
        if (req.body) {
            try {
                resolve(req.body);
            } catch (err) {
                reject(err);
            }
        } else {
            let requestData = '';
            req.on('data', (chunk: string) => {
                requestData += chunk;
            });
            req.on('end', () => {
                try {
                    req.body = JSON.parse(requestData);
                    resolve(req.body);
                } catch (err) {
                    reject(err);
                }
            });
        }
    });
}

/**
 * Unpacks the original conversationId and/or serviceUrl from a skills conversationId.
 * @private
 */
function decodeConversationId(conversationId: string): Partial<ConversationReference> {
    // Initialize returned reference 
    const ref: Partial<ConversationReference> = {  
        conversation: { id: conversationId } as ConversationAccount
    };

    // Check for embedded conversation info
    if (conversationId.indexOf('cid=') >= 0 || conversationId.indexOf('url') >= 0) {
        // Extract original conversation ID and service URL
        conversationId.split('&').forEach((kv) => {
            const pair = kv.split('=');
            switch (pair[0]) {
                case 'cid':
                    ref.conversation.id = decodeURIComponent(pair[1]);
                    break;
                case 'url':
                    ref.serviceUrl = decodeURIComponent(pair[1]);
                    break;
            }
        });
    }

    return ref;
}


interface IChannelRoute {
    exp: RegExp;
    method: BotFrameworkChannelServerMethods;
}

const routeTable: IChannelRoute[] = [
    { exp: /GET:\/v3\/conversations\/(?<conversationId>.*)\/activities\/(?<activityId>.*)\/members$/i, method: BotFrameworkChannelServerMethods.GetActivityMembers },
    { exp: /POST:\/v3\/conversations\/(?<conversationId>.*)\/activities\/(?<activityId>.*)$/i, method: BotFrameworkChannelServerMethods.ReplyToActivity },
    { exp: /PUT:\/v3\/conversations\/(?<conversationId>.*)\/activities\/(?<activityId>.*)$/i, method: BotFrameworkChannelServerMethods.UpdateActivity },
    { exp: /DELETE:\/v3\/conversations\/(?<conversationId>.*)\/activities\/(?<activityId>.*)$/i, method: BotFrameworkChannelServerMethods.DeleteActivity },
    { exp: /POST:\/v3\/conversations\/(?<conversationId>.*)\/activities$/i, method: BotFrameworkChannelServerMethods.SendToConversation },
    { exp: /POST:\/v3\/conversations\/(?<conversationId>.*)\/activities\/history$/i, method: BotFrameworkChannelServerMethods.SendConversationHistory },
    { exp: /DELETE:\/v3\/conversations\/(?<conversationId>.*)\/members\/(?<memberId>.*)$/i, method: BotFrameworkChannelServerMethods.DeleteConversationMember },
    { exp: /POST:\/v3\/conversations\/(?<conversationId>.*)\/attachments$/i, method: BotFrameworkChannelServerMethods.UploadAttachment },
    { exp: /GET:\/v3\/conversations\/(?<conversationId>.*)\/members$/i, method: BotFrameworkChannelServerMethods.GetConversationMembers },
    { exp: /GET:\/v3\/conversations\/(?<conversationId>.*)\/pagedmember$/i, method: BotFrameworkChannelServerMethods.GetConversationPagedMembers },
    { exp: /GET:\/v3\/conversations$/i, method: BotFrameworkChannelServerMethods.GetConversations },
    { exp: /POST:\/v3\/conversations$/i, method: BotFrameworkChannelServerMethods.CreateConversation }
]