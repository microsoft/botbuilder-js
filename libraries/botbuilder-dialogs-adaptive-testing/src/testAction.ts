/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext, TestAdapter } from 'botbuilder-core';
import { Configurable } from 'botbuilder-dialogs';

export abstract class TestAction extends Configurable {
    public abstract execute(adapter: TestAdapter, callback: (context: TurnContext) => Promise<void>): void;
}
