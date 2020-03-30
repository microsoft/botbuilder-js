import { Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { Converter } from 'botbuilder-dialogs-declarative';
import { ValueExpression, StringExpression, BoolExpression } from '../expressions';

export interface PropertyAssignment {
    property: StringExpression;
    value: ValueExpression;
}

export class PropertyAssignmentConverter implements Converter {
    public convert(assignment: { property: string; value: any }): PropertyAssignment {
        const propertyAssignment: PropertyAssignment = {
            property: new StringExpression(assignment.property),
            value: new ValueExpression(assignment.value)
        };
        return propertyAssignment;
    }
}

export class SetProperties<O extends object = {}> extends Dialog<O> {
    public constructor();
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

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        for (let i = 0; i < this.assignments.length; i++) {
            const assignment = this.assignments[i];
            const value = assignment.value.getValue(dc.state);
            const property = assignment.property.getValue(dc.state);
            dc.state.setValue(property, value);
        }

        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `SetProperties[${ this.assignments.map((item): string => item.property.toString()).join(',') }]`;
    }
}