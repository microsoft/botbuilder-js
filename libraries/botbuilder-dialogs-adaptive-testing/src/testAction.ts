/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext } from 'botbuilder-core';
import { AdaptiveTestAdapter } from './adaptiveTestAdapter';

export interface TestAction {
    execute(adapter: AdaptiveTestAdapter, callback: (context: TurnContext) => Promise<any>);
}