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
    ListStyle,
    PromptCultureModels,
    recognizeChoices,
} from 'botbuilder-dialogs';

// eslint-disable-next-line import/no-extraneous-dependencies
import * as Recognizers from '@microsoft/recognizers-text-choice';
import { ChoiceOptionsSet } from './choiceOptionsSet';

export interface ConfirmInputConfiguration extends InputDialogConfiguration {
    defaultLocale?: StringProperty;
    style?: EnumProperty<ListStyle>;
    choiceOptions?: ObjectProperty<ChoiceFactoryOptions>;
    confirmChoices?: ObjectProperty<ChoiceSet>;
    outputFormat?: StringProperty;
}

/**
 * Declarative input control that will gather yes/no confirmation input from a set of choices.
 */
export class ConfirmInput extends InputDialog implements ConfirmInputConfiguration {
    static $kind = 'Microsoft.ConfirmInput';

    /**
     * Default options for rendering the choices to the user based on locale.
     */
    private static defaultChoiceOptions: Record<
        string,
        { choices: Array<Choice | string>; options: ChoiceFactoryOptions }
    > = {
        'es-es': {
            choices: ['Sí', 'No'],
            options: { inlineSeparator: ', ', inlineOr: ' o ', inlineOrMore: ', o ', includeNumbers: true },
        },
        'nl-nl': {
            choices: ['Ja', 'Nee'],
            options: { inlineSeparator: ', ', inlineOr: ' of ', inlineOrMore: ', of ', includeNumbers: true },
        },
        'en-us': {
            choices: ['Yes', 'No'],
            options: { inlineSeparator: ', ', inlineOr: ' or ', inlineOrMore: ', or ', includeNumbers: true },
        },
        'fr-fr': {
            choices: ['Oui', 'Non'],
            options: { inlineSeparator: ', ', inlineOr: ' ou ', inlineOrMore: ', ou ', includeNumbers: true },
        },
        'de-de': {
            choices: ['Ja', 'Nein'],
            options: { inlineSeparator: ', ', inlineOr: ' oder ', inlineOrMore: ', oder ', includeNumbers: true },
        },
        'ja-jp': {
            choices: ['はい', 'いいえ'],
            options: { inlineSeparator: '、 ', inlineOr: ' または ', inlineOrMore: '、 または ', includeNumbers: true },
        },
        'pt-br': {
            choices: ['Sim', 'Não'],
            options: { inlineSeparator: ', ', inlineOr: ' ou ', inlineOrMore: ', ou ', includeNumbers: true },
        },
        'zh-cn': {
            choices: ['是的', '不'],
            options: { inlineSeparator: '， ', inlineOr: ' 要么 ', inlineOrMore: '， 要么 ', includeNumbers: true },
        },
    };

    /**
     * The prompts default locale that should be recognized.
     */
    defaultLocale?: StringExpression;

    /**
     * Style of the "yes" and "no" choices rendered to the user when prompting.
     *
     * @remarks
     * Defaults to `ListStyle.auto`.
     */
    style: EnumExpression<ListStyle> = new EnumExpression<ListStyle>(ListStyle.auto);

    /**
     * Additional options passed to the `ChoiceFactory` and used to tweak the style of choices
     * rendered to the user.
     */
    choiceOptions?: ObjectExpression<ChoiceFactoryOptions> = new ObjectExpression();

    /**
     * Custom list of choices to send for the prompt.
     */
    confirmChoices?: ObjectExpression<ChoiceSet> = new ObjectExpression();

    /**
     * The expression of output format.
     */
    outputFormat: StringExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof ConfirmInputConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'defaultLocale':
                return new StringExpressionConverter();
            case 'style':
                return new EnumExpressionConverter<ListStyle>(ListStyle);
            case 'choiceOptions':
                return new ObjectExpressionConverter<ChoiceFactoryOptions>();
            case 'confirmChoices':
                return new ObjectExpressionConverter<ChoiceSet>();
            case 'outputFormat':
                return new StringExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * @protected
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `ConfirmInput[${this.prompt && this.prompt.toString()}]`;
    }

    /**
     * @protected
     * Called when input has been received.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns [InputState](xref:botbuilder-dialogs-adaptive.InputState) which reflects whether input was recognized as valid or not.
     */
    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Recognize input if needed
        let input = dc.state.getValue(InputDialog.VALUE_PROPERTY);
        if (typeof input !== 'boolean') {
            // Find locale to use
            const locale = this.determineCulture(dc);

            // Recognize input
            const results = Recognizers.recognizeBoolean(input, locale);
            if (results.length > 0 && results[0].resolution) {
                input = results[0].resolution.value;
                dc.state.setValue(InputDialog.VALUE_PROPERTY, !!input);
                if (this.outputFormat) {
                    const value = this.outputFormat.getValue(dc.state);
                    dc.state.setValue(InputDialog.VALUE_PROPERTY, value);
                }
                return InputState.valid;
            } else {
                // Fallback to trying the choice recognizer
                const defaults = ConfirmInput.defaultChoiceOptions[locale].choices;
                const confirmChoices = await this.getConfirmChoices(dc, defaults);

                const choices = ChoiceFactory.toChoices(confirmChoices);
                const results = recognizeChoices(input, choices);
                if (results.length > 0) {
                    input = results[0].resolution.index == 0;
                    dc.state.setValue(InputDialog.VALUE_PROPERTY, input);
                } else {
                    return InputState.unrecognized;
                }
            }
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
        const defaults = ConfirmInput.defaultChoiceOptions[locale].choices;
        // Format choices
        const confirmChoices = await this.getConfirmChoices(dc, defaults);
        const choices = ChoiceFactory.toChoices(confirmChoices);

        // Format prompt to send
        const prompt = await super.onRenderPrompt(dc, state);
        const channelId = dc.context.activity.channelId;
        const opts = await this.getChoiceOptions(dc, locale);
        const choiceOptions = opts ?? ConfirmInput.defaultChoiceOptions[locale].options;
        const style = this.style.getValue(dc.state);
        return Promise.resolve(this.appendChoices(prompt, channelId, choices, style, choiceOptions));
    }

    private async getChoiceOptions(dc: DialogContext, locale: string): Promise<ChoiceFactoryOptions> {
        if (!this.choiceOptions) {
            return ConfirmInput.defaultChoiceOptions[locale].options;
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

    private determineCulture(dc: DialogContext): string {
        /**
         * @deprecated Note: Default locale will be considered for deprecation as part of 4.13.
         */
        const candidateLocale = dc.getLocale() ?? this.defaultLocale?.getValue(dc.state);
        let culture = PromptCultureModels.mapToNearestLanguage(candidateLocale);
        if (!(culture && Object.hasOwnProperty.call(ConfirmInput.defaultChoiceOptions, culture))) {
            culture = PromptCultureModels.English.locale;
        }

        return culture;
    }

    private async getConfirmChoices(dc: DialogContext, defaults: (string | Choice)[]): Promise<ChoiceSet> {
        let confirmChoices: ChoiceSet;
        if (this.confirmChoices != null) {
            if (
                this.confirmChoices.expressionText != null &&
                this.confirmChoices.expressionText.trimLeft().startsWith('${')
            ) {
                // use TemplateInterface to bind (aka LG)
                const choiceSet = new ChoiceSet(this.confirmChoices.expressionText);
                confirmChoices = await choiceSet.bind(dc, dc.state);
            } else {
                // use Expression to bind
                confirmChoices = this.confirmChoices.getValue(dc.state);
            }
        }

        if (confirmChoices != null) {
            return Promise.resolve(confirmChoices);
        } else {
            return Promise.resolve(new ChoiceSet(defaults));
        }
    }
}
