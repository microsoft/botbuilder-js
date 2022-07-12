/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AdaptiveEvents } from './adaptiveEvents';
import { EntityAssignment } from './entityAssignment';

/**
 * Compare two entity assignments to determine their relative priority.
 *
 * @remarks
 * Compare by event: assignEntity, chooseProperty, chooseEntity
 * Then by operations in order from schema (usually within assignEntity).
 * Then by unexpected before expected.
 * Then by oldest turn first.
 * Then by minimum position in utterance.
 */
export class EntityAssignmentComparer {
    private static eventPreference = [
        AdaptiveEvents.assignEntity,
        AdaptiveEvents.chooseProperty,
        AdaptiveEvents.chooseEntity,
    ];

    /**
     * Initializes a new instance of the [EntityAssignmentComparer](xref:botbuilder-dialogs-adaptive.EntityAssignmentComparer) class.
     *
     * @param operationPreference Preference on operations.
     */
    constructor(private operationPreference: string[]) {}

    /**
     * Compares [EntityAssignment](xref:botbuilder-dialogs-adaptive.EntityAssignment) x against y to determine its relative priority.
     *
     * @param x First entity assigment to compare.
     * @param y Second entity assigment to compare.
     * @returns Numerical value representing x's relative priority.
     */
    compare(x: Partial<EntityAssignment>, y: Partial<EntityAssignment>): number {
        // Order by event.
        let comparison: number =
            EntityAssignmentComparer.eventPreference.indexOf(x.event) -
            EntityAssignmentComparer.eventPreference.indexOf(y.event);
        if (comparison === 0) {
            // Order by operations.
            comparison = this.operationPreference.indexOf(x.operation) - this.operationPreference.indexOf(y.operation);
            if (comparison === 0) {
                // Unexpected before expected.
                if (x.isExpected === y.isExpected) {
                    comparison = 0;
                } else {
                    comparison = x.isExpected ? -1 : 1;
                }

                if (comparison === 0) {
                    // Order by position in utterance.
                    comparison = x.value?.start - y.value?.start;
                }
            }
        }

        return comparison;
    }
}
