/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { RecognizerResult } from 'botbuilder-core';
import { EventRule } from './eventRule';
import { PlanningEventNames, PlanningContext, PlanChangeList, PlanChangeType } from '../planningContext';
import { DialogEvent, Dialog } from 'botbuilder-dialogs';

/**
 * This rule is triggered when a message is received and the recognized intents & entities match a
 * specified list of intent & entity filters.
 */
export class UtteranceRecognizedRule extends EventRule {

    /**
     * List of intents to filter to.
     */
    public readonly intents: string[];

    /**
     * List of entities to filter to.
     */
    public readonly entities: string[];

    /**
     * Creates a new `UtteranceRecognizedRule` instance.
     * @param intents (Optional) list of intents to filter to.
     * @param entities (Optional) list of entities to filter to.
     * @param steps (Optional) list of steps to update the plan with when triggered.
     * @param changeType (Optional) type of plan modification to make when triggered. Defaults to `PlanChangeType.doSteps`.
     */
    constructor(intents?: string|string[], entities?: string|string[], steps?: Dialog[], changeType?: PlanChangeType) {
        super(PlanningEventNames.utteranceRecognized, steps, changeType);
        this.intents = Array.isArray(intents) ? intents : (intents !== undefined ? [intents] : []);
        this.entities = Array.isArray(entities) ? entities : (entities !== undefined ? [entities] : []);
    }

    protected async onIsTriggered(planning: PlanningContext, event: DialogEvent<RecognizerResult>): Promise<boolean> {
        if (event.value) {
            // Ensure all intents recognized
            const recognized = event.value;
            const foundIntents = recognized.intents || {};
            for (let i = 0; i < this.intents.length; i++) {
                if (!foundIntents.hasOwnProperty(this.intents[i])) {
                    return false;
                }
            }

            // Ensure all entities recognized
            const foundEntities = recognized.entities || {};
            for (let i = 0; i < this.entities.length; i++) {
                if (!foundEntities.hasOwnProperty(this.entities[i])) {
                    return false;
                }
            }
        }

        return true;
    }

    protected onCreateChangeList(planning: PlanningContext, dialogOptions?: any): PlanChangeList {
        const changes = super.onCreateChangeList(planning, dialogOptions);

        // Add recognized intents and entities to change list
        changes.intentsMatched = this.intents;
        changes.entitiesMatched = this.entities;
        return changes;
    }
}