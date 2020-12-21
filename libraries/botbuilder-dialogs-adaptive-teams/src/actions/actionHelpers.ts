/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionProperty } from 'adaptive-expressions';
import { DialogContext } from 'botbuilder-dialogs';

/**
 * Get the value of the string expression from the Dialog Context.
 *
 * @param {DialogContext} dc A DialogContext object.
 * @param {ExpressionProperty<any>} expressionProperty The expressionProperty to use to retrieve a value from the DialogContext.
 * @returns {string} The value of the evaluated stringExpression.
 */
export function getValue<T>(dc: DialogContext, expressionProperty: ExpressionProperty<T>): T {
    if (expressionProperty) {
        const { value, error } = expressionProperty.tryGetValue(dc.state);
        if (error) {
            throw new Error(
                `Expression evaluation resulted in an error. Expression: "${expressionProperty.expressionText}". Error: ${error}`
            );
        }
        return value;
    }
    return null;
}
