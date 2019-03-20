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
export class AddTopicRule extends UtteranceRecognizedRule {

    /**
     * Creates a new `AdditionalTopicRule` instance.
     * @param matches List of intents, entities, or properties to filter to.
     * @param steps List of steps to initialize new plan with.
     */
    constructor();
    constructor(matches: string|string[], steps: Dialog[]);
    constructor(matches?: string|string[], steps?: Dialog[]) {
        super(matches, steps, PlanChangeType.newPlan);
    }
}
