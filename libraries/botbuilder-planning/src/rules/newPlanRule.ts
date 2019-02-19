/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { UtteranceRecognizedRule } from "./utteranceRecognizeRule";
import { Dialog } from "botbuilder-dialogs";
import { PlanChangeType } from "../planningContext";

/**
 * When triggered, this rule will begin a new plan with a specified set of steps.
 * 
 * @remarks
 * Any currently executing plan will be saved and automatically resumed once the new plan finishes
 * executing.
 */
export class NewPlanRule extends UtteranceRecognizedRule {

    /**
     * Creates a new `NewPlanRule` instance.
     * @param intents List of intents to filter to.
     * @param entities List of entities to filter to.
     * @param steps List of steps to initialize new plan with.
     */
    constructor();
    constructor(intents: string|string[], steps: Dialog[]);
    constructor(intents: string|string[], entities: string|string[], steps: Dialog[]);
    constructor(intents?: string|string[], entitiesOrSteps?: string|string[]|Dialog[], steps?: Dialog[]) {
        if (!steps) {
            steps = entitiesOrSteps as Dialog[];
            entitiesOrSteps = undefined;
        }
        super(intents, entitiesOrSteps as any, steps, PlanChangeType.newPlan);
    }
}