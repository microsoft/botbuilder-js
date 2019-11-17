/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ResourceResponse } from 'botbuilder-core';

export class ActivityStore {
    private readonly queue: Partial<Activity>[] = [];

    public deliveryDelay: number = 5;

    public get length(): number {
        return this.queue.length;
    }

    public async queueActivity(activity: Partial<Activity>, delayDelivery: boolean = true): Promise<ResourceResponse> {
        // Simulate network latency
        if (delayDelivery) {
            await delay(this.deliveryDelay);
        }

        // Clone activity and assign unique ID
        const clone: Partial<Activity> = JSON.parse(JSON.stringify(activity));
        clone.id = (nextId++).toString();
        
        // Queue activity and return resource response
        this.queue.push(clone);
        return { id: clone.id };
    }

    public dequeueActivity(): Partial<Activity>|undefined {
        return this.queue.length > 0 ? this.queue.shift() : undefined;
    }
}

let nextId: number = 1;

function delay(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), timeout);
    });
}