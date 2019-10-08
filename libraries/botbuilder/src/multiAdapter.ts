/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ConversationReference, ResourceResponse } from 'botframework-schema';
import { TurnContext, BotAdapter } from 'botbuilder-core';

/**
 * Aggregates multiple adapters into a single adapter.
 * 
 * @remarks
 * This enables scenarios like the ability to receive a message from a user on one channel 
 * which you then word to another user or bot/skill on another channel. 
 */
export abstract class MultiAdapter extends BotAdapter {
    private readonly adapters: AdapterMap = {};
    private readonly protocols: { [scheme: string]: BotAdapter; } = {};

    /**
     * Adds a new adapter to the aggregator.
     * 
     * @remarks
     * The added adapters middleware chain will be updated to call through the aggregators 
     * middleware chain. This lets all aggregated adapters share a common middleware stack.
     * @param channelId (Optional) ID of the channel to use the adapter for. Defaults to a value of `*` which indicates the default adapter. 
     * @param adapter Bot adapter to aggregate.
     */
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

        // Update protocol map
        adapter.forwardProtocols.forEach((scheme) => {
            if (!this.protocols.hasOwnProperty(scheme)) {
                this.protocols[scheme] = adapter;
            }
        });

        // Chain middleware stacks together
        adapter.use(async (context: TurnContext, next: () => Promise<void>) => {
            await this.middleware.run(context, next)
        });

        return this;
    }


    /**
     * Returns an adapter for a given channel ID.
     * 
     * @remarks
     * If a mapping for the specified ID can't be found, the default adapter will be returned. If
     * no default (`*`) adapter has been added then an exception will be thrown.
     * @param channelId The ID of the channel to lookup. 
     */
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

    public get forwardProtocols(): string[] {
        // Return aggregated list of supported protocols
        const protocols: string[] = [];
        for (const scheme in this.protocols) {
            if (this.protocols.hasOwnProperty(scheme)) {
                protocols.push(scheme);
            }
        }
        return protocols;
    }

    public async forwardActivity(context: TurnContext, protocolUri: string, activity: Partial<Activity>): Promise<void> {
        // Find adapter to use based on protocol
        const index = protocolUri.indexOf(':');
        if (index > 0) {
            const scheme = protocolUri.substr(0, index);
            const adapter = this.protocols[scheme];
            if (adapter) {
                await adapter.forwardActivity(context, protocolUri, activity);
                return;
            }
        }

        // Protocol not supported
        throw new Error(`MultiAdapter.forwardActivity: protocolUri not supported "${protocolUri}".`)
    }
}

interface AdapterMap {
    [channelId: string]: BotAdapter;
}