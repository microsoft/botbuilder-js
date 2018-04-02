"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_core_1 = require("botbuilder-core");
const botframework_connector_1 = require("botframework-connector");
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
class BotFrameworkAdapter extends botbuilder_core_1.BotAdapter {
    /**
     * Creates a new BotFrameworkAdapter instance.
     * @param settings (optional) configuration settings for the adapter.
     */
    constructor(settings) {
        super();
        this.invokeResponses = {};
        this.settings = Object.assign({ appId: '', appPassword: '' }, settings);
        this.credentials = new botframework_connector_1.MicrosoftAppCredentials(this.settings.appId, this.settings.appPassword || '');
        this.credentialsProvider = new botframework_connector_1.SimpleCredentialProvider(this.credentials.appId, this.credentials.appPassword);
    }
    processActivity(req, res, logic) {
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
                return this.runMiddleware(context, logic)
                    .then(() => {
                    if (request.type === botbuilder_core_1.ActivityTypes.Invoke) {
                        const key = request.channelId + '/' + request.id;
                        try {
                            const invokeResponse = this.invokeResponses[key];
                            if (invokeResponse && invokeResponse.value) {
                                const value = invokeResponse.value;
                                res.send(value.status, value.body);
                                res.end();
                            }
                            else {
                                throw new Error(`Bot failed to return a valid 'invokeResponse' activity.`);
                            }
                        }
                        finally {
                            if (this.invokeResponses.hasOwnProperty(key)) {
                                delete this.invokeResponses[key];
                            }
                        }
                    }
                    else {
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
    continueConversation(reference, logic) {
        const request = botbuilder_core_1.TurnContext.applyConversationReference({}, reference, true);
        const context = this.createContext(request);
        return this.runMiddleware(context, logic);
    }
    createConversation(reference, logic) {
        try {
            if (!reference.serviceUrl) {
                throw new Error(`BotFrameworkAdapter.createConversation(): missing serviceUrl.`);
            }
            // Create conversation
            const parameters = { bot: reference.bot };
            const client = this.createConnectorClient(reference.serviceUrl);
            return client.conversations.createConversation(parameters).then((response) => {
                // Initialize request and copy over new conversation ID and updated serviceUrl.
                const request = botbuilder_core_1.TurnContext.applyConversationReference({}, reference, true);
                request.conversation = { id: response.id };
                if (response.serviceUrl) {
                    request.serviceUrl = response.serviceUrl;
                }
                // Create context and run middleware
                const context = this.createContext(request);
                return this.runMiddleware(context, logic);
            });
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    sendActivities(context, activities) {
        return new Promise((resolve, reject) => {
            const responses = [];
            const that = this;
            function next(i) {
                if (i < activities.length) {
                    try {
                        const activity = activities[i];
                        switch (activity.type) {
                            case 'delay':
                                setTimeout(() => {
                                    responses.push({});
                                    next(i + 1);
                                }, typeof activity.value === 'number' ? activity.value : 1000);
                                break;
                            case 'invokeResponse':
                                const key = activity.channelId + '/' + activity.replyToId;
                                that.invokeResponses[key] = activity;
                                next(i + 1);
                                break;
                            default:
                                if (!activity.serviceUrl) {
                                    throw new Error(`BotFrameworkAdapter.sendActivity(): missing serviceUrl.`);
                                }
                                if (!activity.conversation || !activity.conversation.id) {
                                    throw new Error(`BotFrameworkAdapter.sendActivity(): missing conversation id.`);
                                }
                                let p;
                                const client = that.createConnectorClient(activity.serviceUrl);
                                if (activity.replyToId) {
                                    p = client.conversations.replyToActivity(activity.conversation.id, activity.replyToId, activity);
                                }
                                else {
                                    p = client.conversations.sendToConversation(activity.conversation.id, activity);
                                }
                                p.then((response) => {
                                    responses.push(response);
                                    next(i + 1);
                                }, (err) => reject(err));
                                break;
                        }
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                else {
                    resolve(responses);
                }
            }
            next(0);
        });
    }
    updateActivity(context, activity) {
        try {
            if (!activity.serviceUrl) {
                throw new Error(`BotFrameworkAdapter.updateActivity(): missing serviceUrl`);
            }
            if (!activity.conversation || !activity.conversation.id) {
                throw new Error(`BotFrameworkAdapter.updateActivity(): missing conversation or conversation.id`);
            }
            if (!activity.id) {
                throw new Error(`BotFrameworkAdapter.updateActivity(): missing activity.id`);
            }
            const client = this.createConnectorClient(activity.serviceUrl);
            return client.conversations.updateActivity(activity.conversation.id, activity.id, activity).then(() => { });
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    deleteActivity(context, reference) {
        try {
            if (!reference.serviceUrl) {
                throw new Error(`BotFrameworkAdapter.deleteActivity(): missing serviceUrl`);
            }
            if (!reference.conversation || !reference.conversation.id) {
                throw new Error(`BotFrameworkAdapter.deleteActivity(): missing conversation or conversation.id`);
            }
            if (!reference.activityId) {
                throw new Error(`BotFrameworkAdapter.deleteActivity(): missing activityId`);
            }
            const client = this.createConnectorClient(reference.serviceUrl);
            return client.conversations.deleteActivity(reference.conversation.id, reference.activityId);
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    authenticateRequest(request, authHeader) {
        return botframework_connector_1.JwtTokenValidation.assertValidActivity(request, authHeader, this.credentialsProvider);
    }
    createConnectorClient(serviceUrl) {
        return new botframework_connector_1.ConnectorClient(this.credentials, serviceUrl);
    }
    createContext(request) {
        return new botbuilder_core_1.TurnContext(this, request);
    }
}
exports.BotFrameworkAdapter = BotFrameworkAdapter;
function parseRequest(req) {
    return new Promise((resolve, reject) => {
        function returnActivity(activity) {
            if (typeof activity !== 'object') {
                throw new Error(`BotFrameworkAdapter.parseRequest(): invalid request body.`);
            }
            if (typeof activity.type !== 'string') {
                throw new Error(`BotFrameworkAdapter.parseRequest(): missing activity type.`);
            }
            resolve(activity);
        }
        if (req.body) {
            try {
                returnActivity(req.body);
            }
            catch (err) {
                reject(err);
            }
        }
        else {
            let requestData = '';
            req.on('data', (chunk) => {
                requestData += chunk;
            });
            req.on('end', () => {
                try {
                    req.body = JSON.parse(requestData);
                    returnActivity(req.body);
                }
                catch (err) {
                    reject(err);
                }
            });
        }
    });
}
//# sourceMappingURL=botFrameworkAdapter.js.map