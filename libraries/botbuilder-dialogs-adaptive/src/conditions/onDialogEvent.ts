/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogEvent } from 'botbuilder-dialogs';
import { SequenceContext, ActionChangeList, ActionChangeType, ActionState } from '../sequenceContext';
import { OnCondition } from './onCondition';

/**
 * This rule is triggered when a dialog event matching a list of event names is emitted.
 */
export class OnDialogEvent implements OnCondition {
    // If `true`, the rule should be triggered on the leading edge of the event. 
    public readonly preBubble: boolean;

    /**
     * List of events to filter to.
     */
    public readonly events: string[];

    /**
     * List of actions to update the plan with when triggered.
     */
    public readonly actions: Dialog[];

    /**
     * Creates a new `OnDialogEvent` instance.
     * @param events (Optional) list of events to filter to.
     * @param actions (Optional) list of actions to update the plan with when triggered.
     * @param preBubble (Optional) flag controlling whether the rule triggers on the leading or trailing edge of the event. Defaults to a value of `true`.
     */
    constructor(events?: string|string[], actions?: Dialog[], preBubble?: boolean) {
        this.events = Array.isArray(events) ? events : (events !== undefined ? [events] : []);
        this.actions = actions || [];
        this.preBubble = preBubble !== undefined ? preBubble : true;
    }

    public evaluate(sequence: SequenceContext, event: DialogEvent, preBubble: boolean): Promise<ActionChangeList[]|undefined> {
        // Limit evaluation to only supported events
        if (preBubble == this.preBubble && this.events.indexOf(event.name) >= 0) {
            return this.onEvaluate(sequence, event);
        } else {
            return undefined;
        }
    }

    protected async onEvaluate(sequence: SequenceContext, event: DialogEvent): Promise<ActionChangeList[]|undefined> {
        if (await this.onIsTriggered(sequence, event)) {
            return [this.onCreateChangeList(sequence, event)];
        }
    }

    protected async onIsTriggered(sequence: SequenceContext, event: DialogEvent): Promise<boolean> {
        return true;
    }

    protected onCreateChangeList(sequence: SequenceContext, event: DialogEvent, dialogOptions?: any): ActionChangeList {
        const changeList: ActionChangeList = { changeType: ActionChangeType.insertActions, actions: [] };
        this.actions.forEach((action) => {
            const actionState: ActionState = { dialogStack: [], dialogId: action.id };
            if (dialogOptions !== undefined) {
                actionState.options = dialogOptions;
            }
            changeList.actions.push(actionState);
        });

        return changeList;
    }
}