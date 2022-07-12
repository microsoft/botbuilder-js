/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ArrayProperty, StringProperty } from '../properties';
import { SendActivity, SendActivityConfiguration } from '../actions/sendActivity';

import {
    ArrayExpression,
    ArrayExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';

import {
    Converter,
    ConverterFactory,
    DialogContext,
    DialogEvent,
    DialogPath,
    DialogTurnResult,
    DialogTurnStatus,
    TurnPath,
} from 'botbuilder-dialogs';
import { StringUtils } from 'botbuilder';
import { ActivityTemplate } from '..';

export interface AskConfiguration extends SendActivityConfiguration {
    expectedProperties?: ArrayProperty<string>;
    defaultOperation?: StringProperty;
}

/**
 * Ask for an open-ended response.
 * This sends an activity and then terminates the turn with `DialogTurnStatus.completeAndWait`.
 * The next activity from the user will then be handled by the parent adaptive dialog.
 * It also builds in a model of the properties that are expected in response through `DialogPath.expectedProperties`.
 * `DialogPath.retries` is updated as the same question is asked multiple times.
 */
export class Ask extends SendActivity implements AskConfiguration {
    static $kind = 'Microsoft.Ask';

    /**
     *Initializes a new instance of the [Ask](xref:botbuilder-dialogs-adaptive.Ask) class.
     *
     * @param text Optional, text value.
     * @param expectedProperties Optional, [ArrayExpression](xref:adaptive-expressions.ArrayExpression) of expected properties.
     */
    constructor(text?: string, expectedProperties?: ArrayExpression<string>) {
        super(text);
        this.expectedProperties = expectedProperties;
    }

    /**
     * Gets or sets properties expected to be filled by response.
     */
    expectedProperties: ArrayExpression<string>;

    /**
     * Gets or sets the default operation that will be used when no operation is recognized.
     */
    defaultOperation: StringExpression;

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is started and pushed onto the dialog stack.
     *
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof AskConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'expectedProperties':
                return new ArrayExpressionConverter<string>();
            case 'defaultOperation':
                return new StringExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Called when the dialog is started and pushed onto the dialog stack.
     *
     * @summary
     * If the task is successful, the result indicates whether the dialog is still
     * active after the turn has been processed by the dialog.
     *
     * You can use the [options](#options) parameter to include the QnA Maker context data,
     * which represents context from the previous query. To do so, the value should include a
     * `context` property of type [QnAResponseContext](#QnAResponseContext).
     *
     * @param {DialogContext} dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param {object} options (Optional) Initial information to pass to the dialog.
     * @returns {Promise<DialogTurnResult>} A promise resolving to the turn result
     */
    async beginDialog(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        // get number of retries from memory
        let retries: number = dc.state.getValue<number>(DialogPath.retries, 0);

        const expected: string[] = this.expectedProperties ? this.expectedProperties.getValue(dc.state) : undefined;
        const trigger: DialogEvent = dc.state.getValue<DialogEvent>(TurnPath.dialogEvent);
        const lastExpectedProperties: string[] = dc.state.getValue<string[]>(DialogPath.expectedProperties);
        const lastTrigger: DialogEvent = dc.state.getValue<DialogEvent>(DialogPath.lastTriggerEvent);

        if (
            expected &&
            lastExpectedProperties &&
            lastTrigger &&
            !expected.some(
                (prop: string): boolean =>
                    !lastExpectedProperties.some((lastProp: string): boolean => lastProp === prop)
            ) &&
            !lastExpectedProperties.some(
                (lastProp: string): boolean => !expected.some((prop: string): boolean => prop === lastProp)
            ) &&
            lastTrigger.name === trigger.name
        ) {
            retries++;
        } else {
            retries = 0;
        }

        dc.state.setValue(DialogPath.retries, retries);
        dc.state.setValue(DialogPath.lastTriggerEvent, trigger);
        dc.state.setValue(DialogPath.expectedProperties, expected);

        const result = await super.beginDialog(dc, options);
        result.status = DialogTurnStatus.completeAndWait;
        return result;
    }

    protected onComputeId(): string {
        if (this.activity instanceof ActivityTemplate) {
            return `Ask[${StringUtils.ellipsis(this.activity.template.trim(), 30)}]`;
        }
        return `Ask[${StringUtils.ellipsis(this.activity && this.activity.toString().trim(), 30)}]`;
    }
}
