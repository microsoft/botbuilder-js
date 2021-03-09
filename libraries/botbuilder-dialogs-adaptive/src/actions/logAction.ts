/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    BoolExpression,
    BoolExpressionConverter,
    Expression,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';
import { Activity, ActivityTypes } from 'botbuilder';
import {
    Converter,
    ConverterFactory,
    DialogConfiguration,
    DialogContext,
    Dialog,
    DialogStateManager,
    DialogTurnResult,
    TemplateInterface,
} from 'botbuilder-dialogs';
import { TextTemplate } from '../templates';
import { TextTemplateConverter } from '../converters/textTemplateConverter';

export interface LogActionConfiguration extends DialogConfiguration {
    text?: string | TemplateInterface<string, DialogStateManager>;
    traceActivity?: boolean | string | Expression | BoolExpression;
    label?: string | Expression | StringExpression;
    disabled?: boolean | string | Expression | BoolExpression;
}

/**
 * Write entry into application trace logs.
 */
export class LogAction<O extends object = {}> extends Dialog<O> implements LogActionConfiguration {
    public static $kind = 'Microsoft.LogAction';

    /**
     * Creates a new [LogAction](xref:botbuilder-dialogs-adaptive.LogAction) instance.
     * @param template The text template to log.
     */
    public constructor(text: string);
    
    /**
     * Creates a new [LogAction](xref:botbuilder-dialogs-adaptive.LogAction) instance.
     * @param text Optional. The text template to log.
     */
    public constructor(text?: string) {
        super();
        if (text) {
            this.text = new TextTemplate(text);
        }
    }

    /**
     * The text template to log.
     */
    public text: TemplateInterface<string, DialogStateManager>;

    /**
     * If true, the message will both be logged to the console and sent as a trace activity.
     * Defaults to a value of false.
     */
    public traceActivity: BoolExpression = new BoolExpression(false);

    /**
     * A label to use when describing a trace activity.
     */
    public label: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public getConverter(property: keyof LogActionConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'text':
                return new TextTemplateConverter();
            case 'traceActivity':
                return new BoolExpressionConverter();
            case 'label':
                return new StringExpressionConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (!this.text) {
            throw new Error(`${this.id}: no 'message' specified.`);
        }

        const msg = await this.text.bind(dc, dc.state);
        this.telemetryClient.trackEvent({
            name: 'GeneratorResult',
            properties: {
                template: this.text,
                result: msg || '',
            },
        });

        // Log to console and send trace if needed
        console.log(msg);
        let label = '';
        if (this.label) {
            label = this.label.getValue(dc.state);
        } else {
            if (dc.parent && dc.parent.activeDialog && dc.parent.activeDialog.id) {
                label = dc.parent.activeDialog.id;
            }
        }
        if (this.traceActivity && this.traceActivity.getValue(dc.state)) {
            const activity: Partial<Activity> = {
                type: ActivityTypes.Trace,
                name: 'LogAction',
                valueType: 'string',
                value: msg,
                label: label,
            };
            await dc.context.sendActivity(activity);
        }

        return await dc.endDialog();
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `LogAction[${this.text}]`;
    }
}
