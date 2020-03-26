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

export class ActionContext extends DialogContext {
    private readonly _changeKey: symbol;

    public constructor(dialogs: DialogSet, parentDialogContext: DialogContext, state: DialogState, actions: ActionState[], changeKey: symbol) {
        super(dialogs, parentDialogContext.context, state);
        this.actions = actions;
        this._changeKey = changeKey;
    }

    public actions: ActionState[];

    public get changes(): ActionChangeList[] {
        return this.context.turnState.get(this._changeKey) || [];
    }

    public queueChanges(changes: ActionChangeList): void {
        const queue = this.changes;
        queue.push(changes);
        this.context.turnState.set(this._changeKey, queue);
    }

    public async applyChanges(): Promise<boolean> {
        const changes = this.changes;
        if (changes.length > 0) {
            this.context.turnState.delete(this._changeKey);

            for (let i = 0; i < changes.length; i++) {
                const change = changes[i];
                if (change.turn) {
                    for (const key in change.turn) {
                        this.state.setValue(`turn.${ key }`, change.turn[key]);
                    }
                }

                switch(change.changeType) {
                    case ActionChangeType.insertActions:
                        this.actions.unshift(...change.actions);
                        break;
                    case ActionChangeType.appendActions:
                        this.actions.push(...change.actions);
                        break;
                    case ActionChangeType.endSequence:
                        this.actions = [];
                        break;
                    case ActionChangeType.replaceSequence:
                        this.actions = [];
                        this.actions.push(...change.actions);
                        break;
                }
            }

            await this.applyChanges();
            return true;
        }
        return false;
    }
}
