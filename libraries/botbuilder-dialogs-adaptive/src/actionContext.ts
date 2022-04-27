/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogContext, DialogSet, DialogState } from 'botbuilder-dialogs';
import { ActionState } from './actionState';
import { ActionChangeList } from './actionChangeList';
import { ActionChangeType } from './actionChangeType';

/**
 * Extends the [DialogContext](xref:botbuilder-dialogs.DialogContext) with additional methods for manipulating the
 * executing sequence of actions for an [AdaptiveDialog](xref:botbuilder-dialogs-adaptive.AdaptiveDialog).
 */
export class ActionContext extends DialogContext {
    private readonly _changeKey: symbol;

    /**
     * Initializes a new instance of the [ActionContext](xref:botbuilder-dialogs-adaptive.ActionContext) class
     *
     * @param dialogs The dialog set to create the action context for.
     * @param parentDialogContext Parent dialog context.
     * @param state Current dialog state.
     * @param actions Current list of remaining actions to execute.
     * @param changeKey TurnState key for where to persist any changes.
     */
    constructor(
        dialogs: DialogSet,
        parentDialogContext: DialogContext,
        state: DialogState,
        actions: ActionState[],
        changeKey: symbol
    ) {
        super(dialogs, parentDialogContext, state);
        this.actions = actions;
        this._changeKey = changeKey;
    }

    /**
     * List of actions being executed.
     */
    actions: ActionState[];

    /**
     * Gets list of changes that are queued to be applied.
     *
     * @returns The list of changes queued.
     */
    get changes(): ActionChangeList[] {
        return this.context.turnState.get(this._changeKey) || [];
    }

    /**
     * Queues up a set of changes that will be applied when applyChanges() is called.
     *
     * @param changes Plan changes to queue up.
     */
    queueChanges(changes: ActionChangeList): void {
        const queue = this.changes;
        queue.push(changes);
        this.context.turnState.set(this._changeKey, queue);
    }

    /**
     * Applies any queued up changes.
     *
     * @returns True if there were any changes to apply.
     */
    async applyChanges(): Promise<boolean> {
        // Retrieve queued change list
        const changes = this.changes;
        if (changes.length > 0) {
            // Clear current change list
            this.context.turnState.delete(this._changeKey);

            // Apply each queued set of changes
            for (let i = 0; i < changes.length; i++) {
                const change = changes[i];
                // Apply memory changes to turn state
                if (change.turn) {
                    for (const key in change.turn) {
                        this.state.setValue(`turn.${key}`, change.turn[key]);
                    }
                }

                // Update sequence
                switch (change.changeType) {
                    case ActionChangeType.insertActions:
                        this.actions.unshift(...change.actions);
                        break;
                    case ActionChangeType.appendActions:
                        this.actions.push(...change.actions);
                        break;
                    case ActionChangeType.endSequence:
                        if (this.actions.length > 0) {
                            this.actions.splice(0, this.actions.length);
                        }
                        break;
                    case ActionChangeType.replaceSequence:
                        if (this.actions.length > 0) {
                            this.actions.splice(0, this.actions.length);
                        }
                        this.actions.push(...change.actions);
                        break;
                }
            }

            // Apply any queued up changes
            await this.applyChanges();
            return true;
        }
        return false;
    }
}
