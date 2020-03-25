/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { Expression, ExpressionParserInterface } from 'adaptive-expressions';
import { AdaptiveEvents } from '../sequenceContext';
import { OnDialogEvent } from './onDialogEvent';

/**
 * Triggered to choose between different possible entity resolutions.
 */
export class OnChooseEntity extends OnDialogEvent {

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