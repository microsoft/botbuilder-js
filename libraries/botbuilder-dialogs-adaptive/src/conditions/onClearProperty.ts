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
 * Triggered to clear a property.
 */
export class OnClearProperty extends OnDialogEvent {

    public static declarativeType = 'Microsoft.OnClearProperty';

    public constructor(property?: string, actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.chooseEntity, actions, condition);
        this.property = property;
    }

    /**
     * Gets or sets the property being cleared to filter events.
     */
    public property: string;

    public getExpression(parser: ExpressionParserInterface): Expression {
        const expressions = [super.getExpression(parser)];
        if (this.property) {
            expressions.push(parser.parse(`${ TurnPath.dialogEvent }.value.property == '${ this.property }'`));
        }

        return Expression.andExpression.apply(Expression, expressions);
    }
}