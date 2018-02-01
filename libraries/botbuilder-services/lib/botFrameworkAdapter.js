"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botframework_connector_1 = require("botframework-connector");
const botframework_connector_2 = require("botframework-connector");
/**
* ActivityAdapter class needed to communicate with a Bot Framework channel or the Emulator.
*
* **Usage Example**
*
* ```js
* import { Bot } from 'botbuilder';
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
class BotFrameworkAdapter {
    /**
     * Creates a new instance of the activity adapter.
     *
     * @param settings (optional) settings object
     */
    constructor(settings) {
        this.nextId = 0;
        settings = settings === undefined ? { appId: '', appPassword: '' } : settings;
        const botCredentials = { appId: settings.appId, appPassword: settings.appPassword };
        this.credentials = new botframework_connector_2.MicrosoftAppCredentials(botCredentials);
        this.authenticator = new botframework_connector_2.BotAuthenticator(botCredentials);
        this.onReceive = undefined;
    }
    /**
     * Creates a new conversation
     *
     * @param {ConversationParameters} conversationParameters
     * @param {ConversationReference} conversationReference
     * @returns {Promise<ConversationResourceResponse>}
     */
    createConversation(conversationParameters, conversationReference) {
        let conversationResourceResponse = {
            activityId: conversationReference.activityId,
            serviceUrl: conversationReference.serviceUrl,
            id: ''
        };
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                let client = new botframework_connector_1.ConnectorClient(this.credentials);
                let response = yield client.conversations.createConversation(conversationParameters);
                conversationResourceResponse.id = response.id;
                resolve(conversationResourceResponse);
            }
            catch (err) {
                reject(err);
            }
        }));
    }
    update(activity) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                let client = new botframework_connector_1.ConnectorClient(this.credentials);
                yield client.conversations.updateActivity(activity.conversation.id, activity.id, activity);
                resolve();
            }
            catch (err) {
                reject(err);
            }
        }));
    }
    delete(activity) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                let client = new botframework_connector_1.ConnectorClient(this.credentials);
                yield client.conversations.deleteActivity(activity.conversation.id, activity.id);
                resolve();
            }
            catch (err) {
                reject(err);
            }
        }));
    }
    post(activities) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const credentials = this.credentials;
            const clientCache = {};
            function createClient(serviceUrl) {
                if (serviceUrl) {
                    if (!clientCache.hasOwnProperty(serviceUrl)) {
                        clientCache[serviceUrl] = new botframework_connector_1.ConnectorClient(credentials, serviceUrl);
                    }
                    return clientCache[serviceUrl];
                }
            }
            const responses = [];
            function next(i) {
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
                                    client.conversations.sendToConversation(activity.conversation.id, activity)
                                        .then((result) => {
                                        responses.push(result || {});
                                        next(i + 1);
                                    }, (err) => {
                                        reject(err);
                                    });
                                }
                                else {
                                    reject(new Error(`BotFrameworkAdapter: activity missing 'conversation.id'.`));
                                }
                            }
                            else {
                                reject(new Error(`BotFrameworkAdapter: activity missing 'serviceUrl'.`));
                            }
                            break;
                    }
                }
                else {
                    resolve(responses);
                }
            }
            next(0);
        }));
    }
    /**
     * Listens for incoming activities off a Restify or Express.js POST route.
     */
    listen() {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req.body) {
                yield this.processRequest(req, res);
            }
            else {
                let requestData = '';
                req.on('data', (chunk) => {
                    requestData += chunk;
                });
                req.on('end', () => __awaiter(this, void 0, void 0, function* () {
                    req.body = JSON.parse(requestData);
                    yield this.processRequest(req, res);
                }));
            }
        });
    }
    processRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let activity = req.body;
            try {
                // authenticate the incoming request
                yield this.authenticator.authenticate(req.headers, activity.channelId, activity.serviceUrl);
                // call onReceive delegate
                yield this.onReceive(activity);
                // TODO: Add logic to return 'invoke' response
                res.send(202);
            }
            catch (err) {
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
        });
    }
}
exports.BotFrameworkAdapter = BotFrameworkAdapter;
// END OF LINE
//# sourceMappingURL=botFrameworkAdapter.js.map