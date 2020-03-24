/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext, DialogState, DialogSet, DialogInstance } from 'botbuilder-dialogs';

export interface AdaptiveDialogState<O extends Object> {
    actions?: ActionState[];
}

export interface ActionState extends DialogState {
    dialogId: string;
    options?: object;
}

export interface ActionChangeList {
    /**
     * Type of change being made.
     */
    changeType: ActionChangeType;

    /**
     * Ordered list of actions for change.
     */
    actions?: ActionState[];

    /**
     * Turn state associated with the change.
     * @remarks
     * The current turn state will be update when the plan change is applied.
     */
    turn?: { [key: string]: string };
}

export enum ActionChangeType {
    /**
     * Add the change actions to the head of the sequence.
     */
    insertActions = 'insertActions',

    /**
     * Add the change actions to the tail of the sequence.
     */
    appendActions = 'appendActions',

    /**
     * Terminate the action sequence.
     */
    endSequence = 'endSequence',

    /**
     * Terminate the action sequence, then add the change actions.
     */
    replaceSequence = 'replaceSequence'
}

export enum AdaptiveEvents {
    /**
     * Raised when a dialog is started.
     */
    beginDialog = 'beginDialog',

    /**
     * Raised when a dialog has been asked to re-prompt.
     */
    repromptDialog = 'repromptDialog',

    /**
     * Raised when a dialog is being canceled.
     */
    cancelDialog = 'cancelDialog',

    /**
     * Raised when an new activity has been received.
     */
    activityReceived = 'activityReceived',

    /**
     * Raised when an error has occurred.
     */
    error = 'error',

    /**
     * Raised when utterance is received.
     */
    recognizeUtterance = 'recognizeUtterance',

    /**
     * Raised when intent is recognized from utterance.
     */
    recognizedIntent = 'recognizedIntent',

    /**
     * Raised when no intent can be recognized from utterance.
     */
    unknownIntent = 'unknownIntent',

    /**
     * Raised when all actions and ambiguity events have been finished.
     */
    endOfActions = 'endOfActions',

    /**
     * aised when there are multiple possible entity to property mappings.
     */
    chooseProperty = 'chooseProperty',

    /**
     * Raised when there are multiple possible resolutions of an entity.
     */
    chooseEntity = 'chooseEntity',

    /**
     * Raised when a property should be cleared.
     */
    clearProperty = 'clearProperty',

    /**
     * Raised when an entity should be assigned to a property.
     */
    assignEntity = 'assignEntity'
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
            // Clear current change list
            this.context.turnState.delete(this._changeKey);

            // Apply each queued set of changes
            for (let i = 0; i < queue.length; i++) {
                const change = queue[i];

                // Apply memory changes for turn
                if (change.turn) {
                    for (const key in change.turn) {
                        if (change.turn.hasOwnProperty(key)) {
                            this.state.setValue(`turn.${key}`, change.turn[key]);
                        }
                    }
                }

                // Apply plan changes
                switch (change.changeType) {
                    case ActionChangeType.insertActions:
                    case ActionChangeType.appendActions:
                        await this.updateSequence(change);
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
        // Update sequence
        switch (change.changeType) {
            case ActionChangeType.insertActions:
                Array.prototype.unshift.apply(this.actions, change.actions);
                break;
            case ActionChangeType.appendActions:
            case ActionChangeType.replaceSequence:
                Array.prototype.push.apply(this.actions, change.actions);
                break;
        }
    }
}
