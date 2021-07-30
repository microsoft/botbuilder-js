// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TurnContext } from './turnContext';

/**
 * Represents a bot that can operate on incoming activities.
 *
 * @interface
 */
export interface Bot {
    /**
     * When implemented in a bot, handles an incoming activity.
     *
     * @param context The context object for this turn.
     * @returns a promise representing the async operation.
     *
     * @remarks
     * The `context` provides information about the incoming activity,
     * and other data needed to process the activity.
     */
    onTurn(context: TurnContext): Promise<void>;
}
