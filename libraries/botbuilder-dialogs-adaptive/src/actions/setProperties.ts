/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    ValueExpression,
    StringExpression,
    BoolExpression,
    BoolExpressionConverter,
    Expression,
} from 'adaptive-expressions';
import { StringUtils } from 'botbuilder-core';
import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';
import { replaceJsonRecursively } from '../jsonExtensions';

type AssignmentInput<T> = {
    property: string;
    value: T;
};

class PropertyAssignmentsConverter<T = unknown> implements Converter<AssignmentInput<T>[], PropertyAssignment[]> {
    public convert(items: AssignmentInput<T>[] | PropertyAssignment[]): PropertyAssignment[] {
        const assignments: PropertyAssignment[] = [];
        items.forEach((item) => {
            const { property, value } = item;
            assignments.push({
                property: property instanceof StringExpression ? property : new StringExpression(property),
                value: value instanceof ValueExpression ? value : new ValueExpression(value),
            });
        });
        return assignments;
    }
}

export interface PropertyAssignment {
    property: StringExpression;
    value: ValueExpression;
}

export interface SetPropertiesConfiguration extends DialogConfiguration {
    assignments?: AssignmentInput<unknown>[] | PropertyAssignment[];
    disabled?: boolean | string | Expression | BoolExpression;
}

export class SetProperties<O extends object = {}> extends Dialog<O> {
    public static $kind = 'Microsoft.SetProperties';

    public constructor();
    public constructor(assignments?: PropertyAssignment[]) {
        super();
        if (assignments) {
            this.assignments = assignments;
        }
    }

    /**
     * Additional property settings as property/value pairs.
     */
    public assignments: PropertyAssignment[] = [];

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public getConverter(property: keyof SetPropertiesConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'assignments':
                return new PropertyAssignmentsConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

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

    protected onComputeId(): string {
        return `SetProperties[${StringUtils.ellipsis(
            this.assignments.map((item): string => item.property.toString()).join(','),
            50
        )}]`;
    }
}
