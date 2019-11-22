import { Dialog } from 'botbuilder-dialogs';
import { Expression, Constant } from 'botframework-expressions';

export class Case {
    constructor(value: string, actions: Dialog[]) {
        this.value = value;
        this.actions = actions;
    }

    /**
     * Gets or sets value expression to be compared against condition.
     */
    public value: string;

    /**
     * Gets or sets set of actions to be executed given that the condition of the switch matches the value of this case.
     */
    public actions: Dialog[];

    /**
     * Creates an expression that returns the value in its primitive type. Still
     * assumes that switch case values are compile time constants and not expressions
     * that can be evaluated against state.
     */
    public CreateValueExpression(): Expression {
        return new Constant(this.value);
    }
}