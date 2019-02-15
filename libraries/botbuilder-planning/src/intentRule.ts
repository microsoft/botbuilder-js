/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { RecognizerResult } from 'botbuilder-core';
import { EventRule } from './eventRule';
import { PlanningEventNames, PlanningContext, PlanChangeList } from './planningContext';

export class IntentRule extends EventRule {

    public readonly intents: string[];

    public readonly entities: string[];

    constructor(intents?: string|string[], entities?: string|string[]) {
        super(PlanningEventNames.utteranceRecognized);
        this.intents = Array.isArray(intents) ? intents : (intents !== undefined ? [intents] : []);
        this.entities = Array.isArray(entities) ? entities : (entities !== undefined ? [entities] : []);
    }

    protected async onIsTriggered(planning: PlanningContext): Promise<boolean> {
        // Ensure all intents recognized
        const recognized = planning.eventValue as RecognizerResult;
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

        return super.onIsTriggered(planning);
    }

    protected onCreateChangeList(planning: PlanningContext): PlanChangeList {
        // Pass recognized results as dialog options to added steps.
        const changes = super.onCreateChangeList(planning, planning.eventValue);

        // Add recognized intents and entities to change list
        changes.intentsMatched = this.intents;
        changes.entitiesMatched = this.entities;
        return changes;
    }
}