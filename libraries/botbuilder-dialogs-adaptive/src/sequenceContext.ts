/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext, DialogState, DialogSet } from 'botbuilder-dialogs';

export interface AdaptiveDialogState<O extends Object> {
    options: O;
    result?: any;
    actions?: ActionState[];
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
    insertActionsBeforeTags = 'insertActionsBeforeTags',
    appendActions = 'appendActions',
    endSequence = 'endSequence',
    replaceSequence = 'replaceSequence'
}

export enum AdaptiveEventNames {
    beginDialog = 'beginDialog',
    activityReceived = 'activityReceived',
    recognizedIntent = 'recognizedIntent',
    unknownIntent = 'unknownIntent',
    conversationMembersAdded = 'conversationMembersAdded',
    sequenceStarted = 'sequenceStarted',
    sequenceEnded = 'sequenceEnded',
    cancelDialog = 'cancelDialog'
}

export class SequenceContext<O extends object = {}> extends DialogContext {
    private readonly changeKey: symbol;

    /**
     * Creates a new `SequenceContext` instance.
     */
    constructor(dialogs: DialogSet, dc: DialogContext, state: DialogState, actions: ActionState[], changeKey: symbol) {
        super(dialogs, dc.context, state, dc.state.user, dc.state.conversation);
        this.actions = actions;
        this.changeKey = changeKey;
    }

    /**
     * Array of changes that are queued to be applied
     */
    public get changes(): ActionChangeList[] {
        return this.context.turnState.get(this.changeKey) || [];
    }

    /**
     * Array of actions being executed.
     */
    public readonly actions: ActionState[];

    /**
     * Queues up a set of changes that will be applied when [applyChanges()](#applychanges)
     * is called.
     * @param changes Action changes to queue up.
     */
    public queueChanges(changes: ActionChangeList): void {
        const queue = this.context.turnState.get(this.changeKey) || [];
        queue.push(changes);
        this.context.turnState.set(this.changeKey, queue);
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
        const queue: ActionChangeList[] = this.context.turnState.get(this.changeKey) || [];
        if (Array.isArray(queue) && queue.length > 0) {
            this.context.turnState.delete(this.changeKey);

            // Apply each queued set of changes
            for (let i = 0; i < queue.length; i++) {

                // Apply plan changes
                const change = queue[i];
                switch (change.changeType) {
                    case ActionChangeType.insertActions:
                    case ActionChangeType.insertActionsBeforeTags:
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

    public insertActionsBeforeTags(tags: string[], actions: ActionState[]): this {
        this.queueChanges({ changeType: ActionChangeType.insertActionsBeforeTags, actions: actions, tags: tags });
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
            case ActionChangeType.insertActionsBeforeTags:
                let inserted = false;
                if (Array.isArray(change.tags)) {
                    // Walk list of actions to find point at which to insert new actions
                    for (let i = 0; i < this.actions.length; i++) {
                        // Does action have one of the tags we're looking for?
                        if (this.actionHasTags(this.actions[i], change.tags)) {
                            // Insert actions before the current action.
                            const args = ([i, 0] as any[]).concat(change.actions);
                            Array.prototype.splice.apply(this.actions, args);
                            inserted = true;
                            break;
                        }
                    }
                }

                // If we didn't find any of the tags we were looking for then just append
                // the actions to the end of the current sequence.
                if (!inserted) {
                    Array.prototype.push.apply(this.actions, change.actions);
                }
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

    private actionHasTags(action: ActionState, tags: string[]): boolean {
        const dialog = this.findDialog(action.dialogId);
        if (dialog && dialog.tags.length > 0) {
            for (let i = 0; i < dialog.tags.length; i++) {
                if (tags.indexOf(dialog.tags[i]) >= 0) {
                    return true;
                }
            }
        }

        return false;
    }
}
