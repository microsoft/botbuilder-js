/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { Expression, ExpressionParserInterface } from 'adaptive-expressions';
import { AdaptiveEvents } from '../adaptiveEvents';
import { OnDialogEvent } from './onDialogEvent';

/**
 * Triggered to choose between different possible entity resolutions.
 */
export class OnChooseEntity extends OnDialogEvent {
    /**
     * Initializes a new instance of the `OnChooseEntity` class.
     * @param property Optional. Property to be assigned for filtering events.
     * @param entity Optional. Entity name being assigned for filtering events.
     * @param actions Optional. Actions to add to the plan when the rule constraints are met.
     * @param condition Optional. Condition which needs to be met for the actions to be executed.
     */
    public constructor(property?: string, entity?: string, actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.chooseEntity, actions, condition);
        this.property = property;
        this.entity = entity;
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
     * Get the expression for this rule.
     * @param parser Used to parse a string into an `Expression`.
     * @returns Expression which will be cached and used to evaluate this rule.
     */
    public getExpression(parser: ExpressionParserInterface): Expression {
        const expressions = [super.getExpression(parser)];
        if (this.property) {
            expressions.push(parser.parse(`${ TurnPath.dialogEvent }.value.property == '${ this.property }'`));
        }
        if (this.entity) {
            expressions.push(parser.parse(`${ TurnPath.dialogEvent }.value.entity.name == '${ this.entity }'`));
        }

        return Expression.andExpression.apply(Expression, expressions);
    }
}
