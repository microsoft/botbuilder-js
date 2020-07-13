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

export class EntityAssignments {
    /**
     * Queue of entity assignments.
     */
    public assignments: Partial<EntityAssignment>[] = [];

    /**
     * Read entity event queue from memory.
     * @param actionContext Memory context.
     */
    public static read(actionContext: ActionContext): EntityAssignments {
        let queues: EntityAssignments = actionContext.state.getValue(events);
        if (!queues) {
            queues = new EntityAssignments();
        }

        return queues;
    }

    /**
     * Write state into memory.
     * @param actionContext Memory context.
     */
    public write(actionContext: ActionContext): void {
        actionContext.state.setValue(events, this);
    }

    /**
     * Returns the next entity event to surface.
     */
    public nextAssignment(): Partial<EntityAssignment> {
        if (this.assignments.length > 0) {
            return this.assignments[0];
        }

        return undefined;
    }

    /**
     * Remove the current event and update the memory.
     * @param actionContext Memory context.
     */
    public dequeue(actionContext: ActionContext): Partial<EntityAssignment> {
        const assignment = this.assignments.shift();
        this.write(actionContext);

        return assignment;
    }
}