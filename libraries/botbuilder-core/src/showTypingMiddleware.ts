/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ActivityTypes, ConversationReference } from 'botframework-schema';
import { Middleware } from './middlewareSet';
import { TurnContext } from './turnContext';

 /**
  * Middleware that will send a typing indicator autmatically for each message.
  * 
  * @remarks
  * When added, this middleware will send typing activities back to the user when a Message activity
  * is receieved to let them know that the bot has received the message and is working on the response.
  * You can specify a delay in milliseconds before the first typing activity is sent and then a frequency,
  * also in milliseconds which determines how often another typing activity is sent. Typing activities
  * will continue to be sent until your bot sends another message back to the user
  */
export class ShowTypingMiddleware implements Middleware {
        private readonly delay: number;
        private readonly period: number;
        private interval: any;
        private finished: boolean;

        /**
         * Create the SendTypingIndicator middleware
         * @param delay {number} Number of milliseconds to wait before sending the first typing indicator.
         * @param period {number} Number of milliseconds to wait before sending each following indicator.
         */
        constructor(delay: number = 500, period: number = 2000) {
            if (delay < 0) {
                throw new Error('Delay must be greater than or equal to zero');
            }

            if (period <= 0) {
                throw new Error('Repeat period must be greater than zero');
            }

            this.delay = delay;
            this.period = period;
        }

        /** Implement middleware signature
         * @param context {TurnContext} An incoming TurnContext object.
         * @param next {function} The next delegate function.
         */
        public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
            if (context.activity.type === ActivityTypes.Message) {
                 await this.sleep(this.delay);
                 await this.sendTypingActivity(context);

                 this.startInterval(context);
            }

            // Let the rest of the process run.
            // After everything has run, stop the indicator!
            return await next().then(
                () => { this.stopInterval(); },
                () => { this.stopInterval(); }
            );

        }

        private async sleep(ms: number): Promise<{}> {
            return new Promise((resolve: any): void => { setTimeout(resolve, ms); });
        }

        private startInterval(context: TurnContext): void {
            this.finished = false;

            this.interval = setInterval(
                () => {
                    if (!this.finished) {
                        this.sendTypingActivity(context);
                    }
                },
                this.period
            );
        }

        private stopInterval(): void {
            this.finished = true;
            if (this.interval) {
                clearInterval(this.interval);
            }
        }

        private async sendTypingActivity(context: TurnContext): Promise<void> {

            let typingActivity: Partial<Activity> = {
                type: ActivityTypes.Typing,
                relatesTo: context.activity.relatesTo
            };

            // Sending the Activity directly via the Adapter avoids other middleware and avoids setting the
            // responded flag. However this also requires tha tthe conversation reference details are explicitly added.
            const conversationReference: Partial<ConversationReference> = TurnContext.getConversationReference(context.activity);
            typingActivity = TurnContext.applyConversationReference(typingActivity, conversationReference);

            await context.adapter.sendActivities(context, [typingActivity]);

        }

 }
