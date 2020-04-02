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
            // Surround in a try/catch so that if container creation fails, it can retry and succeed later.
            try {
                this.task[dbAndContainerKey] = fn();
            } catch (err) {
                console.error(err);
            }
        }

        return this.task[dbAndContainerKey];
    }
}