import { Dialog, DialogContext, DialogTurnResult, DialogConfiguration } from 'botbuilder-dialogs';
import { ExpressionEngine, Expression } from 'botframework-expressions';

export class PropertyAssignment {
    public property: string;
    public value: string;
}

export interface SetPropertiesConfiguration extends DialogConfiguration {
    assignments?: PropertyAssignment[];
}

export class SetProperties<O extends object = {}> extends Dialog<O> {

    public static declarativeType = 'Microsoft.SetProperties';

    private _assignments: PropertyAssignment[] = [];

    private _assignmentValueExpressions: Expression[] = [];

    /**
     * Get additional property settings as property/value pairs.
     */
    public get assignments(): PropertyAssignment[] {
        return this._assignments || [];
    }

    public set assignments(value: PropertyAssignment[]) {
        this._assignments = value || [];
        this._assignmentValueExpressions = [];
        for (let i = 0; i < this._assignments.length; i++) {
            const assignment = this._assignments[i];
            const valExp = new ExpressionEngine().parse(assignment.value);
            this._assignmentValueExpressions.push(valExp);
        }
    }

    public configure(config: SetPropertiesConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        for (let i = 0; i < this.assignments.length; i++) {
            const assignment = this.assignments[i];
            const assignmentValueExpression = this._assignmentValueExpressions[i];

            const { value, error } = assignmentValueExpression.tryEvaluate(dc.state);
            if (error) {
                throw new Error(`Expression evaluation resulted in an error. Expression: ${ assignmentValueExpression.toString() }. Error: ${ error }`);
            }

            dc.state.setValue(assignment.property, value);
        }

        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `SetProperties[${this.assignments.map(item => item.property).join(',')}]`;
    }
}