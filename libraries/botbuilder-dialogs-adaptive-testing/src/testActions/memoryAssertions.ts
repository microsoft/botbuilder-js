/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from 'adaptive-expressions';
import { TestAdapter, TurnContext } from 'botbuilder-core';
import { Inspector, TestAction } from '../testAction';

export interface MemoryAssertionsConfiguration {
    description?: string;
    assertions?: string[];
}

/**
 * Run assertions against memory.
 */
export class MemoryAssertions extends TestAction implements MemoryAssertionsConfiguration {
    static $kind = 'Microsoft.Test.MemoryAssertions';

    /**
     * Gets or sets the description of this assertion.
     */
    description: string;

    /**
     * Gets or sets the assertions.
     */
    assertions: string[] = [];

    /**
     * Execute the test.
     * @param testAdapter Adapter to execute against.
     * @param callback Logic for the bot to use.
     * @param inspector Inspector for dialog context.
     * @returns A Promise that represents the work queued to execute.
     */
    async execute(
        adapter: TestAdapter,
        callback: (context: TurnContext) => Promise<void>,
        inspector?: Inspector
    ): Promise<void> {
        if (inspector) {
            await inspector((dc) => {
                this.assertions.forEach((assertion) => {
                    const { value, error } = Expression.parse(assertion).tryEvaluate(dc.state);
                    if (error || !value) {
                        throw new Error(`${this.description} ${assertion} failed`);
                    }
                });
            });
        }
    }
}
