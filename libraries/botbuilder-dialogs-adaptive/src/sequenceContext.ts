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
    steps?: StepState[];
}

export interface StepState extends DialogState {
    dialogId: string;
    options?: object;
}

export interface StepChangeList {
    changeType: StepChangeType;
    steps?: StepState[];
    tags?: string[];
}

export enum StepChangeType {
    insertSteps = 'insertSteps',
    insertStepsBeforeTags = 'insertStepsBeforeTags',
    appendSteps = 'appendSteps',
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
    constructor(dialogs: DialogSet, dc: DialogContext, state: DialogState, steps: StepState[], changeKey: symbol) {
        super(dialogs, dc.context, state, dc.state.user, dc.state.conversation);
        this.steps = steps;
        this.changeKey = changeKey;
    }

    /**
     * Array of changes that are queued to be applied 
     */
    public get changes(): StepChangeList[] {
        return this.context.turnState.get(this.changeKey) || [];
    }

    /**
     * Array of steps being executed.
     */
    public readonly steps: StepState[];

    /**
     * Queues up a set of changes that will be applied when [applyChanges()](#applychanges)
     * is called.
     * @param changes Step changes to queue up. 
     */
    public queueChanges(changes: StepChangeList): void {
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
        const queue: StepChangeList[] = this.context.turnState.get(this.changeKey) || [];
        if (Array.isArray(queue) && queue.length > 0) {
            this.context.turnState.delete(this.changeKey);

            // Apply each queued set of changes
            for (let i = 0; i < queue.length; i++) {

                // Apply plan changes
                const change = queue[i];
                switch (change.changeType) {
                    case StepChangeType.insertSteps:
                    case StepChangeType.insertStepsBeforeTags:
                    case StepChangeType.appendSteps:
                        await this.updateSequence(change);
                        break;
                    case StepChangeType.endSequence:
                        if (this.steps.length > 0) {
                            this.steps.splice(0, this.steps.length);
                            await this.emitEvent(AdaptiveEventNames.sequenceEnded, undefined, false);
                        }
                        break;
                    case StepChangeType.replaceSequence:
                        if (this.steps.length > 0) {
                            this.steps.splice(0, this.steps.length);
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

    public insertSteps(steps: StepState[]): this {
        this.queueChanges({ changeType: StepChangeType.insertSteps, steps: steps });
        return this;
    }

    public insertStepsBeforeTags(tags: string[], steps: StepState[]): this {
        this.queueChanges({ changeType: StepChangeType.insertStepsBeforeTags, steps: steps, tags: tags });
        return this;
    }

    public appendSteps(steps: StepState[]): this {
        this.queueChanges({ changeType: StepChangeType.appendSteps, steps: steps });
        return this;
    }

    public endSequence(): this {
        this.queueChanges({ changeType: StepChangeType.endSequence });
        return this;
    }

    public replaceSequence(steps: StepState[]): this {
        this.queueChanges({ changeType: StepChangeType.replaceSequence, steps: steps });
        return this;
    }

    private async updateSequence(change: StepChangeList): Promise<void> {
        // Initialize sequence if needed
        const newSequence = this.steps.length == 0;

        // Update sequence
        switch (change.changeType) {
            case StepChangeType.insertSteps:
                Array.prototype.unshift.apply(this.steps, change.steps);
                break;
            case StepChangeType.insertStepsBeforeTags:
                let inserted = false;
                if (Array.isArray(change.tags)) {
                    // Walk list of steps to find point at which to insert new steps
                    for (let i = 0; i < this.steps.length; i++) {
                        // Does step have one of the tags we're looking for?
                        if (this.stepHasTags(this.steps[i], change.tags)) {
                            // Insert steps before the current step.
                            const args = ([i, 0] as any[]).concat(change.steps);
                            Array.prototype.splice.apply(this.steps, args);
                            inserted = true;
                            break;
                        }
                    }
                }
                
                // If we didn't find any of the tags we were looking for then just append
                // the steps to the end of the current sequence.
                if (!inserted) {
                    Array.prototype.push.apply(this.steps, change.steps);
                }
                break;
            case StepChangeType.appendSteps:
                Array.prototype.push.apply(this.steps, change.steps);
                break;
        }

        // Emit sequenceStarted event
        if (newSequence) {
            await this.emitEvent(AdaptiveEventNames.sequenceStarted, undefined, false);
        }
    }

    private stepHasTags(step: StepState, tags: string[]): boolean {
        const dialog = this.findDialog(step.dialogId);
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
