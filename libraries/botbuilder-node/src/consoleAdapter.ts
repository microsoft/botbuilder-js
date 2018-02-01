/**
 * @module botbuilder-node
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActivityAdapter } from 'botbuilder';
import { ActivityTypes, Activity, ConversationResourceResponse } from 'botbuilder';
import * as readline from 'readline';

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
export class ConsoleAdapter implements ActivityAdapter {
    private nextId = 0;
    private rl: readline.ReadLine;

    constructor () {
        this.rl = undefined as any;
        this.onReceive = undefined as any;
    }

    /** INTERNAL implementation of `Adapter.onReceive`. */
    public onReceive: (activity: Activity) => Promise<void>;

    /** INTERNAL implementation of `Adapter.post()`. */
    public post(activities: Partial<Activity>[]): Promise<ConversationResourceResponse[]> {
        return new Promise((resolve, reject) => {
            const responses: ConversationResourceResponse[] = [];
            function next(i: number) {
                if (i < activities.length) {
                    responses.push({});
                    let a = activities[i];
                    switch (a.type || ActivityTypes.message) {
                        case 'delay':
                            setTimeout(() => next(i + 1), a.value || 0);
                            break;
                        case ActivityTypes.message:
                            if (a.attachments && a.attachments.length > 0) {
                                const append = a.attachments.length == 1 ? `(1 attachment)` : `(${a.attachments.length} attachments)`;
                                console.log(`${a.text || ''} ${append}`);
                            } else {
                                console.log(a.text || '');
                            }
                            next(i + 1);
                            break;
                        default:
                            console.log(`[${a.type}]`);
                            next(i + 1);
                            break;
                    }
                } else {
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
    public listen(): this {
        this.rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
        this.rl.on('line', (line: string) => {
            line = line || '';
            if (line.toLowerCase() == 'quit') {
                this.rl.close();
                process.exit();
            } else {
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
    public receive(text: string): this {
        if (this.onReceive) {
            const activity = <Activity>{
                type: ActivityTypes.message,
                channelId: 'console',
                from: { id: 'user', name: 'User1' },
                recipient: { id: 'bot', name: 'Bot' },
                conversation:  { id: 'Convo1' },
                timestamp: new Date(),
                text: text || '',
                id: (this.nextId++).toString()
            };
            this.onReceive(activity);
        }
        return this;
    }

}