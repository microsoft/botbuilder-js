/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotAdapter, TurnContext, ConversationReference, Activity, ResourceResponse, ActivityTypes } from 'botbuilder-core';
import { ActivityStore } from './activityStore';

export class AdaptiveTestAdapter extends BotAdapter {
    private readonly logic: (revocableContext: TurnContext) => Promise<void>;
    private readonly transport: (activity: Partial<Activity>) => Promise<ResourceResponse>;

    constructor (logic: (revocableContext: TurnContext) => Promise<void>, transport: (activity: Partial<Activity>) => Promise<ResourceResponse>) {
        super();
        this.logic = logic;
        this.transport = transport;
    }

    public readonly store: ActivityStore = new ActivityStore();

    public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const responses: ResourceResponse[] = [];
        for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];
            switch (activity.type) {
                case 'delay':
                    await delay(activity.value);
                    responses.push({ id: undefined });
                    break;
                case 'trace':
                    // Ignore trace activities
                    responses.push({ id: undefined });
                    break;
                default:
                    const response = await this.transport(activity);
                    responses.push(response);
                    break;                
            }
        }

        return responses;
    }

    public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        // Map to 'updateActivity' event
        const clone: Partial<Activity> = JSON.parse(JSON.stringify(activity));
        await context.sendActivity({
            type: ActivityTypes.Event,
            name: 'updateActivity',
            value: clone
        });
    }

    public async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        // Map to 'updateActivity' event
        const clone: Partial<ConversationReference> = JSON.parse(JSON.stringify(reference));
        await context.sendActivity({
            type: ActivityTypes.Event,
            name: 'deleteActivity',
            value: clone
        });

    }

    public async continueConversation(reference: Partial<ConversationReference>, logic: (revocableContext: TurnContext) => Promise<void>): Promise<void> {
        // Not implemented
        throw new Error(`AdaptiveTestAdapter.continueConversation: not implemented`);
    }

    public async flushActivities(): Promise<number> {
        let count = 0;
        while (true) {
            const activity = this.store.dequeueActivity();
            if (activity) {
                const ctx = new TurnContext(this, activity);
                await this.runMiddleware(ctx, this.logic);
            } else {
                break;
            }
        }

        return count;
    }
}

function delay(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), timeout);
    });
}