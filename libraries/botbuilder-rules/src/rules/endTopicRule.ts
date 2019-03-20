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
 * When triggered, this rule will immediately end any plan that's currently executing.
 * 
 * @remarks
 * Upon ending, any saved plans will be automatically resumed. An optional list of steps can be
 * provided which will be inserted into the beginning of the resumed plan.  This allows the bot
 * to prompt the user if they'd like to continue executing the resumed plan. 
 */
export class EndTopicRule extends UtteranceRecognizedRule {

    /**
     * Creates a new `EndTopicRule` instance.
     * @param matches List of intents, entities, or properties to filter to.
     * @param steps (Optional) list of steps to insert at the beginning of the resumed plan.
     */
    constructor();
    constructor(matches: string|string[], steps?: Dialog[]);
    constructor(matches?: string|string[], steps?: Dialog[]) {
        super(matches, steps, PlanChangeType.endPlan);
    }
}