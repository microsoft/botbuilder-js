/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext, TestAdapter } from 'botbuilder-core';

export interface TestAction {
    execute(adapter: TestAdapter, callback: (context: TurnContext) => Promise<any>);
}