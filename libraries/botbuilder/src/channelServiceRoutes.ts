/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, AttachmentData, ConversationParameters, StatusCodes, Transcript } from 'botbuilder-core';

import { ChannelServiceHandler } from './channelServiceHandler';
import { StatusCodeError } from './statusCodeError';
import { WebRequest, WebResponse } from './interfaces';

export type RouteHandler = (request: WebRequest, response: WebResponse) => void;

import { validateAndFixActivity } from './activityValidator';

/**
 * Interface representing an Express Application or a Restify Server.
 */
export interface WebServer {
    get: (path: string, handler: RouteHandler) => void;
    post: (path: string, handler: RouteHandler) => void;
    put: (path: string, handler: RouteHandler) => void;
    // For the DELETE HTTP Method, we need two optional methods:
    //  - Express 4.x has delete() - https://expressjs.com/en/4x/api.html#app.delete.method
    //  - restify has del() - http://restify.com/docs/server-api/#del
    del?: (path: string, handler: RouteHandler) => void;
    delete?: (path: string, handler: RouteHandler) => void;
}

export class ChannelServiceRoutes {
    /**
     * @param channelServiceHandler 
     */
    constructor(private readonly channelServiceHandler: ChannelServiceHandler) {
        this.channelServiceHandler = channelServiceHandler;
    }

    /**
     * Registers all WebServer 
     * @param server WebServer
     * @param basePath Optional basePath which is appended before the service's REST API is configured on the WebServer.
     */
    public register(server: WebServer, basePath: string = ''): void {
        server.post(basePath + '/v3/conversations/:conversationId/activities', this.processSendToConversation.bind(this));
        server.post(basePath + '/v3/conversations/:conversationId/activities/:activityId', this.processReplyToActivity.bind(this));
        server.put(basePath + '/v3/conversations/:conversationId/activities/:activityId', this.processUpdateActivity.bind(this));
        server.get(basePath + '/v3/conversations/:conversationId/activities/:activityId/members', this.processGetActivityMembers.bind(this));
        server.post(basePath + '/v3/conversations', this.processCreateConversation.bind(this));
        server.get(basePath + '/v3/conversations', this.processGetConversations.bind(this));
        server.get(basePath + '/v3/conversations/:conversationId/members', this.processGetConversationMembers.bind(this));
        server.get(basePath + '/v3/conversations/:conversationId/pagedmembers', this.processGetConversationPagedMembers.bind(this));
        server.post(basePath + '/v3/conversations/:conversationId/activities/history', this.processSendConversationHistory.bind(this));
        server.post(basePath + '/v3/conversations/:conversationId/attachments', this.processUploadAttachment.bind(this));

        server.del(basePath + '/v3/conversations/:conversationId/members/:memberId', this.processDeleteConversationMember.bind(this));
        server.del(basePath + '/v3/conversations/:conversationId/activities/:activityId', this.processDeleteActivity.bind(this));
    }

    private processSendToConversation(req: WebRequest, res: WebResponse): void {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        ChannelServiceRoutes.readActivity(req)
            .then((activity) => {
                this.channelServiceHandler.handleSendToConversation(authHeader, req.params.conversationId, activity)
                    .then((resourceResponse) => {
                        res.status(200);
                        if (resourceResponse) {
                            res.send(resourceResponse);
                        }
                        res.end();
                    })
                    .catch(err => { ChannelServiceRoutes.handleError(err, res); })
            })
            .catch(err => { ChannelServiceRoutes.handleError(err, res); });
    }

    private processReplyToActivity(req: WebRequest, res: WebResponse): void {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        ChannelServiceRoutes.readActivity(req)
            .then((activity) => {
                this.channelServiceHandler.handleReplyToActivity(authHeader, req.params.conversationId, req.params.activityId, activity)
                    .then((resourceResponse) => {
                        res.status(200);
                        if (resourceResponse) {
                            res.send(resourceResponse);
                        }
                        res.end();
                    })
                    .catch(err => { ChannelServiceRoutes.handleError(err, res); })
            })
            .catch(err => { ChannelServiceRoutes.handleError(err, res); });
    }

    private processUpdateActivity(req: WebRequest, res: WebResponse): void {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        ChannelServiceRoutes.readActivity(req)
            .then((activity) => {
                this.channelServiceHandler.handleUpdateActivity(authHeader, req.params.conversationId, req.params.activityId, activity)
                    .then((resourceResponse) => {
                        res.status(200);
                        if (resourceResponse) {
                            res.send(resourceResponse);
                        }
                        res.end();
                    })
                    .catch(err => { ChannelServiceRoutes.handleError(err, res); })
            })
            .catch(err => { ChannelServiceRoutes.handleError(err, res); });
    }

    private processDeleteActivity(req: WebRequest, res: WebResponse): void {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        this.channelServiceHandler.handleDeleteActivity(authHeader, req.params.conversationId, req.params.activityId)
            .then(() => {
                res.status(200);
                res.end();
            })
            .catch(err => { ChannelServiceRoutes.handleError(err, res); });
    }

    private processGetActivityMembers(req: WebRequest, res: WebResponse): void {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        this.channelServiceHandler.handleGetActivityMembers(authHeader, req.params.conversationId, req.params.activityId)
            .then((channelAccounts) => {
                if (channelAccounts) {
                    res.send(channelAccounts);
                }
                res.status(200);
                res.end();
            })
            .catch(err => { ChannelServiceRoutes.handleError(err, res); });
    }

    private processCreateConversation(req: WebRequest, res: WebResponse): void {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        ChannelServiceRoutes.readBody<ConversationParameters>(req)
            .then((conversationParameters) => {
                this.channelServiceHandler.handleCreateConversation(authHeader, conversationParameters)
                    .then((conversationResourceResponse) => {
                        if (conversationResourceResponse) {
                            res.send(conversationResourceResponse);
                        }
                        res.status(201);
                        res.end();
                    })
                    .catch(err => { ChannelServiceRoutes.handleError(err, res); })
            });
    }

    private processGetConversations(req: WebRequest, res: WebResponse): void {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        this.channelServiceHandler.handleGetConversations(authHeader, req.params.conversationId, req.query.continuationToken)
            .then((conversationsResult) => {
                if (conversationsResult) {
                    res.send(conversationsResult);
                }
                res.status(200);
                res.end();
            })
            .catch(err => { ChannelServiceRoutes.handleError(err, res); });
    }

    private processGetConversationMembers(req: WebRequest, res: WebResponse): void {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        this.channelServiceHandler.handleGetConversationMembers(authHeader, req.params.conversationId)
            .then((channelAccounts) => {
                res.status(200);
                if (channelAccounts) {
                    res.send(channelAccounts);
                }
                res.end();
            })
            .catch(err => { ChannelServiceRoutes.handleError(err, res); });
    }

    private processGetConversationPagedMembers(req: WebRequest, res: WebResponse): void {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        let pageSize = parseInt(req.query.pageSize);
        if (isNaN(pageSize)) {
            pageSize = undefined;
        }
        this.channelServiceHandler.handleGetConversationPagedMembers(
            authHeader,
            req.params.conversationId,
            pageSize,
            req.query.continuationToken)
            .then((pagedMembersResult) => {
                res.status(200);
                if (pagedMembersResult) {
                    res.send(pagedMembersResult);
                }
                res.end();
            })
            .catch(err => { ChannelServiceRoutes.handleError(err, res); });
    }

    private processDeleteConversationMember(req: WebRequest, res: WebResponse): void {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        this.channelServiceHandler.handleDeleteConversationMember(authHeader, req.params.conversationId, req.params.memberId)
            .then((resourceResponse) => {
                res.status(200);
                res.end();
            })
            .catch(err => { ChannelServiceRoutes.handleError(err, res); });
    }

    private processSendConversationHistory(req: WebRequest, res: WebResponse): void {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        ChannelServiceRoutes.readBody<Transcript>(req)
            .then((transcript) => {
                this.channelServiceHandler.handleSendConversationHistory(authHeader, req.params.conversationId, transcript)
                    .then((resourceResponse) => {
                        if (resourceResponse) {
                            res.send(resourceResponse);
                        }
                        res.status(200);
                        res.end();
                    })
                    .catch(err => { ChannelServiceRoutes.handleError(err, res); })
            })
            .catch(err => { ChannelServiceRoutes.handleError(err, res); });
    }

    private processUploadAttachment(req: WebRequest, res: WebResponse): void {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        ChannelServiceRoutes.readBody<AttachmentData>(req)
            .then((attachmentData) => {
                this.channelServiceHandler.handleUploadAttachment(authHeader, req.params.conversationId, attachmentData)
                    .then((resourceResponse) => {
                        if (resourceResponse) {
                            res.send(resourceResponse);
                        }
                        res.status(200);
                        res.end();
                    })
                    .catch(err => { ChannelServiceRoutes.handleError(err, res); })
            })
            .catch(err => { ChannelServiceRoutes.handleError(err, res); });
    }

    private static readActivity(req: WebRequest): Promise<Activity> {
        return new Promise((resolve, reject) => {
            if (req.body) {
                try {
                    const activity = validateAndFixActivity(req.body);
                    resolve(activity);
                } catch (err) {
                    reject(new StatusCodeError(StatusCodes.BAD_REQUEST, err.message));
                }
            } else {
                let requestData = '';
                req.on('data', (chunk) => {
                    requestData += chunk;
                });
                req.on('end', () => {
                    try {
                        const body = JSON.parse(requestData);
                        const activity = validateAndFixActivity(body);
                        resolve(activity);
                    } catch (err) {
                        reject(new StatusCodeError(StatusCodes.BAD_REQUEST, err.message));
                    }
                });
            }
        });
    }

    private static readBody<T>(req: WebRequest): Promise<T> {
        return new Promise((resolve, reject) => {
            if (req.body) {
                try {
                    resolve(req.body);
                } catch (err) {
                    reject(new StatusCodeError(StatusCodes.BAD_REQUEST, err.message));
                }
            } else {
                let requestData = '';
                req.on('data', (chunk) => {
                    requestData += chunk;
                });
                req.on('end', () => {
                    try {
                        const body = JSON.parse(requestData);
                        resolve(body);
                    } catch (err) {
                        reject(new StatusCodeError(StatusCodes.BAD_REQUEST, err.message));
                    }
                });
            }
        });
    }

    private static handleError(err: any, res: WebResponse): void {
        if (err instanceof StatusCodeError) {
            res.send(err.message);
            res.status(err.statusCode);
        } else {
            res.status(500);
        }
        res.end();
    }
}
