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

export class MostSpecificSelector extends TriggerSelector implements MostSpecificSelectorConfiguration {
    public static $kind = 'Microsoft.MostSpecificSelector';

    private readonly _tree = new TriggerTree();

    public selector: TriggerSelector;

    public initialize(conditionals: OnCondition[], _evaluate: boolean): void {
        for (const conditional of conditionals) {
            this._tree.addTrigger(conditional.getExpression(), conditional);
        }
    }

    public async select(context: ActionContext): Promise<OnCondition[]> {
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
