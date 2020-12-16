/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Expression } from 'adaptive-expressions';
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { AdaptiveEvents } from '../adaptiveEvents';
import { OnDialogEvent, OnDialogEventConfiguration } from './onDialogEvent';

export interface OnChoosePropertyConfiguration extends OnDialogEventConfiguration {
    properties?: string[];
    entities?: string[];
}

/**
 * Triggered to choose which property an entity goes to.
 */
export class OnChooseProperty extends OnDialogEvent implements OnChoosePropertyConfiguration {
    public static $kind = 'Microsoft.OnChooseProperty';

    /**
     * Initializes a new instance of the [OnChooseProperty](xref:botbuilder-dialogs-adaptive.OnChooseProperty) class.
     * @param properties Optional. List of properties being chosen between to filter events.
     * @param entities Optional. List of entities being chosen between to filter events.
     * @param actions Optional. A [Dialog](xref:botbuilder-dialogs.Dialog) list containing the actions to add to the plan when the rule constraints are met.
     * @param condition Optional. Condition which needs to be met for the actions to be executed.
     */
    public constructor(properties: string[] = [], entities: string[] = [], actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.chooseProperty, actions, condition);
        this.properties = properties;
        this.entities = entities;
    }

    /**
     * Gets or sets the properties being chosen between to filter events.
     */
    public properties: string[];

    /**
     * Gets or sets the entities being chosen between to filter events.
     */
    public entities: string[];

    /**
     * Create the expression for this condition.
     *
     * @returns {Expression} [Expression](xref:adaptive-expressions.Expression) used to evaluate this rule.
     */
    public createExpression(): Expression {
        const expressions = [super.createExpression()];
        this.properties.forEach((property) => {
            expressions.push(
                Expression.parse(
                    `contains(foreach(${TurnPath.dialogEvent}.value, mapping, mapping.property), '${property}')`
                )
            );
        });
        this.entities.forEach((entity) => {
            expressions.push(
                Expression.parse(
                    `contains(foreach(${TurnPath.dialogEvent}.value, mapping, mapping.entity.name), '${entity}')`
                )
            );
        });

        return Expression.andExpression(...expressions);
    }
}
