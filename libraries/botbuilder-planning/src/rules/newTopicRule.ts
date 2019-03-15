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
export class NewTopicRule extends UtteranceRecognizedRule {

    /**
     * Creates a new `NewTopicRule` instance.
     * @param matches List of intents, entities, or properties to filter to.
     * @param steps List of steps to initialize new plan with.
     */
    constructor();
    constructor(matches: string|string[], steps: Dialog[]);
    constructor(matches?: string|string[], steps?: Dialog[]) {
        super(matches, steps, PlanChangeType.replacePlan);
    }
}