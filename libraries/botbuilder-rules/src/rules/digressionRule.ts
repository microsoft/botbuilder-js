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
 * When triggered, this rule will introduce a digression to the current conversation.
 * 
 * @remarks
 * The digressions steps will be inserted at the beginning of the current plan and executed immediately. 
 * The plans current steps will continue execution upon completion of the inserted steps. If a step was 
 * in the middle of executing it will automatically re-prompt the user once its continued.  
 */
export class DigressionRule extends UtteranceRecognizedRule {

    /**
     * Creates a new `DigressionRule` instance.
     * @param matches List of intents, entities, or properties to filter to.
     * @param steps List of steps to execute immediately.
     */
    constructor();
    constructor(matches: string|string[], steps: Dialog[]);
    constructor(matches?: string|string[], steps?: Dialog[]) {
        super(matches, steps, PlanChangeType.doSteps);
    }
}