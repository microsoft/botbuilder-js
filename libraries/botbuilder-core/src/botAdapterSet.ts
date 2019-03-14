/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotAdapter } from './botAdapter';
import { TurnContext } from './turnContext';

export class BotAdapterSet {
    private adapters: { [channel:string]: BotAdapter; } = {};

    constructor (defaultAdapter?: BotAdapter) {
        if (defaultAdapter) {
            this.addAdapter('*', defaultAdapter);
        }
    }

    public addAdapter(channels: string|string[], adapter: BotAdapter): this {
        // Add callback hook to adapters middleware chain
        adapter.use((context, next) => this.onTurn(context, next));

        // Save to map
        (Array.isArray(channels) ? channels : [channels]).forEach((channel) => {
            this.adapters[channel] = adapter;
        });
        return this;
    }

    public findAdapter(channel: string): BotAdapter|undefined {
        if (this.adapters.hasOwnProperty(channel)) {
            return this.adapters[channel];
        } else if (this.adapters.hasOwnProperty('*')) {
            return this.adapters['*'];
        } else {
            return undefined;
        }
    }

    protected onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        return  next();
    }
}