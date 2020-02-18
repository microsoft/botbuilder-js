/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class DoOnce<T> {
    private task: Promise<T>;

    public waitFor(fn: () => Promise<T>): Promise<T> {
        if (!this.task) {
            this.task = fn();
        }

        return this.task;
    }
}