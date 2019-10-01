/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ConversationReference, ResourceResponse } from 'botframework-schema';
import { TurnContext } from './turnContext';
import { BotAdapter } from './botAdapter';

export abstract class MultiAdapter extends BotAdapter {
    private readonly adapters: AdapterMap = {};

    public addAdapter(adapter: BotAdapter): this;
    public addAdapter(channelId: string, adapter: BotAdapter): this;
    public addAdapter(idOrAdapter: string|BotAdapter, adapter?: BotAdapter): this {
        if (typeof idOrAdapter == 'object') {
            adapter = idOrAdapter;
            idOrAdapter = '*';
        }

        // Ensure unique and add
        if (this.adapters.hasOwnProperty(idOrAdapter)) { throw new Error(`MultiAdapter.addAdapter(): an adapter with a channel id of '${idOrAdapter}' has already been added.'`) }
        this.adapters[idOrAdapter] = adapter;

        // Chain middleware stacks together
        adapter.use(async (context: TurnContext, next: () => Promise<void>) => {
            await this.middleware.run(context, next)
        });

        return this;
    }

    public getAdapter(channelId: string): BotAdapter {
        let adapter = this.adapters[channelId];
        if (adapter == undefined) { this.adapters['*'] }
        if (adapter == undefined) { throw new Error(`MultiAdapter.getAdapter(): an adapter with a channel id of '${channelId}' not found.`) }
        return adapter;
    }

    public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const results: ResourceResponse[] = [];
        for (let i = 0; i < activities.length; i++) {
            // Route to appropriate adapter
            const adapter = this.getAdapter(activities[i].channelId);
            const r = await adapter.sendActivities(context, [activities[i]]);
            results[i] = Array.isArray(r) && r.length > 0 ? r[0] : {} as ResourceResponse;
        }

        return results;
    }

    public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        // Route to appropriate adapter
        const adapter = this.getAdapter(activity.channelId);
        return await adapter.updateActivity(context, activity);
    }

    public async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        // Route to appropriate adapter
        const adapter = this.getAdapter(reference.channelId);
        return await adapter.deleteActivity(context, reference);
    }

    public async continueConversation(
        reference: Partial<ConversationReference>,
        logic: (revocableContext: TurnContext
        ) => Promise<void>): Promise<void> {
        // Route to appropriate adapter
        const adapter = this.getAdapter(reference.channelId);
        return await adapter.continueConversation(reference, logic);
    }
}

interface AdapterMap {
    [channelId: string]: BotAdapter;
}