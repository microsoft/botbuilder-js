/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TestAdapter, TurnContext } from 'botbuilder-core';
import { Inspector, TestAction } from '../testAction';
import { TestTelemetryClient } from '../testTelemetryClient';

export interface AssertTelemetryContainsConfiguration {
    description?: string;
    events?: string[];
}

/**
 * Run assertions against telemetry events.
 */
export class AssertTelemetryContains extends TestAction implements AssertTelemetryContainsConfiguration {
    static $kind = 'Microsoft.Test.AssertTelemetryContains';

    /**
     * Gets or sets the description of this assertions.
     */
    description: string;

    /**
     * Gets or sets the events name should be included.
     */
    events: string[] = [];

    /**
     * Execute the test.
     *
     * @param _adapter Adapter to execute against.
     * @param _callback Logic for the bot to use.
     * @param inspector Inspector for dialog context.
     * @returns A Promise that represents the work queued to execute.
     */
    async execute(
        _adapter: TestAdapter,
        _callback: (context: TurnContext) => Promise<void>,
        inspector?: Inspector
    ): Promise<void> {
        if (inspector) {
            await inspector((dc) => {
                const telemetryClient = dc.context.turnState.get('telemetryClient') as TestTelemetryClient;
                let flag = true;

                const invocations = telemetryClient.invocations;
                for (const event of this.events) {
                    if (!invocations.includes(event)) {
                        flag = false;
                    }
                }

                if (!flag) {
                    throw new Error(`${this.description} ${this.events.join(', ')} AssertTelemetryContains failed`);
                }

                return Promise.resolve(flag);
            });
        }
    }
}
