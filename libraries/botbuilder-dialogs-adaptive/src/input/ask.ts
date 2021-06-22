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
    public static $kind = 'Microsoft.Ask';

    /**
     *Initializes a new instance of the [Ask](xref:botbuilder-dialogs-adaptive.Ask) class.
     * @param text Optional, text value.
     * @param expectedProperties Optional, [ArrayExpression](xref:adaptive-expressions.ArrayExpression) of expected properties.
     */
    public constructor(text?: string, expectedProperties?: ArrayExpression<string>) {
        super(text);
        this.expectedProperties = expectedProperties;
    }

    /**
     * Gets or sets properties expected to be filled by response.
     */
    public expectedProperties: ArrayExpression<string>;

    /**
     * Gets or sets the default operation that will be used when no operation is recognized.
     */
    public defaultOperation: StringExpression;

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is started and pushed onto the dialog stack.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional, initial information to pass to the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @param property
     * @returns A [DialogTurnResult](xref:botbuilder-dialogs.DialogTurnResult) `Promise` representing the asynchronous operation.
     */
    public getConverter(property: keyof AskConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'expectedProperties':
                return new ArrayExpressionConverter<string>();
            case 'defaultOperation':
                return new StringExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    public async beginDialog(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
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
