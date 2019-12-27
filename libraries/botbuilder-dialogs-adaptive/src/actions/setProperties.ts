import { Dialog, DialogContext, DialogTurnResult, DialogConfiguration } from 'botbuilder-dialogs';
import { ExpressionEngine } from 'botframework-expressions';

export class PropertyAssignment {
    public property: string;
    public value: string;
}

export interface SetPropertiesConfiguration extends DialogConfiguration {
    assignments?: PropertyAssignment[];
}

export class SetProperties<O extends object = {}> extends Dialog<O> {

    public static declarativeType = 'Microsoft.SetProperties';

    /**
     * Additional property settings as property/value pairs.
     */
    public assignments: PropertyAssignment[] = [];

    public configure(config: SetPropertiesConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        for (let i = 0; i < this.assignments.length; i++) {
            const assignment = this.assignments[i];
            const valExp = new ExpressionEngine().parse(assignment.value);

            const { value, error } = valExp.tryEvaluate(dc.state);
            if (error) {
                throw new Error(`Expression evaluation resulted in an error. Expression: ${valExp.toString()}. Error: ${error}`);
            }

            dc.state.setValue(assignment.property, value);
        }

        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `SetProperties[${this.assignments.map(item => item.property).join(',')}]`;
    }
}