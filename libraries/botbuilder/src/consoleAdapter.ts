/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotAdapter, TurnContext, Activity, ActivityTypes, ResourceResponse, Promiseable, ConversationReference } from 'botbuilder-core';
import * as readline from 'readline';

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
export class ConsoleAdapter extends BotAdapter {
    private nextId = 0;
    private readonly reference: ConversationReference;

    constructor(reference?: ConversationReference) {
        super();
        this.reference = Object.assign({
            channelId: 'console',
            user: { id: 'user', name: 'User1' },
            bot: { id: 'bot', name: 'Bot' },
            conversation:  { id: 'convo1', name:'', isGroup: false },
            serviceUrl: ''
        } as ConversationReference, reference);
    }

    /**
     * Begins listening to console input. 
     * @param logic Function which will be called each time a message is input by the user.
     */
    public listen(logic: (context: TurnContext) => Promiseable<void>): Function {
        const rl = this.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
        rl.on('line', (line: string) => {
            // Initialize activity
            const activity = TurnContext.applyConversationReference({
                type: ActivityTypes.Message,
                id: (this.nextId++).toString(),
                timestamp: new Date(),
                text: line
            }, this.reference, true);

            // Create context and run middleware pipe
            const context = new TurnContext(this, activity);
            this.runMiddleware(context, logic)
                .catch((err) => { this.printError(err.toString()) });
        });
        return function close() {
            rl.close();
        }
    }

    public continueConversation(reference: ConversationReference, logic: (context: TurnContext) => Promiseable<void>): Promise<void> {
            // Create context and run middleware pipe
            const activity = TurnContext.applyConversationReference({}, reference, true);
            const context = new TurnContext(this, activity);
            return this.runMiddleware(context, logic)
                       .catch((err) => { this.printError(err.toString()) });
    }

    public sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const that = this;
        return new Promise((resolve, reject) => {
            const responses: ResourceResponse[] = [];
            function next(i: number) {
                if (i < activities.length) {
                    responses.push(<ResourceResponse>{});
                    let a = activities[i];
                    switch (a.type) {
                        case <ActivityTypes>'delay':
                            setTimeout(() => next(i + 1), a.value);
                            break;
                        case ActivityTypes.Message:
                            if (a.attachments && a.attachments.length > 0) {
                                const append = a.attachments.length == 1 ? `(1 attachment)` : `(${a.attachments.length} attachments)`;
                                that.print(`${a.text} ${append}`);
                            } else {
                                that.print(a.text);
                            }
                            next(i + 1);
                            break;
                        default:
                            that.print(`[${a.type}]`);
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

    public updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        return Promise.reject(new Error(`ConsoleAdapter.updateActivity(): not supported.`));
    }

    public deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        return Promise.reject(new Error(`ConsoleAdapter.deleteActivity(): not supported.`));
    }

    protected createInterface(options: readline.ReadLineOptions): readline.ReadLine {
        return readline.createInterface(options);
    }

    protected print(line: string) {
        console.log(line);
    }

    protected printError(line: string) {
        console.error(line);
    }
}