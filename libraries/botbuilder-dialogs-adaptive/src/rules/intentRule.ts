/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { RecognizerResult } from 'botbuilder-core';
import { EventRule } from './eventRule';
import { RuleDialogEventNames, PlanningContext, PlanChangeList } from '../planningContext';
import { DialogEvent, Dialog, DialogContextState } from 'botbuilder-dialogs';

/**
 * This rule is triggered when a message is received and the recognized intents & entities match a
 * specified list of intent & entity filters.
 */
export class IntentRule extends EventRule {

    /**
     * List of intents, entities, and properties to filter to.
     */
    public readonly matches: string[];

    /**
     * Creates a new `IntentRule` instance.
     * @param matches (Optional) list of intents, entities, and properties to filter to.
     * @param steps (Optional) list of steps to update the plan with when triggered.
     */
    constructor(matches?: string|string[], steps?: Dialog[]) {
        super(RuleDialogEventNames.recognizedIntent, steps);
        this.matches = Array.isArray(matches) ? matches : (matches !== undefined ? [matches] : []);
    }

    protected async onIsTriggered(planning: PlanningContext, event: DialogEvent<RecognizerResult>, memory: object): Promise<boolean> {
        // Ensure all intents, entities, and properties exist.
        for(let i = 0; i < this.matches.length; i++) {
            const value = DialogContextState.queryMemory(memory, this.matches[i], 1);
            if (!Array.isArray(value) || value.length == 0 || value[0] == undefined) {
                return false;
            }
        }

        return true;
    }

    protected onCreateChangeList(planning: PlanningContext, event: DialogEvent<RecognizerResult>, dialogOptions?: any): PlanChangeList {
        const changes = super.onCreateChangeList(planning, event, dialogOptions);

        // Sort matches by type
        const intents: string[] = [];
        const entities: string[] = [];
        this.matches.forEach((match) => {
            if (match[0] == '#') {
                intents.push(match);
            } else {
                entities.push(match);
            }
        })

        // Add recognized intents and entities to change list
        changes.intentsMatched = intents;
        changes.entitiesMatched = entities;
        return changes;
    }
}