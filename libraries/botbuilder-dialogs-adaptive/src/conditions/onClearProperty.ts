/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { Expression, ExpressionParserInterface } from 'botframework-expressions';
import { AdaptiveEvents } from '../sequenceContext';
import { OnDialogEvent, OnDialogEventConfiguration } from './onDialogEvent';

export interface OnClearPropertyConfiguration extends OnDialogEventConfiguration {
    property?: string;
}

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

    public configure(config: OnClearPropertyConfiguration): this {
        return super.configure(config);
    }

    public getExpression(parser: ExpressionParserInterface): Expression {
        const expressions = [super.getExpression(parser)];
        if (this.property) {
            expressions.push(parser.parse(`${TurnPath.DIALOGEVENT}.value.property == '${this.property}'`));
        }
        
        return Expression.andExpression.apply(Expression, expressions);
    }
}