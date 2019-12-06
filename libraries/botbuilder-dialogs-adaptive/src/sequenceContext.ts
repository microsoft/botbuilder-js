/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext, DialogState, DialogSet, DialogInstance } from 'botbuilder-dialogs';

export interface AdaptiveDialogState<O extends Object> {
    options: O;
    _adaptive: {
        actions?: ActionState[];
    };
    result?: any;
}

export interface ActionState extends DialogState {
    dialogId: string;
    options?: object;
}

export interface ActionChangeList {
    changeType: ActionChangeType;
    actions?: ActionState[];
    tags?: string[];
}

export enum ActionChangeType {
    insertActions = 'insertActions',
    appendActions = 'appendActions',
    endSequence = 'endSequence',
    replaceSequence = 'replaceSequence'
}

export enum AdaptiveEventNames {
    beginDialog = 'beginDialog',
    repromptDialog = 'repromptDialog',
    cancelDialog = 'cancelDialog',
    activityReceived = 'activityReceived',
    error = 'error',
    recognizeUtterance = 'recognizeUtterance',
    recognizedIntent = 'recognizedIntent',
    unknownIntent = 'unknownIntent',
    conversationMembersAdded = 'conversationMembersAdded',
    sequenceStarted = 'sequenceStarted',
    sequenceEnded = 'sequenceEnded'
}

export class SequenceContext<O extends object = {}> extends DialogContext {
    private _actions: ActionState[];
    private _changeKey: symbol;

    /**
     * Clones an existing `DialogContext` instance into being a `SequenceContext`.
     */
    static clone(dc: DialogContext, actions: ActionState[], changeKey: symbol): SequenceContext {
        const context = new SequenceContext(dc);
        context._actions = actions;
        context._changeKey = changeKey;
        return context;
    }

    /**
     * Creates a new `SequenceContext` instance for a child action.
     */
    static create(parent: DialogContext, dialogs: DialogSet, stack: DialogInstance<any>[], actions: ActionState[], changeKey: symbol): SequenceContext {
        const context = new SequenceContext(dialogs, parent.context, { dialogStack: stack });
        context._actions = actions;
        context._changeKey = changeKey;
        context.parent = parent;
        return context;
    }

    /**
     * Array of changes that are queued to be applied
     */
    public get changes(): ActionChangeList[] {
        return this.context.turnState.get(this._changeKey) || [];
    }

    /**
     * Array of actions being executed.
     */
    public get actions(): ActionState[] {
        return this._actions;
    }

    /**
     * Queues up a set of changes that will be applied when [applyChanges()](#applychanges)
     * is called.
     * @param changes Action changes to queue up.
     */
    public queueChanges(changes: ActionChangeList): void {
        const queue = this.context.turnState.get(this._changeKey) || [];
        queue.push(changes);
        this.context.turnState.set(this._changeKey, queue);
    }

    /**
     * Applies any queued up changes.
     *
     * @remarks
     * Applying a set of changes can result in additional plan changes being queued. The method
     * will loop and apply any additional plan changes until there are no more changes left to
     * apply.
     * @returns true if there were any changes to apply.
     */
    public async applyChanges(): Promise<boolean> {
        const queue: ActionChangeList[] = this.context.turnState.get(this._changeKey) || [];
        if (Array.isArray(queue) && queue.length > 0) {
            this.context.turnState.delete(this._changeKey);

            // Apply each queued set of changes
            for (let i = 0; i < queue.length; i++) {

                // Apply plan changes
                const change = queue[i];
                switch (change.changeType) {
                    case ActionChangeType.insertActions:
                    case ActionChangeType.appendActions:
                        await this.updateSequence(change);
                        break;
                    case ActionChangeType.endSequence:
                        if (this.actions.length > 0) {
                            this.actions.splice(0, this.actions.length);
                            await this.emitEvent(AdaptiveEventNames.sequenceEnded, undefined, false);
                        }
                        break;
                    case ActionChangeType.replaceSequence:
                        if (this.actions.length > 0) {
                            this.actions.splice(0, this.actions.length);
                        }
                        await this.updateSequence(change);
                        break;
                }
            }

            // Apply any new queued up changes
            await this.applyChanges();
            return true;
        }

        return false;
    }

    public insertActions(actions: ActionState[]): this {
        this.queueChanges({ changeType: ActionChangeType.insertActions, actions: actions });
        return this;
    }

    public appendActions(actions: ActionState[]): this {
        this.queueChanges({ changeType: ActionChangeType.appendActions, actions: actions });
        return this;
    }

    public endSequence(): this {
        this.queueChanges({ changeType: ActionChangeType.endSequence });
        return this;
    }

    public replaceSequence(actions: ActionState[]): this {
        this.queueChanges({ changeType: ActionChangeType.replaceSequence, actions: actions });
        return this;
    }

    private async updateSequence(change: ActionChangeList): Promise<void> {
        // Initialize sequence if needed
        const newSequence = this.actions.length == 0;

        // Update sequence
        switch (change.changeType) {
            case ActionChangeType.insertActions:
                Array.prototype.unshift.apply(this.actions, change.actions);
                break;
            case ActionChangeType.appendActions:
                Array.prototype.push.apply(this.actions, change.actions);
                break;
        }

        // Emit sequenceStarted event
        if (newSequence) {
            await this.emitEvent(AdaptiveEventNames.sequenceStarted, undefined, false);
        }
    }
}
