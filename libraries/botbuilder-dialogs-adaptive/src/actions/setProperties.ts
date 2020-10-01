/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StringUtils } from 'botbuilder-core';
import { Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { Converter } from 'botbuilder-dialogs-declarative';
import { ValueExpression, StringExpression, BoolExpression } from 'adaptive-expressions';
import { replaceJsonRecursively } from '../jsonExtensions';

export interface PropertyAssignment {
    property: StringExpression;
    value: ValueExpression;
}

/**
 * `property`-`value` pair to `PropertyAssignment` converter.
 */
export class PropertyAssignmentConverter implements Converter {

    /**
     * Converts a `property`-`value` pair to a `PropertyAssignment`
     * @param assignment `property`-`value` pair.
     * @returns The `PropertyAssignment`.
     */
    public convert(assignment: { property: string; value: any }): PropertyAssignment {
        const propertyAssignment: PropertyAssignment = {
            property: new StringExpression(assignment.property),
            value: new ValueExpression(assignment.value)
        };
        return propertyAssignment;
    }
}

/**
 * Sets a property with the result of evaluating a value expression.
 */
export class SetProperties<O extends object = {}> extends Dialog<O> {
    public constructor();

    /**
     * Initializes a new instance of the `SetProperties` class.
     * @param assignments Optional. Additional property settings as property/value pairs.
     */
    public constructor(assignments?: PropertyAssignment[]) {
        super();
        if (assignments) { this.assignments = assignments; }
    }

    /**
     * Additional property settings as property/value pairs.
     */
    public assignments: PropertyAssignment[] = [];

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Starts a new dialog and pushes it onto the dialog stack.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        for (let i = 0; i < this.assignments.length; i++) {
            const assignment = this.assignments[i];
            let value = assignment.value.getValue(dc.state);
            
            if (value) {
                value = replaceJsonRecursively(dc.state, value);
            }

            const property = assignment.property.getValue(dc.state);
            dc.state.setValue(property, value);
        }

        return await dc.endDialog();
    }

    /**
     * @protected
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `SetProperties[${ StringUtils.ellipsis(this.assignments.map((item): string => item.property.toString()).join(','), 50) }]`;
    }
}
