// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    MessageFactory,
    ActivityHandler,
    TurnContext,
} from 'botbuilder';


export class ActivityUpdateAndDeleteBot extends ActivityHandler {
    activityIds: string[];

    /*
     * From the UI you can just @mention the bot from any channelwith any string EXCEPT for "delete". If you send the bot "delete" it will delete
     * all of the previous bot responses and empty it's internal storage.
     */
    constructor(activityIds: string[]) {
        super();
        
        this.activityIds = activityIds;

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {

            TurnContext.removeRecipientMention(context.activity);
            if (context.activity.text == "delete")
            {
                for (const activityId of this.activityIds) {
                    await context.deleteActivity(activityId);
                }

                this.activityIds = [];
            }
            else
            {
                await this.sendMessageAndLogActivityId(context, `${context.activity.text}`);

                for (const activityId of this.activityIds) {
                    let newActivity = MessageFactory.text(context.activity.text);
                    newActivity.id = activityId;
                    await context.updateActivity(newActivity);
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    async sendMessageAndLogActivityId(context: TurnContext, text: string): Promise<void> {
        var replyActivity = MessageFactory.text(text);
        var resourceResponse = await context.sendActivity(replyActivity);
        await this.activityIds.push(resourceResponse.id);

        return;
    }    
}