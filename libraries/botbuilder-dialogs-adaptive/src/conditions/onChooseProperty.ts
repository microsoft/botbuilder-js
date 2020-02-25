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

export interface OnChoosePropertyConfiguration extends OnDialogEventConfiguration {
    property?: string;
    entity?: string;
}

/**
 * TTriggered to choose which property an entity goes to.
 */
export class OnChooseProperty extends OnDialogEvent {

    public static declarativeType = 'Microsoft.OnChooseProperty';

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

    public configure(config: OnChoosePropertyConfiguration): this {
        return super.configure(config);
    }

    public getExpression(parser: ExpressionParserInterface): Expression {
        const expressions = [super.getExpression(parser)];
        this.properties.forEach((property) => {
            expressions.push(parser.parse(`contains(foreach(${TurnPath.DIALOGEVENT}.value, mapping, mapping.property), '${property}')`));
        });
        this.entities.forEach((entity) => {
            expressions.push(parser.parse(`contains(foreach(${TurnPath.DIALOGEVENT}.value, mapping, mapping.entity.name), '${entity}')`));
        });
        
        return Expression.andExpression.apply(Expression, expressions);
    }
}