/**
 * @module botbuilder-m365
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext } from "botbuilder-core";
import { TurnState } from "./TurnState";

export interface ConversationHistoryTurn {
    user: string;
    bot: string;
}

export interface ConversationHistoryOptions {
    maxTurns: number;
    maxCharacterLength: number;
    userPrefix: string;
    botPrefix: string;
}

export class ConversationHistoryTracker {
    public static updateHistory(context: TurnContext, state: TurnState, response?: string, options?: Partial<ConversationHistoryOptions>): void {
        const o = this.getOptions(options);

        // Append turn to history
        const turn = { user: context.activity.text ?? '', bot: response ?? '' };
        let history = state.conversation.value.history as ConversationHistoryTurn[];
        if (Array.isArray(history)) {
            history.push(turn);
        } else {
            history = [turn];
        }

        // Constrain history to max turns
        if (o.maxTurns > 0 && history.length > o.maxTurns) {
            history = history.slice(history.length - o.maxTurns);
        }

        // Save to conversation state
        state.conversation.value.history = history;
    }

    public static getHistoryAsText(context: TurnContext, state: TurnState, options?: Partial<ConversationHistoryOptions>): string {
        let text = '';
        const o = this.getOptions(options);
        const history = state.conversation.value.history as ConversationHistoryTurn[];
        if (Array.isArray(history)) {
            for (let i = history.length - 1; i >= 0; i--) {
                // Create text pair
                const pair = `${o.userPrefix}${history[i].user}\n${o.botPrefix}${history[i].bot}\n`;
                
                // Enforce max character length
                if (o.maxCharacterLength > 0 && (pair.length + text.length) > o.maxCharacterLength) {
                    break;
                }

                // Prepend text pair
                text = pair + text;
            }
        }

        return text;
    }

    public static getOptions(options?: Partial<ConversationHistoryOptions>): ConversationHistoryOptions {
        return Object.assign({
            maxTurns: 10,
            maxCharacterLength: 4000,
            userPrefix: 'Human: ',
            botPrefix: 'AI: '
        } as ConversationHistoryOptions, options);
    }
}