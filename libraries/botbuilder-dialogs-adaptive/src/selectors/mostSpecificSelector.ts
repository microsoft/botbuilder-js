/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionParser, ExpressionParserInterface, TriggerTree, Trigger } from 'adaptive-expressions';
import { OnCondition } from '../conditions/onCondition';
import { TriggerSelector } from '../triggerSelector';
import { ActionContext } from '../actionContext';

export class MostSpecificSelector extends TriggerSelector {
    private readonly _tree = new TriggerTree();

    /**
     * Gets or sets the expression parser to use.
     */
    public parser: ExpressionParserInterface = new ExpressionParser()
    
    public selector: TriggerSelector;

    public initialize(conditionals: OnCondition[], _evaluate: boolean) {
        for (const conditional of conditionals) {
            this._tree.addTrigger(conditional.getExpression(this.parser), conditional);
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