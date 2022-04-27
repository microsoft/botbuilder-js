/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TriggerTree, Trigger } from 'adaptive-expressions';
import { OnCondition } from '../conditions/onCondition';
import { TriggerSelector } from '../triggerSelector';
import { ActionContext } from '../actionContext';

export interface MostSpecificSelectorConfiguration {
    selector?: TriggerSelector;
}

/**
 * Select the most specific true rule implementation of [TriggerSelector](xref:botbuilder-dialogs-adaptive.TriggerSelector).
 */
export class MostSpecificSelector extends TriggerSelector implements MostSpecificSelectorConfiguration {
    static $kind = 'Microsoft.MostSpecificSelector';

    private readonly _tree = new TriggerTree();

    selector: TriggerSelector;

    /**
     * Initializes the selector with the set of rules.
     *
     * @param conditionals Possible rules to match.
     * @param _evaluate True by default if rules should be evaluated on select.
     */
    initialize(conditionals: OnCondition[], _evaluate: boolean): void {
        for (const conditional of conditionals) {
            this._tree.addTrigger(conditional.getExpression(), conditional);
        }
    }

    /**
     * Selects the best rule to execute.
     *
     * @param context The context for the current turn of conversation.
     * @returns The best rule in original list to execute.
     */
    async select(context: ActionContext): Promise<OnCondition[]> {
        const triggers = this._tree.matches(context.state);
        const matches: OnCondition[] = triggers.map((trigger: Trigger) => trigger.action);

        let selections = matches;
        if (matches.length > 0 && this.selector) {
            this.selector.initialize(matches, false);
            selections = await this.selector.select(context);
        }

        return selections;
    }
}
