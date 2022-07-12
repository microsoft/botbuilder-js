/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext, TestAdapter } from 'botbuilder-core';
import { Configurable } from 'botbuilder-dialogs';
import { DialogContextInspector } from './dialogInspector';

/**
 * Allow inspecting/modifying the current dialog context.
 */
export type Inspector = (inspector: DialogContextInspector) => Promise<void>;

/**
 * Abstract base class for scripted actions.
 */
export abstract class TestAction extends Configurable {
    abstract execute(
        adapter: TestAdapter,
        callback: (context: TurnContext) => Promise<void>,
        inspector?: Inspector
    ): void;
}
