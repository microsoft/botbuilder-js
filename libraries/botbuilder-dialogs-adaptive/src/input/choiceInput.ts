/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity } from 'botbuilder';
import { ChoiceSet } from './choiceSet';
import { EnumProperty, ObjectProperty, StringProperty } from '../properties';
import { InputDialog, InputDialogConfiguration, InputState } from './inputDialog';

import {
    EnumExpression,
    EnumExpressionConverter,
    ObjectExpression,
    ObjectExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';

import {
    Choice,
    ChoiceFactory,
    ChoiceFactoryOptions,
    Converter,
    ConverterFactory,
    DialogContext,
    DialogStateManager,
    FindChoicesOptions,
    ListStyle,
    PromptCultureModels,
    recognizeChoices,
    TemplateInterface,
} from 'botbuilder-dialogs';
import { TelemetryLoggerConstants } from '../telemetryLoggerConstants';
import { ChoiceOptionsSet } from './choiceOptionsSet';

export enum ChoiceOutputFormat {
    value = 'value',
    index = 'index',
}

export interface ChoiceInputOptions {
    choices: Choice[];
}

export interface ChoiceInputConfiguration extends InputDialogConfiguration {
    choices?: ObjectProperty<ChoiceSet>;
    style?: EnumProperty<ListStyle>;
    defaultLocale?: StringProperty;
    outputFormat?: EnumProperty<ChoiceOutputFormat>;
    choiceOptions?: ObjectProperty<ChoiceFactoryOptions>;
    recognizerOptions?: ObjectProperty<FindChoicesOptions>;
}

/**
 * ChoiceInput - Declarative input to gather choices from user.
 */
export class ChoiceInput extends InputDialog implements ChoiceInputConfiguration {
    static $kind = 'Microsoft.ChoiceInput';

    /**
     * Default options for rendering the choices to the user based on locale.
     */
    private static defaultChoiceOptions: Record<string, ChoiceFactoryOptions> = {
        'es-es': { inlineSeparator: ', ', inlineOr: ' o ', inlineOrMore: ', o ', includeNumbers: true },
        'nl-nl': { inlineSeparator: ', ', inlineOr: ' of ', inlineOrMore: ', of ', includeNumbers: true },
        'en-us': { inlineSeparator: ', ', inlineOr: ' or ', inlineOrMore: ', or ', includeNumbers: true },
        'fr-fr': { inlineSeparator: ', ', inlineOr: ' ou ', inlineOrMore: ', ou ', includeNumbers: true },
        'de-de': { inlineSeparator: ', ', inlineOr: ' oder ', inlineOrMore: ', oder ', includeNumbers: true },
        'ja-jp': { inlineSeparator: '、 ', inlineOr: ' または ', inlineOrMore: '、 または ', includeNumbers: true },
        'pt-br': { inlineSeparator: ', ', inlineOr: ' ou ', inlineOrMore: ', ou ', includeNumbers: true },
        'zh-cn': { inlineSeparator: '， ', inlineOr: ' 要么 ', inlineOrMore: '， 要么 ', includeNumbers: true },
    };

    /**
     * List of choices to present to user.
     */
    choices: ObjectExpression<ChoiceSet> = new ObjectExpression();

    /**
     * Style of the "yes" and "no" choices rendered to the user when prompting.
     *
     * @remarks
     * Defaults to `ListStyle.auto`.
     */
    style: EnumExpression<ListStyle> = new EnumExpression<ListStyle>(ListStyle.auto);

    /**
     * The prompts default locale that should be recognized.
     */
    defaultLocale?: StringExpression;

    /**
     * Control the format of the response (value or index of the choice).
     */
    outputFormat: EnumExpression<ChoiceOutputFormat> = new EnumExpression<ChoiceOutputFormat>(ChoiceOutputFormat.value);

    /**
     * Additional options passed to the `ChoiceFactory` and used to tweak the style of choices
     * rendered to the user.
     */
    choiceOptions?: ObjectExpression<ChoiceFactoryOptions> = new ObjectExpression();

    /**
     * Additional options passed to the underlying `recognizeChoices()` function.
     */
    recognizerOptions?: ObjectExpression<FindChoicesOptions> = new ObjectExpression();

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof ChoiceInputConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'choices':
                return new ObjectExpressionConverter<ChoiceSet>();
            case 'style':
                return new EnumExpressionConverter<ListStyle>(ListStyle);
            case 'defaultLocale':
                return new StringExpressionConverter();
            case 'outputFormat':
                return new EnumExpressionConverter<ChoiceOutputFormat>(ChoiceOutputFormat);
            case 'choiceOptions':
                return new ObjectExpressionConverter<ChoiceFactoryOptions>();
            case 'recognizerOptions':
                return new ObjectExpressionConverter<FindChoicesOptions>();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * {@inheritDoc InputDialog.trackGeneratorResultEvent}
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param activityTemplate Used to create the Activity.
     * @param msg The Partial [Activity](xref:botframework-schema.Activity) which will be sent.
     */
    protected trackGeneratorResultEvent(
        dc: DialogContext,
        activityTemplate: TemplateInterface<Partial<Activity>, DialogStateManager>,
        msg: Partial<Activity>
    ): void {
        const options = dc.state.getValue(ChoiceInput.OPTIONS_PROPERTY);
        const properties = {
            template: activityTemplate,
            result: msg,
            choices: options?.choices ? options.choices : '',
            context: TelemetryLoggerConstants.InputDialogResultEvent,
        };

        this.telemetryClient.trackEvent({
            name: TelemetryLoggerConstants.GeneratorResultEvent,
            properties: properties,
        });
    }

    /**
     * @protected
     * Method which processes options.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional, initial information to pass to the dialog.
     * @returns The modified [ChoiceInputOptions](xref:botbuilder-dialogs-adaptive.ChoiceInputOptions) options.
     */
    protected async onInitializeOptions(dc: DialogContext, options: ChoiceInputOptions): Promise<ChoiceInputOptions> {
        if (!(options && options.choices && options.choices.length > 0)) {
            if (!options) {
                options = { choices: [] };
            }
            options.choices = await this.getChoiceSet(dc);
        }
        return await super.onInitializeOptions(dc, options);
    }

    /**
     * @protected
     * Called when input has been received.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns [InputState](xref:botbuilder-dialogs-adaptive.InputState) which reflects whether input was recognized as valid or not.
     */
    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Get input and options
        const input: string = dc.state.getValue(InputDialog.VALUE_PROPERTY).toString();
        const options: ChoiceInputOptions = dc.state.getValue(InputDialog.OPTIONS_PROPERTY);

        // Format choices
        const choices = ChoiceFactory.toChoices(options.choices);

        // Initialize recognizer options
        const opt = Object.assign({}, this.recognizerOptions.getValue(dc.state));
        opt.locale = this.determineCulture(dc, opt);

        // Recognize input
        const results = recognizeChoices(input, choices, opt);
        if (!Array.isArray(results) || results.length == 0) {
            return InputState.unrecognized;
        }

        // Format output and return success
        const foundChoice = results[0].resolution;
        switch (this.outputFormat.getValue(dc.state)) {
            case ChoiceOutputFormat.value:
            default:
                dc.state.setValue(InputDialog.VALUE_PROPERTY, foundChoice.value);
                break;
            case ChoiceOutputFormat.index:
                dc.state.setValue(InputDialog.VALUE_PROPERTY, foundChoice.index);
                break;
        }

        return InputState.valid;
    }

    /**
     * @protected
     * Method which renders the prompt to the user given the current input state.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param state Dialog [InputState](xref:botbuilder-dialogs-adaptive.InputState).
     * @returns An [Activity](xref:botframework-schema.Activity) `Promise` representing the asynchronous operation.
     */
    protected async onRenderPrompt(dc: DialogContext, state: InputState): Promise<Partial<Activity>> {
        // Determine locale
        const locale = this.determineCulture(dc);

        // Format prompt to send
        const prompt = await super.onRenderPrompt(dc, state);
        const channelId = dc.context.activity.channelId;
        const opts = await this.getChoiceOptions(dc, locale);
        const choiceOptions = opts ?? ChoiceInput.defaultChoiceOptions[locale];
        const style = this.style.getValue(dc.state);
        const options = dc.state.getValue(ChoiceInput.OPTIONS_PROPERTY);
        return this.appendChoices(prompt, channelId, options.choices, style, choiceOptions);
    }

    /**
     * @protected
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `ChoiceInput[${this.prompt && this.prompt.toString()}]`;
    }

    private async getChoiceOptions(dc: DialogContext, locale: string): Promise<ChoiceFactoryOptions> {
        if (!this.choiceOptions) {
            return ChoiceInput.defaultChoiceOptions[locale];
        }

        if (
            this.choiceOptions.expressionText != null &&
            this.choiceOptions.expressionText.trimStart().startsWith('${')
        ) {
            // use TemplateInterface to bind (aka LG)
            const choiceOptionsSet = new ChoiceOptionsSet(this.choiceOptions.expressionText);
            return choiceOptionsSet.bind(dc);
        } else {
            // use Expression to bind
            return this.choiceOptions.getValue(dc.state);
        }
    }

    private getChoiceSet(dc: DialogContext): Promise<ChoiceSet> {
        if (this.choices.expressionText != null && this.choices.expressionText.trimLeft().startsWith('${')) {
            // use TemplateInterface to bind (aka LG)
            const choiceSet = new ChoiceSet(this.choices.expressionText);
            return choiceSet.bind(dc, dc.state);
        } else {
            // use Expression to bind
            return Promise.resolve(this.choices.getValue(dc.state));
        }
    }

    private determineCulture(dc: DialogContext, opt?: FindChoicesOptions): string {
        /**
         * @deprecated Note: opt.Locale and Default locale will be considered for deprecation as part of 4.13.
         */
        const candidateLocale = dc.getLocale() ?? opt?.locale ?? this.defaultLocale?.getValue(dc.state);
        let culture = PromptCultureModels.mapToNearestLanguage(candidateLocale);

        if (!(culture && Object.hasOwnProperty.call(ChoiceInput.defaultChoiceOptions, culture))) {
            culture = PromptCultureModels.English.locale;
        }

        return culture;
    }
}
