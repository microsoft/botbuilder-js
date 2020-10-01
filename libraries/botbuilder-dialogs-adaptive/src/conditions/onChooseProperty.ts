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
 * Triggered to choose which property an entity goes to.
 */
export class OnChooseProperty extends OnDialogEvent {
    /**
     * Initializes a new instance of the `OnChooseProperty` class.
     * @param properties Optional. List of properties being chosen between to filter events.
     * @param entities Optional. List of entities being chosen between to filter events.
     * @param actions Optional. Actions to add to the plan when the rule constraints are met.
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
     * Get the expression for this rule.
     * @param parser Used to parse a string into an `Expression`.
     * @returns Expression which will be cached and used to evaluate this rule.
     */
    public getExpression(parser: ExpressionParserInterface): Expression {
        const expressions = [super.getExpression(parser)];
        this.properties.forEach((property) => {
            expressions.push(parser.parse(`contains(foreach(${ TurnPath.dialogEvent }.value, mapping, mapping.property), '${ property }')`));
        });
        this.entities.forEach((entity) => {
            expressions.push(parser.parse(`contains(foreach(${ TurnPath.dialogEvent }.value, mapping, mapping.entity.name), '${ entity }')`));
        });

        return Expression.andExpression.apply(Expression, expressions);
    }
}
