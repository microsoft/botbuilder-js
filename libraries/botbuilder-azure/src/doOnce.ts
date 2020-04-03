/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class DoOnce<T> {
    private task: {
        [key: string]: Promise<T>;
    } = {};

    public waitFor(key: string, fn: () => Promise<T>): Promise<T> {
        if (!this.task[key]) {
            this.task[key] = fn();
        }

        return this.task[key];
    }
}