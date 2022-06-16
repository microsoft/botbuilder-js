/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolProperty } from '../properties';
import { StringUtils } from 'botbuilder';
import { ValueExpression, StringExpression, BoolExpression, BoolExpressionConverter } from 'adaptive-expressions';
import { evaluateExpression } from '../jsonExtensions';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';

type AssignmentInput<T> = {
    property: string;
    value: T;
};

class PropertyAssignmentsConverter<T = unknown> implements Converter<AssignmentInput<T>[], PropertyAssignment[]> {
    convert(items: Array<AssignmentInput<T> | PropertyAssignment>): PropertyAssignment[] {
        return items.map(({ property, value }) => ({
            property: property instanceof StringExpression ? property : new StringExpression(property),
            value: value instanceof ValueExpression ? value : new ValueExpression(value),
        }));
    }
}

export interface PropertyAssignment {
    property: StringExpression;
    value: ValueExpression;
}

export interface SetPropertiesConfiguration extends DialogConfiguration {
    assignments?: AssignmentInput<unknown>[] | PropertyAssignment[];
    disabled?: BoolProperty;
}

/**
 * Sets properties with the result of evaluating a value expression.
 */
export class SetProperties<O extends object = {}> extends Dialog<O> implements SetPropertiesConfiguration {
    static $kind = 'Microsoft.SetProperties';

    constructor();

    /**
     * Initializes a new instance of the [SetProperties](xref:botbuilder-dialogs-adaptive.SetProperties) class.
     *
     * @param assignments Optional. [PropertyAssignment](xref:botbuilder-dialogs-adaptive.PropertyAssignment), additional property settings as property/value pairs.
     */
    constructor(assignments?: PropertyAssignment[]) {
        super();
        if (assignments) {
            this.assignments = assignments;
        }
    }

    /**
     * Additional property settings as property/value pairs.
     */
    assignments: PropertyAssignment[] = [];

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof SetPropertiesConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'assignments':
                return new PropertyAssignmentsConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, _options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        for (let i = 0; i < this.assignments.length; i++) {
            const assignment = this.assignments[i];

            const value = evaluateExpression(dc.state, assignment.value);

            const property = assignment.property.getValue(dc.state);
            dc.state.setValue(property, value);
        }

        return await dc.endDialog();
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `SetProperties[${StringUtils.ellipsis(
            this.assignments.map((item): string => item.property.toString()).join(','),
            50
        )}]`;
    }
}
