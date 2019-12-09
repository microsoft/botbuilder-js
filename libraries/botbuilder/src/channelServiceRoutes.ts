/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ChannelServiceHandler } from './channelServiceHandler';
import { Activity, ConversationParameters, Transcript, AttachmentData } from 'botbuilder-core';
import { WebRequest, WebResponse, StatusCodeError, StatusCodes } from './botFrameworkAdapter';

export class ChannelServiceRoutes {

    constructor(private readonly channelServiceHandler: ChannelServiceHandler) {
        this.channelServiceHandler = channelServiceHandler;
    }

    register(baseAddress, server) {
        server.post(baseAddress + '/v3/conversations/:conversationId/activities', this.processSendToConversation.bind(this));
        server.post(baseAddress + '/v3/conversations/:conversationId/activities/:activityId', this.processReplyToActivity.bind(this));
        server.put(baseAddress + '/v3/conversations/:conversationId/activities/:activityId', this.processUpdateActivity.bind(this));
        server.del(baseAddress + '/v3/conversations/:conversationId/activities/:activityId', this.processDeleteActivity.bind(this));
        server.get(baseAddress + '/v3/conversations/:conversationId/activities/:activityId/members', this.processGetActivityMembers.bind(this));
        server.post(baseAddress + '/v3/conversations', this.processCreateConversation.bind(this));
        server.get(baseAddress + '/v3/conversations', this.processGetConversations.bind(this));
        server.get(baseAddress + '/v3/conversations/:conversationId/members', this.processGetConversationMembers.bind(this));
        server.get(baseAddress + '/v3/conversations/:conversationId/pagedmembers', this.processGetConversationPagedMembers.bind(this));
        server.del(baseAddress + '/v3/conversations/:conversationId/members/:memberId', this.processDeleteConversationMember.bind(this));
        server.post(baseAddress + '/v3/conversations/:conversationId/activities/history', this.processSendConversationHistory.bind(this));
        server.post(baseAddress + '/v3/conversations/:conversationId/attachments', this.processUploadAttachment.bind(this));
    }

    processSendToConversation(req: WebRequest, res: WebResponse) {
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

    processReplyToActivity(req: WebRequest, res: WebResponse) {
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

    processUpdateActivity(req: WebRequest, res: WebResponse) {
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

    processDeleteActivity(req: WebRequest, res: WebResponse) {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        this.channelServiceHandler.handleDeleteActivity(authHeader, req.params.conversationId, req.params.activityId)
            .then(() => {
                res.status(200);
                res.end();
            })
            .catch(err => { ChannelServiceRoutes.handleError(err, res); });
    }

    processGetActivityMembers(req: WebRequest, res: WebResponse) {
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

    processCreateConversation(req: WebRequest, res: WebResponse) {
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

    processGetConversations(req: WebRequest, res: WebResponse) {
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

    processGetConversationMembers(req: WebRequest, res: WebResponse) {
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

    processGetConversationPagedMembers(req: WebRequest, res: WebResponse) {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        let pageSize = parseInt(req.query.pageSize);
        if (isNaN(pageSize))
        {
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

    processDeleteConversationMember(req: WebRequest, res: WebResponse) {
        const authHeader = req.headers.authorization || req.headers.Authorization || '';
        this.channelServiceHandler.handleDeleteConversationMember(authHeader, req.params.conversationId, req.params.memberId)
            .then((resourceResponse) => {
                res.status(200);
                res.end();
            })
            .catch(err => { ChannelServiceRoutes.handleError(err, res); });
        }

    processSendConversationHistory(req: WebRequest, res: WebResponse) {
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

    processUploadAttachment(req: WebRequest, res: WebResponse) {
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

    static readActivity(req: WebRequest) : Promise<Activity> {
        return new Promise((resolve, reject) => {
            function returnActivity(activity) {
                if (typeof activity !== 'object') { throw new Error(`Invalid request body.`); }
                if (typeof activity.type !== 'string') { throw new Error(`Missing activity type.`); }
                if (typeof activity.timestamp === 'string') { activity.timestamp = new Date(activity.timestamp); }
                if (typeof activity.localTimestamp === 'string') { activity.localTimestamp = new Date(activity.localTimestamp); }
                if (typeof activity.expiration === 'string') { activity.expiration = new Date(activity.expiration); }
                resolve(activity);
            }
    
            if (req.body) {
                try {
                    returnActivity(req.body);
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
                        returnActivity(body);
                    } catch (err) {
                        reject(new StatusCodeError(StatusCodes.BAD_REQUEST, err.message));
                    }
                });
            }
        });
    }

    static readBody<T>(req: WebRequest) : Promise<T> {
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

    static handleError(err: any, res: WebResponse) {
        if (err instanceof StatusCodeError) {
            res.send(err.message);
            res.status(err.statusCode);
        } else {
            res.status(500);
        }
        res.end();
    }
}

module.exports = { ChannelServiceRoutes: ChannelServiceRoutes };
