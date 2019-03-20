/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { EventRule } from './eventRule';
import { RuleDialogEventNames, PlanChangeType, PlanningContext } from '../planningContext';
import { Dialog, DialogEvent } from 'botbuilder-dialogs';
import { ActivityTypes } from 'botbuilder-core';

const WELCOMED_PROPERTY = 'conversation.welcomed';

/**
 * This rule is triggered when a conversation is first started with a user.
 */
export class WelcomeRule extends EventRule {

    /**
     * Name of the in-memory state property set to remember that the user has been welcomed.
     */
    public welcomedProperty: string;

    /**
     * Creates a new `WelcomeRule` instance.
     * @param steps List of steps to prepend the plan with when triggered.
     * @param conversationProperty (Optional) of the in-memory state property set to remember that the user has been welcomed. Defaults to 'conversation.welcomed'.
     */
    constructor();
    constructor(steps: Dialog[], conversationProperty?: string);
    constructor(steps?: Dialog[], welcomedProperty = WELCOMED_PROPERTY) {
        super([RuleDialogEventNames.activityReceived, RuleDialogEventNames.unhandledUtterance, RuleDialogEventNames.planStarted], steps, PlanChangeType.doSteps);
        this.welcomedProperty = welcomedProperty;
    }

    protected async onIsTriggered(planning: PlanningContext, event: DialogEvent, memory: object): Promise<boolean> {
        switch (event.name) {
            case RuleDialogEventNames.activityReceived:
                return this.handleActivityReceived(planning);
            case RuleDialogEventNames.unhandledUtterance:
            case RuleDialogEventNames.planStarted:
                return this.handlePlanStarted(planning);
        }

        return false;
    }

    private handleActivityReceived(planning: PlanningContext): boolean {
        // Filter to only ConversationUpdate activities
        const activity = planning.context.activity;
        if (activity.type === ActivityTypes.ConversationUpdate && Array.isArray(activity.membersAdded)) {
            // Have we already welcomed the user?
            if (!planning.state.getValue(this.welcomedProperty)) {
                // Ensure a user is being added
                let userAdded = false;
                activity.membersAdded.forEach((member) => {
                    if (member.id !== activity.recipient.id) {
                        userAdded = true;
                    }
                });

                // Trigger only if user added
                if (userAdded) {
                    planning.state.setValue(this.welcomedProperty, true); // BUGBUG: needs to be deferred
                    return true;
                }
            }
        }

        return false;
    }

    private handlePlanStarted(planning: PlanningContext): boolean {
        // Have we already welcomed the user?
        if (!planning.state.getValue(this.welcomedProperty)) {
            // Trigger the greeting
            planning.state.setValue(this.welcomedProperty, true); // BUGBUG: needs to be deferred
            return true;
        } else {
            return false;
        }
    }
}
