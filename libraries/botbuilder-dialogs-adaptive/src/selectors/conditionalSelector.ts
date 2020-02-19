/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Configurable } from 'botbuilder-dialogs';
import { OnCondition } from '../conditions/onCondition';
import { TriggerSelector } from '../triggerSelector';
import { SequenceContext } from '../sequenceContext';
import { BoolExpression } from '../expressionProperties';

export interface ConditionalSelectorConfiguration {
    condition?: string | boolean;
    ifTrue?: TriggerSelector;
    ifFalse?: TriggerSelector;
}

/**
 * Select between two rule selectors based on a condition.
 */
export class ConditionalSelector extends Configurable implements TriggerSelector {
    public static declarativeType = 'Microsoft.ConditionalSelector';

    private _conditionals: OnCondition[];
    private _evaluate: boolean;

    /**
     * Expression that determines which selector to use.
     */
    public condition: BoolExpression;

    /**
     * Gets or sets selector if condition is true.
     */
    public ifTrue: TriggerSelector;

    /**
     * Gets or sets selector if condition is false.
     */
    public ifFalse: TriggerSelector;

    public configure(config: ConditionalSelectorConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'condition':
                        this.condition = new BoolExpression(value);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    public initialize(conditionals: OnCondition[], evaluate: boolean): void {
        this._conditionals = conditionals;
        this._evaluate = evaluate;
    }

    public select(context: SequenceContext): Promise<number[]> {
        let selector: TriggerSelector;
        if (this.condition && this.condition.getValue(context.state)) {
            selector = this.ifTrue;
            this.ifTrue.initialize(this._conditionals, this._evaluate);
        } else {
            selector = this.ifFalse;
            this.ifFalse.initialize(this._conditionals, this._evaluate);
        }
        return selector.select(context);
    }
}