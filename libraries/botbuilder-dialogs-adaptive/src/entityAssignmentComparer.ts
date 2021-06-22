/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AdaptiveEvents } from './adaptiveEvents';
import { EntityAssignment } from './entityAssignment';

export class EntityAssignmentComparer {
    private static eventPreference = [
        AdaptiveEvents.assignEntity,
        AdaptiveEvents.chooseProperty,
        AdaptiveEvents.chooseEntity,
    ];

    constructor(private operationPreference: string[]) {}

    public compare(x: Partial<EntityAssignment>, y: Partial<EntityAssignment>): number {
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
