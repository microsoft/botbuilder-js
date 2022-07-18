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

export interface OnChooseEntityConfiguration extends OnDialogEventConfiguration {
    property?: string;
    value?: string;
    operation?: string;
}

/**
 * Triggered to choose between different possible entity resolutions.
 */
export class OnChooseEntity extends OnDialogEvent implements OnChooseEntityConfiguration {
    static $kind = 'Microsoft.OnChooseEntity';

    /**
     * Initializes a new instance of the [OnChooseEntity](xref:botbuilder-dialogs-adaptive.OnChooseEntity) class.
     *
     * @param {string} property Optional, property for filtering events.
     * @param {string} value Optional, value filtering events.
     * @param {string} operation Optional, operation for filtering events.
     * @param {Dialog[]} actions Optional, actions to add to the plan when the rule constraints are met.
     * @param {string} condition Optional, condition which needs to be met for the actions to be executed.
     */
    constructor(property?: string, value?: string, operation?: string, actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.chooseEntity, actions, condition);
        this.property = property;
        this.value = value;
        this.operation = operation;
    }

    /**
     * Gets or sets the property filter on event.
     */
    property: string;

    /**
     * Gets or sets the value filter on event.
     */
    value: string;

    /**
     * Gets or sets operation filter on event.
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
