/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotAdapter, TurnContext, Activity, ResourceResponse, ConversationReference } from 'botbuilder-core';

/**
 * @private
 */
export class DialogManagerAdapter extends BotAdapter {
    public readonly activities: Partial<Activity>[] = [];

    public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const response: ResourceResponse[] = [];
        activities.forEach((a) => {
            this.activities.push(a);
            response.push({} as ResourceResponse);
        });
        return response;
    }

    public updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        throw new Error(`BotRunAdapter: adapter.updateActivity() isn't supported from Bot.run().`);
    }

    public deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        throw new Error(`BotRunAdapter: adapter.deleteActivity() isn't supported from Bot.run().`);
    }

    public continueConversation(reference: Partial<ConversationReference>, logic: (revocableContext: TurnContext) => Promise<void>): Promise<void> {
        throw new Error(`BotRunAdapter: adapter.continueConversation() isn't supported from Bot.run().`);
    }
}