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
 * TTriggered to choose which property an entity goes to.
 */
export class OnChooseProperty extends OnDialogEvent {

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
