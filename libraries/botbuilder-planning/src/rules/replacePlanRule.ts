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
 * When triggered, this rule will replace any currently executing plan with a new plan and set of
 * steps to run.
 */
export class ReplacePlanRule extends UtteranceRecognizedRule {

    /**
     * Creates a new `ReplacePlanRule` instance.
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
        super(intents, entitiesOrSteps as any, steps, PlanChangeType.replacePlan);
    }
}
