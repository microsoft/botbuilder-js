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
  */
export class ShowTypingMiddleware implements Middleware {
        private readonly _delay: number;
        private readonly _period: number;
        private _interval: number;

        constructor(delay: number = 500, period: number = 2000) {
            // noop
            if (delay < 0) {
                throw new Error('Delay must be greater than or equal to zero');
            }

            if (period <= 0) {
                throw new Error('Repeat period must be greater than zero');
            }

            this._delay = delay;
            this._period = period;
        }

        public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
            if (context.activity.type === ActivityTypes.Message) {
                 await this.sleep(this._delay);
                 await this.sendTypingActivity(context);
                // how do we continue to send while waiting for response

            }

            // let the rest of the process run.
            // while it is running, continue to send typing indicators.
            await next();

            // After everything has run, stop the indicator!
            if (this._interval) {
                clearInterval(this._interval);
            }

        }

        private async sleep(ms) {
            return new Promise((resolve: any): Promise<any> => setTimeout(resolve, ms));
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
