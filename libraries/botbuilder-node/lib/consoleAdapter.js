"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const readline = require("readline");
/**
 * Lets a user communicate with a bot from a console window.
 *
 * **Usage Example**
 *
 * ```js
 * const adapter = new ConsoleAdapter().listen();
 * const bot = new Bot(adapter)
 *      .onReceive((context) => {
 *          context.reply(`Hello World!`);
 *      });
 * ```
 */
class ConsoleAdapter {
    constructor() {
        this.nextId = 0;
        this.rl = undefined;
        this.onReceive = undefined;
    }
    /** INTERNAL implementation of `Adapter.post()`. */
    post(activities) {
        return new Promise((resolve, reject) => {
            const responses = [];
            function next(i) {
                if (i < activities.length) {
                    responses.push({});
                    let a = activities[i];
                    switch (a.type || botbuilder_1.ActivityTypes.message) {
                        case 'delay':
                            setTimeout(() => next(i + 1), a.value || 0);
                            break;
                        case botbuilder_1.ActivityTypes.message:
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
    /**
     * Begins listening to console input. The listener will call [receive()](#receive) after
     * parsing input from the user.
     */
    listen() {
        this.rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
        this.rl.on('line', (line) => {
            line = line || '';
            if (line.toLowerCase() == 'quit') {
                this.rl.close();
                process.exit();
            }
            else {
                this.receive(line);
            }
        });
        return this;
    }
    /**
     * Processes input received from the user.
     *
     * @param text The users utterance.
     */
    receive(text) {
        if (this.onReceive) {
            const activity = {
                type: botbuilder_1.ActivityTypes.message,
                channelId: 'console',
                from: { id: 'user', name: 'User1' },
                recipient: { id: 'bot', name: 'Bot' },
                conversation: { id: 'Convo1' },
                timestamp: new Date(),
                text: text || '',
                id: (this.nextId++).toString()
            };
            this.onReceive(activity);
        }
        return this;
    }
}
exports.ConsoleAdapter = ConsoleAdapter;
//# sourceMappingURL=consoleAdapter.js.map