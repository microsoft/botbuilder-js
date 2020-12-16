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

export interface OnAssignEntityConfiguration extends OnDialogEventConfiguration {
    property?: string;
    entity?: string;
    operation?: string;
}

/**
 * Triggered to assign an entity to a property.
 */
export class OnAssignEntity extends OnDialogEvent implements OnAssignEntityConfiguration {
    public static $kind = 'Microsoft.OnAssignEntity';
  
    /**
     * Initializes a new instance of the [OnAssignEntity](xref:botbuilder-dialogs-adaptive.OnAssignEntity) class.
     * @param property Optional. Property to be assigned for filtering events.
     * @param entity Optional. Entity name being assigned for filtering events.
     * @param operation Optional. Operation being used to assign the entity for filtering events.
     * @param actions Optional. A [Dialog](xref:botbuilder-dialogs.Dialog) list containing the actions to add to the plan when the rule constraints are met.
     * @param condition Optional. Condition which needs to be met for the actions to be executed.
     */
    public constructor(
        property?: string,
        entity?: string,
        operation?: string,
        actions: Dialog[] = [],
        condition?: string
    ) {
        super(AdaptiveEvents.assignEntity, actions, condition);
        this.property = property;
        this.entity = entity;
        this.operation = operation;
    }

    /**
     * Gets or sets the property to be assigned for filtering events.
     */
    public property: string;

    /**
     * Gets or sets the entity name being assigned for filtering events.
     */
    public entity: string;

    /**
     * Gets or sets the operation being used to assign the entity for filtering events.
     */
    public operation: string;

    /**
     * Creates the expression for this rule.
     *
     * @returns {Expression} [Expression](xref:adaptive-expressions.Expression) used to evaluate this rule.
     */
    public createExpression(): Expression {
        const expressions = [super.createExpression()];
        if (this.property) {
            expressions.push(Expression.parse(`${TurnPath.dialogEvent}.value.property == '${this.property}'`));
        }
        if (this.entity) {
            expressions.push(Expression.parse(`${TurnPath.dialogEvent}.value.entity.name == '${this.entity}'`));
        }
        if (this.operation) {
            expressions.push(Expression.parse(`${TurnPath.dialogEvent}.value.operation == '${this.operation}'`));
        }

        return Expression.andExpression(...expressions);
    }
}
