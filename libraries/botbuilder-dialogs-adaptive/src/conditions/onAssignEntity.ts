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
 * Triggered to assign an entity to a property.
 */
export class OnAssignEntity extends OnDialogEvent {

    public constructor(property?: string, entity?: string, operation?: string, actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.assignEntity, actions, condition);
        this.property = property;
        this.entity = entity;
        this.operation = operation;
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
     * Gets or sets the operation being used to assign the entity for filtering events.
     */
    public operation: string;

    public getExpression(parser: ExpressionParserInterface): Expression {
        const expressions = [super.getExpression(parser)];
        if (this.property) {
            expressions.push(parser.parse(`${ TurnPath.dialogEvent }.value.property == '${ this.property }'`));
        }
        if (this.entity) {
            expressions.push(parser.parse(`${ TurnPath.dialogEvent }.value.entity.name == '${ this.entity }'`));
        }
        if (this.operation) {
            expressions.push(parser.parse(`${ TurnPath.dialogEvent }.value.operation == '${ this.operation }'`));
        }

        return Expression.andExpression.apply(Expression, expressions);
    }
}
