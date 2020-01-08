import { Dialog, DialogContext, DialogTurnResult, DialogConfiguration, Configurable } from 'botbuilder-dialogs';
import { ExpressionEngine, Expression } from 'botframework-expressions';

export class PropertyAssignment {
    public property: string;
    public value: string;
}

export interface SetPropertiesConfiguration extends DialogConfiguration {
    assignments?: PropertyAssignment[];
    disabled?: string;
}

export class SetProperties<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.SetProperties';

    public constructor();
    public constructor(assignments?: PropertyAssignment[]) {
        super();
        if (assignments) { this.assignments = assignments; }
    }

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

    /**
     * Get an optional expression which if is true will disable this action.
     */
    public get disabled(): string {
        return this._disabled ? this._disabled.toString() : undefined;
    }

    /**
     * Set an optional expression which if is true will disable this action.
     */
    public set disabled(value: string) {
        this._disabled = value ? new ExpressionEngine().parse(value) : undefined;
    }

    private _assignments: PropertyAssignment[] = [];

    private _assignmentValueExpressions: Expression[] = [];

    private _disabled: Expression;

    public configure(config: SetPropertiesConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

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