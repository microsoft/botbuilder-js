/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression, ExpressionConverter, StringExpression, StringExpressionConverter } from 'adaptive-expressions';
import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';

export interface AssertConditionConfiguration extends DialogConfiguration {
    condition?: string | Expression;
    description?: string | Expression | StringExpression;
}

/**
 * Dialog action which allows you to add assertions into your dialog flow.
 */
export class AssertCondition<O extends object = {}> extends Dialog<O> implements AssertConditionConfiguration {
    static $kind = 'Microsoft.Test.AssertCondition';

    /**
     * Condition which must be true.
     */
    condition: Expression;

    /**
     * Description of assertion.
     */
    description: StringExpression;

    /**
     * Description of assertion.
     *
     * @param property Properties that extend RecognizerConfiguration.
     * @returns Expression converter.
     *
     */
    getConverter(property: keyof AssertConditionConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'condition':
                return new ExpressionConverter();
            case 'description':
                return new StringExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Called when the dialog is started and pushed onto the dialog stack.
     *
     * @param dc The DialogContext for the current turn of the conversation.
     * @param _options Additional information to pass to the prompt being started.
     * @returns A Promise representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, _options?: O): Promise<DialogTurnResult> {
        const { value } = this.condition.tryEvaluate(dc.state);
        if (!value) {
            let desc = this.description && this.description.getValue(dc.state);
            if (!desc) {
                desc = this.condition.toString();
            }
            throw new Error(desc);
        }
        return dc.endDialog();
    }

    /**
     * @protected
     * @returns String of the condition which must be true.
     */
    protected onComputeId(): string {
        return `AssertCondition[${this.condition.toString()}]`;
    }
}
