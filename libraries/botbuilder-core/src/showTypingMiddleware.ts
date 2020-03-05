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
  * Middleware that will send a typing indicator automatically for each message.
  *
  * @remarks
  * When added, this middleware will send typing activities back to the user when a Message activity
  * is received to let them know that the bot has received the message and is working on the response.
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

        let finished = false;
        let hTimeout: any = undefined;

        /**
             * @param context TurnContext object representing incoming message.
             * @param delay The initial delay before sending the first indicator.
             * @param period How often to send the indicator after the first.
             */
        function startInterval(context: TurnContext, delay: number, period: number): void {
            hTimeout = setTimeout(
                async () => {
                    if (!finished) {
                        let typingActivity: Partial<Activity> = {
                            type: ActivityTypes.Typing,
                            relatesTo: context.activity.relatesTo
                        };

                        // Sending the Activity directly via the Adapter avoids other middleware and avoids setting the
                        // responded flag. However this also requires that the conversation reference details are explicitly added.
                        const conversationReference: Partial<ConversationReference> =
                                TurnContext.getConversationReference(context.activity);
                        typingActivity = TurnContext.applyConversationReference(typingActivity, conversationReference);

                        await context.adapter.sendActivities(context, [typingActivity]);

                        // Pass in period as the delay to repeat at an interval.
                        startInterval(context, period, period);
                    } else {
                        // Do nothing! This turn is done and we don't want to continue sending typing indicators.
                    }
                },
                delay
            );
        }

        if (context.activity.type === ActivityTypes.Message) {
            // Set a property to track whether or not the turn is finished.
            // When it flips to true, we won't send anymore typing indicators.
            finished = false;
            startInterval(context, this.delay, this.period);
        }

        // Let the rest of the process run.
        // After everything has run, stop the indicator!
        try {
            return await next();
        }
        finally
        {
            finished = true;
            if (hTimeout) {
                clearTimeout(hTimeout);
            }
        }
    }
    private async sendTypingActivity(context: TurnContext): Promise<void> {

        let typingActivity: Partial<Activity> = {
            type: ActivityTypes.Typing,
            relatesTo: context.activity.relatesTo
        };

        // Sending the Activity directly via the Adapter avoids other middleware and avoids setting the
        // responded flag. However this also requires that the conversation reference details are explicitly added.
        const conversationReference: Partial<ConversationReference> = TurnContext.getConversationReference(context.activity);
        typingActivity = TurnContext.applyConversationReference(typingActivity, conversationReference);

        await context.adapter.sendActivities(context, [typingActivity]);

    }

}
