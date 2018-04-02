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
            // Initialize activity
            const activity = botbuilder_core_1.TurnContext.applyConversationReference({
                type: botbuilder_core_1.ActivityTypes.Message,
                id: (this.nextId++).toString(),
                timestamp: new Date(),
                text: line
            }, this.reference, true);
            // Create context and run middleware pipe
            const context = new botbuilder_core_1.TurnContext(this, activity);
            this.runMiddleware(context, logic)
                .catch((err) => { this.printError(err.toString()); });
        });
        return function close() {
            rl.close();
        };
    }
    continueConversation(reference, logic) {
        // Create context and run middleware pipe
        const activity = botbuilder_core_1.TurnContext.applyConversationReference({}, reference, true);
        const context = new botbuilder_core_1.TurnContext(this, activity);
        return this.runMiddleware(context, logic)
            .catch((err) => { this.printError(err.toString()); });
    }
    sendActivities(context, activities) {
        const that = this;
        return new Promise((resolve, reject) => {
            const responses = [];
            function next(i) {
                if (i < activities.length) {
                    responses.push({});
                    let a = activities[i];
                    switch (a.type) {
                        case 'delay':
                            setTimeout(() => next(i + 1), a.value);
                            break;
                        case botbuilder_core_1.ActivityTypes.Message:
                            if (a.attachments && a.attachments.length > 0) {
                                const append = a.attachments.length == 1 ? `(1 attachment)` : `(${a.attachments.length} attachments)`;
                                that.print(`${a.text} ${append}`);
                            }
                            else {
                                that.print(a.text);
                            }
                            next(i + 1);
                            break;
                        default:
                            that.print(`[${a.type}]`);
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
    updateActivity(context, activity) {
        return Promise.reject(new Error(`ConsoleAdapter.updateActivity(): not supported.`));
    }
    deleteActivity(context, reference) {
        return Promise.reject(new Error(`ConsoleAdapter.deleteActivity(): not supported.`));
    }
    createInterface(options) {
        return readline.createInterface(options);
    }
    print(line) {
        console.log(line);
    }
    printError(line) {
        console.error(line);
    }
}
exports.ConsoleAdapter = ConsoleAdapter;
//# sourceMappingURL=consoleAdapter.js.map