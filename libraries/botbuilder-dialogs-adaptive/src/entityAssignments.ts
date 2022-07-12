/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ActionContext } from './actionContext';
import { EntityAssignment } from './entityAssignment';

const events = 'this.events';

export interface EntityAssignmentsConfiguration {
    assignments: EntityAssignment[];
}

/**
 * Tracks entity related events to surface.
 *
 * @remarks When processing entities possible ambiguities are identified and when resolved they turn into assign events.
 * This tracking persists across multiple input utterances.
 */
export class EntityAssignments implements EntityAssignmentsConfiguration {
    /**
     * Initializes a new instance of the [EntityAssignments](xref:botbuilder-dialogs-adaptive.EntityAssignments) class.
     *
     * @param assignments A list of [EntityAssignments](xref:botbuilder-dialogs-adaptive.EntityAssignments) to use.
     */
    constructor(public assignments: EntityAssignment[] = []) {}

    /**
     * Read entity event queue from memory.
     *
     * @param actionContext Memory context.
     * @returns Entity event queue.
     */
    static read(actionContext: ActionContext): EntityAssignments {
        const queuesObject = actionContext.state.getValue(events, new EntityAssignments());

        const assignments = queuesObject.assignments?.map((assignment) => new EntityAssignment(assignment));

        return new EntityAssignments(assignments);
    }

    /**
     * Write state into memory.
     *
     * @param actionContext Memory context.
     */
    write(actionContext: ActionContext): void {
        actionContext.state.setValue(events, this);
    }

    /**
     * Gets the next entity event to surface.
     *
     * @returns The next entity event to surface.
     */
    get nextAssignment(): EntityAssignment {
        if (this.assignments.length > 0) {
            return this.assignments[0];
        }

        return undefined;
    }

    /**
     * Remove the current event and update the memory.
     *
     * @param actionContext Memory context.
     * @returns Removed event.
     */
    dequeue(actionContext: ActionContext): EntityAssignment {
        const assignment = this.assignments.shift();
        this.write(actionContext);

        return assignment;
    }
}
