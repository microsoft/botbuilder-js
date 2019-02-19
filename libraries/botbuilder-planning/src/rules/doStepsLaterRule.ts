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
 * When triggered, this rule will append a set of steps to the end of the current plan.
 * 
 * @remarks
 * The steps will be run after all of the plans existing steps finish executing.
 */
export class DoStepsLaterRule extends UtteranceRecognizedRule {

    /**
     * Creates a new `DoStepsLaterRule` instance.
     * @param intents List of intents to filter to.
     * @param entities List of entities to filter to.
     * @param steps List of steps to append to current plan.
     */
    constructor();
    constructor(intents: string|string[], steps: Dialog[]);
    constructor(intents: string|string[], entities: string|string[], steps: Dialog[]);
    constructor(intents?: string|string[], entitiesOrSteps?: string|string[]|Dialog[], steps?: Dialog[]) {
        if (!steps) {
            steps = entitiesOrSteps as Dialog[];
            entitiesOrSteps = undefined;
        }
        super(intents, entitiesOrSteps as any, steps, PlanChangeType.doStepsLater);
    }
}