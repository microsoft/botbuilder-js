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
    value?: string;
    operation?: string;
}

/**
 * Triggered to assign an entity to a property.
 */
export class OnAssignEntity extends OnDialogEvent implements OnAssignEntityConfiguration {
    static $kind = 'Microsoft.OnAssignEntity';

    /**
     * Initializes a new instance of the [OnAssignEntity](xref:botbuilder-dialogs-adaptive.OnAssignEntity) class.
     *
     * @param property Optional, property filter on event.
     * @param value Optional, value filter on event.
     * @param operation Optional, operation filter on event.
     * @param actions Optional, actions to add to the plan when the rule constraints are met.
     * @param condition Optional, condition which needs to be met for the actions to be executed.
     */
    constructor(property?: string, value?: string, operation?: string, actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.assignEntity, actions, condition);
        this.property = property;
        this.value = value;
        this.operation = operation;
    }

    /**
     * Gets or sets the property filter on events.
     */
    property: string;

    /**
     * Gets or sets the value filter on events.
     */
    value: string;

    /**
     * Gets or sets the operation filter on events.
     */
    operation: string;

    /**
     * Create the expression for this condition.
     *
     * @returns [Expression](xref:adaptive-expressions.Expression) used to evaluate this rule.
     */
    protected createExpression(): Expression {
        const expressions = [super.createExpression()];

        if (this.property) {
            expressions.push(Expression.parse(`${TurnPath.dialogEvent}.value.property == '${this.property}'`));
        }
        if (this.value) {
            expressions.push(Expression.parse(`${TurnPath.dialogEvent}.value.value.name == '${this.value}'`));
        }
        if (this.operation) {
            expressions.push(Expression.parse(`${TurnPath.dialogEvent}.value.operation == '${this.operation}'`));
        }

        return Expression.andExpression(...expressions);
    }
}
