/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionProperty } from 'adaptive-expressions';
import { StringUtils } from 'botbuilder';
import { DialogContext } from 'botbuilder-dialogs';
import { tests } from 'botbuilder-stdlib';

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

/**
 * Generate the ComputeId from an array of items that get stringified,
 * then joined by commas.
 *
 * @param classId
 * @param {any[]} otherIds An array of ids to join into a computeId.
 * @returns {string} computeId.
 */
export function getComputeId(classId: string, otherIds: unknown[]): string {
    const joinedOtherIds = otherIds
        .map((item) => {
            if (tests.isObject(item)) {
                item = JSON.stringify(item, null, 0);
            }

            return StringUtils.ellipsis(item?.toString().trim() || '', 30);
        })
        .join(',');
    return `${classId}[${joinedOtherIds}]`;
}
