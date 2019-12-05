/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AdaptiveTestAdapter } from "./adaptiveTestAdapter";
import { TurnContext } from "botbuilder-core";

export interface TestAction {
    execute(adapter: AdaptiveTestAdapter, callback: (context: TurnContext) => Promise<any>);
}