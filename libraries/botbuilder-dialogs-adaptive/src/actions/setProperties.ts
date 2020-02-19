import { Dialog, DialogContext, DialogTurnResult, DialogConfiguration, Configurable } from 'botbuilder-dialogs';
import { ValueExpression, StringExpression, BoolExpression } from '../expressionProperties';

export interface PropertyAssignment {
    property: StringExpression;
    value: ValueExpression;
}

export interface SetPropertiesConfiguration extends DialogConfiguration {
    assignments?: PropertyAssignment[];
    disabled?: string | boolean;
}

export class SetProperties<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.SetProperties';

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

    public configure(config: SetPropertiesConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'assignments':
                        this.assignments = value.map((item): PropertyAssignment => {
                            return {
                                property: item.property instanceof StringExpression ? item.property : new StringExpression(item.property),
                                value: item.value instanceof ValueExpression ? item.value : new ValueExpression(item.value)
                            };
                        });
                        break;
                    case 'disabled':
                        this.disabled = new BoolExpression(value);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

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