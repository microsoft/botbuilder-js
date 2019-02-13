/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { EventRule } from './eventRule';
import { PlanningEventNames } from './planningContext';

export class FallbackRule extends EventRule {
    constructor() {
        super(PlanningEventNames.fallback);
    }
}