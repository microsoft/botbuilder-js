/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class DoOnce<T> {
    private task: {
        [dbAndContainerKey: string]: Promise<T>;
    } = {};

    public waitFor(dbAndContainerKey: string, fn: () => Promise<T>): Promise<T> {
        if (!this.task[dbAndContainerKey]) {
            this.task[dbAndContainerKey] = fn();
        }

        return this.task[dbAndContainerKey];
    }
}