/**
 * @module botbuilder-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Middleware, TurnContext, ResourceResponse, ActivityTypes } from 'botbuilder-core';

/**
 * Logger describes something that can log data, i.e. console
 */
export interface Logger {
    /**
     * Log some data
     */
    log: (...args: unknown[]) => void;
}

/**
 * Log a transcript of messages from a dialog to the console, along with additional diagnostic information.
 * For use with the `DialogTestClient` class.
 *
 * Example:
 * ```javascript
 * let client = new DialogTestClient(DIALOG, OPTIONS, [new DialogTestLogger()]);
 * ```
 */
export class DialogTestLogger implements Middleware {
    private _stopwatchStateKey = Symbol('stopwatch');

    /**
     * Initializes a new instance of the [DialogTestLogger](xref:botbuilder-testing.DialogTestLogger) class.
     *
     * @param logger A logger object with a `log` function.
     */
    public constructor(private readonly logger: Logger = console) {}

    /**
     * Called each time the bot receives a new request.
     *
     * @param context [TurnContext](xref:botbuilder-core.TurnContext) for current turn of conversation with the user.
     * @param next Function to call to continue execution to the next step in the middleware chain.
     * @returns A `Promise` that represents the work queued to execute.
     */
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        // log incoming
        if (context.activity.type == ActivityTypes.Message) {
            this.logger.log(`User: Text = ${context.activity.text}`);
        } else {
            this.logger.log(`User: Activity = ${context.activity.type}`);
            JSON.stringify(context.activity, null, 2)
                .split(/\n/)
                .forEach((line) => {
                    this.logger.log(line);
                });
        }
        const now = new Date();
        context.turnState[this._stopwatchStateKey] = now;
        const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        this.logger.log(`-> ts: ${timestamp}`);

        context.onSendActivities(
            async (context, activities, next): Promise<ResourceResponse[]> => {
                // log outgoing
                activities.forEach((activity) => {
                    if (activity.type == ActivityTypes.Message) {
                        this.logger.log(`Bot: Text      = ${activity.text}`);
                        this.logger.log(`     Speak     = ${activity.speak}`);
                        this.logger.log(`     InputHint = ${activity.inputHint}`);
                    } else {
                        this.logger.log(`Bot: Activity = ${activity.type}`);
                        JSON.stringify(activity, null, 2)
                            .split(/\n/)
                            .forEach((line) => {
                                this.logger.log(line);
                            });
                    }
                });
                const now = new Date();
                const stopwatch = context.turnState[this._stopwatchStateKey];
                const mms = now.getTime() - stopwatch.getTime();
                const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
                this.logger.log(`-> ts: ${timestamp} elapsed ${mms} ms`);

                return next();
            }
        );
        await next();
    }
}
