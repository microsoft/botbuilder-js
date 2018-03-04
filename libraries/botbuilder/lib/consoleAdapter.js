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
const readline = require("readline");
/**
 * :package: **botbuilder-core**
 *
 * Lets a user communicate with a bot from a console window.
 *
 * **Usage Example**
 *
 * ```JavaScript
 * ```
 */
class ConsoleAdapter extends botbuilder_core_1.BotAdapter {
    constructor(reference) {
        super();
        this.nextId = 0;
        this.reference = Object.assign({
            channelId: 'console',
            user: { id: 'user', name: 'User1' },
            bot: { id: 'bot', name: 'Bot' },
            conversation: { id: 'convo1', name: '', isGroup: false },
            serviceUrl: ''
        }, reference);
    }
    /**
     * Begins listening to console input.
     * @param logic Function which will be called each time a message is input by the user.
     */
    listen(logic) {
        const rl = this.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
        rl.on('line', (line) => {
            // Initialize request
            const request = botbuilder_core_1.BotContext.applyConversationReference({
                type: botbuilder_core_1.ActivityTypes.Message,
                id: (this.nextId++).toString(),
                timestamp: new Date(),
                text: line
            }, this.reference, true);
            // Create context and run middleware pipe
            const context = new botbuilder_core_1.BotContext(this, request);
            this.runMiddleware(context, logic)
                .catch((err) => { console.error(err.toString()); });
        });
        return function quit() {
            rl.close();
        };
    }
    sendActivity(activities) {
        return new Promise((resolve, reject) => {
            const responses = [];
            function next(i) {
                if (i < activities.length) {
                    responses.push({});
                    let a = activities[i];
                    switch (a.type || botbuilder_core_1.ActivityTypes.Message) {
                        case 'delay':
                            setTimeout(() => next(i + 1), a.value || 0);
                            break;
                        case botbuilder_core_1.ActivityTypes.Message:
                            if (a.attachments && a.attachments.length > 0) {
                                const append = a.attachments.length == 1 ? `(1 attachment)` : `(${a.attachments.length} attachments)`;
                                console.log(`${a.text || ''} ${append}`);
                            }
                            else {
                                console.log(a.text || '');
                            }
                            next(i + 1);
                            break;
                        default:
                            console.log(`[${a.type}]`);
                            next(i + 1);
                            break;
                    }
                }
                else {
                    resolve(responses);
                }
            }
            next(0);
        });
    }
    updateActivity(activity) {
        return Promise.reject(new Error(`ConsoleAdapter.updateActivity(): not supported.`));
    }
    deleteActivity(reference) {
        return Promise.reject(new Error(`ConsoleAdapter.deleteActivity(): not supported.`));
    }
    createInterface(options) {
        return readline.createInterface(options);
    }
}
exports.ConsoleAdapter = ConsoleAdapter;
//# sourceMappingURL=consoleAdapter.js.map