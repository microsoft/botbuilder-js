/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IfProperty } from "./ifProperty";
import { PlanningContext } from "../planningContext";

export class IfNotProperty extends IfProperty {

    protected isTruthy(planning: PlanningContext, property?: string): boolean {
        const truthy = super.isTruthy(planning, property);
        return !truthy;
    }
}
