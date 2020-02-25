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

export interface OnChooseEntityConfiguration extends OnDialogEventConfiguration {
    property?: string;
    entity?: string;
}

/**
 * Triggered to choose between different possible entity resolutions.
 */
export class OnChooseEntity extends OnDialogEvent {

    public static declarativeType = 'Microsoft.OnChooseEntity';

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

    public configure(config: OnChooseEntityConfiguration): this {
        return super.configure(config);
    }

    public getExpression(parser: ExpressionParserInterface): Expression {
        const expressions = [super.getExpression(parser)];
        if (this.property) {
            expressions.push(parser.parse(`${TurnPath.DIALOGEVENT}.value.property == '${this.property}'`));
        }
        if (this.entity) {
            expressions.push(parser.parse(`${TurnPath.DIALOGEVENT}.value.entity.name == '${this.entity}'`));
        }
        
        return Expression.andExpression.apply(Expression, expressions);
    }
}