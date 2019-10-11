/**
 * @module botbuilder-skills
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ConversationReference, ResourceResponse } from 'botframework-schema';
import { TurnContext, BotAdapter, Middleware, ConversationAccount, ActivityTypes } from 'botbuilder-core';

/**
 * Represents an Express or Restify request object.
 * 
 * > [!NOTE] This interface supports the framework and is not intended to be called directly for your code.
 */
export interface WebRequest {
    /**
     * The url of the request.
     */
    url: string;

    /**
     * The HTTP method invoked for the request.
     */
    method: string;

    /**
     * Optional. The request body.
     */
    body?: any;

    /***
     * The request headers.
     */
    headers: any;

    /**
     * When implemented in a derived class, adds a listener for an event.
     * The framework uses this method to retrieve the request body when the
     * [body](xref:botbuilder.WebRequest.body) property is `null` or `undefined`.
     * 
     * @param event The event name.
     * @param args Arguments used to handle the event.
     * 
     * @returns A reference to the request object.
     */
    on(event: string, ...args: any[]): any;
}

/**
 * Represents an Express or Restify response object.
 * 
 * > [!NOTE] This interface supports the framework and is not intended to be called directly for your code.
 */
export interface WebResponse {
    /**
     * When implemented in a derived class, sends a FIN packet.
     * 
     * @param args The arguments for the end event.
     * 
     * @returns A reference to the response object.
     */
    end(...args: any[]): any;

    /**
     * When implemented in a derived class, sends the response.
     * 
     * @param body The response payload.
     * 
     * @returns A reference to the response object.
     */
    send(body: any): any;

    /**
     * When implemented in a derived class, sets the HTTP status code for the response.
     * 
     * @param status The status code to use.
     * 
     * @returns The status code.
     */
    status(status: number): any;
}

/**
 * Represents a response returned by a bot when it receives an `invoke` activity.
 * 
 * > [!NOTE] This interface supports the framework and is not intended to be called directly for your code.
 */
export interface InvokeResponse {
    /**
     * The HTTP status code of the response.
     */
    status: number;

    /**
     * Optional. The body of the response.
     */
    body?: any;
}

export interface SkillConfiguration {
    id: string;
    appId: string;
    endpointUrl: string;
}

export interface SkillHostAdapterSettings {
    serviceUrl: string;
}

export type ForwardActivityHandler = (
    context: TurnContext,
    skillId: string,
    activity: Partial<Activity>,
    next: () => Promise<void>
) => Promise<void>;

export enum BotFrameworkInvokeMethods {
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

export abstract class SkillHostAdapter extends BotAdapter implements Middleware {
    private _adapter: BotAdapter;
    private readonly _skills: { [id: string]: SkillConfiguration } = {};
    private readonly _settings: SkillHostAdapterSettings;
    private _onForwardActivity: ForwardActivityHandler[] = [];

    public constructor(settings: SkillHostAdapterSettings, adapter?: BotAdapter) {
        super();
        this._settings = settings;
        if (adapter) { this.adapter = adapter }
    }

    public set adapter(value: BotAdapter) {
        // Add ourselves to adapters middleware chain
        if (value) { value.use(this) }

        // Save adapter
        if (this._adapter) { console.warn(`SkillHostAdapter.adapter: an adapter has already been assigned.`) }
        this.adapter = value;
    }

    public get adapter() {
        return this._adapter;
    }

    public addSkill(skill: SkillConfiguration): this {
        if (this._skills.hasOwnProperty(skill.id)) { throw new Error(`SkillHostAdapter.addSkill: a skill with an id of '${skill.id}' already added.`) }
        this._skills[skill.id] = skill;
        return this;
    }

    public getSkill(skillId: string): SkillConfiguration|undefined {
        return this._skills[skillId];
    }

    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        // Update adapter reference
        const saved = context.adapter;
        context.adapter = this;

        // Chain into our middleware stack
        await this.middleware.run(context, next);

        // Restore adapter ref
        context.adapter = saved;
    }

    public sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        return this.adapter.sendActivities(context, activities);
    }

    public updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        return this.adapter.updateActivity(context, activity);
    }

    public deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        return this.adapter.deleteActivity(context, reference);
    }

    public continueConversation(
        reference: Partial<ConversationReference>,
        logic: (revocableContext: TurnContext
        ) => Promise<void>): Promise<void> 
    {
        return this.adapter.continueConversation(reference, logic);
    }

    //=========================================================================
    // Inbound Activities
    //=========================================================================

    public async processSkillRequest(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {
        let body: any;
        let status: number;
        try {
            // Authenticate the incoming request
            status = 401;
            await this.authenticateSkillRequest(req);

            // Convert request into an activity
            status = 404;
            const activity = await this.convertSkillRequestToInvoke(req);

            // Invoke adapter method
            status = 500;
            const context = new TurnContext(this, activity);
            const response = await this.onInvokeMethod(context, activity.name, activity.value, logic);
            status = response.status;
            body = response.body;
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
    protected async authenticateSkillRequest(req: WebRequest): Promise<void> {
        const authHeader: string = req.headers.authorization || req.headers.Authorization || '';
    }

    protected async convertSkillRequestToInvoke(req: WebRequest): Promise<Partial<Activity>> {
        const pos = req.url.indexOf('/v3/');
        if (pos < 0) { throw new Error(`SkillHostAdapter: '/v3/' api path not found in url.`) }
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
        if (method == undefined) { throw new Error(`SkillHostAdapter: '${url}' path not supported.`) }

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
            case BotFrameworkInvokeMethods.CreateConversation:
                activity.value.parameters = await parseBody(req);
                break;
            case BotFrameworkInvokeMethods.SendConversationHistory:
                activity.value.history = await parseBody(req);
                break;
            case BotFrameworkInvokeMethods.UploadAttachment:
                activity.value.attachmentUpload = await parseBody(req);
                break;
            case BotFrameworkInvokeMethods.SendToConversation:
            case BotFrameworkInvokeMethods.ReplyToActivity:
            case BotFrameworkInvokeMethods.UpdateActivity:
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

        return activity;
    }

    protected async onInvokeMethod(context: TurnContext, name: string, args: object, logic: (context: TurnContext) => Promise<any>): Promise<InvokeResponse> {
        switch (name) {
            case BotFrameworkInvokeMethods.ReplyToActivity:
            case BotFrameworkInvokeMethods.SendToConversation:
                if (this.shouldHandleSentActivity(args['activity'])) {
                    await this.runMiddleware(new TurnContext(this, args['activity']), logic);
                    return { status: 200 };
                } else {
                    return {
                        status: 200,
                        body: await context.adapter.sendActivities(context, [args['activity']])[0]
                    };
                }
            case BotFrameworkInvokeMethods.UpdateActivity:
                await context.adapter.updateActivity(context, args['activity']);
                return { status: 200 };
            case BotFrameworkInvokeMethods.DeleteActivity:
                await context.adapter.deleteActivity(context, {
                    serviceUrl: args['serviceUrl'],
                    conversation: { id: args['conversationId'] } as ConversationAccount,
                    activityId: args['activityId']
                });
                return { status: 200 };
            default:
                return { status: 501, body: 'not implemented' }
        }
    }

    protected shouldHandleSentActivity(activity: Partial<Activity>): boolean {
        switch (activity.type) {
            case ActivityTypes.EndOfConversation:
            case ActivityTypes.Event:
                return true;
            default:
                return false;
        }
    }

    //=========================================================================
    // Outbound Activities
    //=========================================================================

    public createSkillConversation(context: TurnContext): Partial<ConversationReference> {
        const skillConversation = TurnContext.getConversationReference(context.activity);
        const id = encodeURIComponent(createId());
        const cid = encodeURIComponent(skillConversation.conversation.id);
        const url = encodeURIComponent(skillConversation.serviceUrl);
        skillConversation.conversation.id = `cid=${cid}&url=${url}&id=${id}`;
        skillConversation.serviceUrl = this._settings.serviceUrl;
        return skillConversation;
    }

    public async forwardActivity(context: TurnContext, skillId: string, activity: Partial<Activity>, skillConversation?: Partial<ConversationReference>): Promise<void> {
        // Lookup skill by ID
        const skill = this._skills[skillId];
        if (skill == undefined) { throw new Error(`SkillHostAdapter.forwardActivity: a skill with an id of '${skillId}' not found.`) }

        // Clone activity and optionally apply skills conversation reference
        const clone: Partial<Activity> = Object.assign({}, activity);
        if (skillConversation) { TurnContext.applyConversationReference(clone, skillConversation) }

        // Raise event
        await this.emitForwardActivity(context, skillId, clone, async () => {
            // POST activity to skill
            // - TODO: add auth headers
            const response = await fetch(skill.endpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(clone)
            });

            // Check delivery status
            if (response.status >= 400) { throw new Error(`SkillHostAdapter.forwardActivity: '${response.status}' error forwarding activity to skill '${skillId}'.`) }
        });
    }

    public onForwardActivity(handler: ForwardActivityHandler): this {
        this._onForwardActivity.push(handler);

        return this;
    }

    private async emitForwardActivity(context: TurnContext, skillId: string, activity: Partial<Activity>, next: () => Promise<void>): Promise<void> {
        const list = this._onForwardActivity.slice(0);
        async function emitNext(i: number): Promise<void> {
            if (i < list.length) {
                await list[i](context, skillId, activity, async () => await emitNext(i + 1));
            } else {
                await next();
            }
        }

        await emitNext(0);
    }
}

/**
 * Creates a unique ID
 * @private
 */
function createId(): string {
    let seed = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (substr) => {
        const r = (seed + Math.random()*16)%16 | 0;
        seed = Math.floor(seed/16);
        return (substr == 'x' ? r : (r&0x3|0x8)).toString(16);
    });
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
    method: BotFrameworkInvokeMethods;
}

const routeTable: IChannelRoute[] = [
    { exp: /GET:\/v3\/conversations\/(?<conversationId>.*)\/activities\/(?<activityId>.*)\/members$/i, method: BotFrameworkInvokeMethods.GetActivityMembers },
    { exp: /POST:\/v3\/conversations\/(?<conversationId>.*)\/activities\/(?<activityId>.*)$/i, method: BotFrameworkInvokeMethods.ReplyToActivity },
    { exp: /PUT:\/v3\/conversations\/(?<conversationId>.*)\/activities\/(?<activityId>.*)$/i, method: BotFrameworkInvokeMethods.UpdateActivity },
    { exp: /DELETE:\/v3\/conversations\/(?<conversationId>.*)\/activities\/(?<activityId>.*)$/i, method: BotFrameworkInvokeMethods.DeleteActivity },
    { exp: /POST:\/v3\/conversations\/(?<conversationId>.*)\/activities$/i, method: BotFrameworkInvokeMethods.SendToConversation },
    { exp: /POST:\/v3\/conversations\/(?<conversationId>.*)\/activities\/history$/i, method: BotFrameworkInvokeMethods.SendConversationHistory },
    { exp: /DELETE:\/v3\/conversations\/(?<conversationId>.*)\/members\/(?<memberId>.*)$/i, method: BotFrameworkInvokeMethods.DeleteConversationMember },
    { exp: /POST:\/v3\/conversations\/(?<conversationId>.*)\/attachments$/i, method: BotFrameworkInvokeMethods.UploadAttachment },
    { exp: /GET:\/v3\/conversations\/(?<conversationId>.*)\/members$/i, method: BotFrameworkInvokeMethods.GetConversationMembers },
    { exp: /GET:\/v3\/conversations\/(?<conversationId>.*)\/pagedmember$/i, method: BotFrameworkInvokeMethods.GetConversationPagedMembers },
    { exp: /GET:\/v3\/conversations$/i, method: BotFrameworkInvokeMethods.GetConversations },
    { exp: /POST:\/v3\/conversations$/i, method: BotFrameworkInvokeMethods.CreateConversation }
]