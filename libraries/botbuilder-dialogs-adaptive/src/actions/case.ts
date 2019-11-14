import { Dialog } from 'botbuilder-dialogs';
import { Expression, Constant } from 'botframework-expressions';
export class Case
    {
        constructor(value: string, actions: Dialog[])
        {
            this.value = value;
            this.actions = actions;
        }

        /**
         * Gets or sets value expression to be compared against condition.
         */

        public value: string;

        /// <summary>
        /// Gets or sets set of actions to be executed given that the condition of the switch matches the value of this case.
        /// </summary>
        /// <value>
        /// Set of actions to be executed given that the condition of the switch matches the value of this case.
        /// </value>

        public actions: Dialog[];

        public CreateValueExpression(): Expression {
            return new Constant(this.value);
        }
    }