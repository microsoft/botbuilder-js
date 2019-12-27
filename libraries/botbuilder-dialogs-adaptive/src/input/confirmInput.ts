/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as Recognizers from '@microsoft/recognizers-text-choice';
import { Activity } from 'botbuilder-core';
import { DialogContext, Choice, ListStyle, ChoiceFactoryOptions, ChoiceFactory, recognizeChoices } from 'botbuilder-dialogs';
import { ExpressionEngine } from 'botframework-expressions';
import { InputDialogConfiguration, InputDialog, InputState } from './inputDialog';

export interface ConfirmInputConfiguration extends InputDialogConfiguration {
    defaultLocale?: string;
    style?: ListStyle;
    choiceOptions?: ChoiceFactoryOptions;
    confirmChoices?: Choice[];
    outputFormat?: string;
}

export class ConfirmInput extends InputDialog {

    public static declarativeType = 'Microsoft.ConfirmInput';

    /**
     * Default options for rendering the choices to the user based on locale.
     */
    private static defaultChoiceOptions: { [locale: string]: { choices: (string | Choice)[], options: ChoiceFactoryOptions } } = {
        'es-es': { choices: ['Sí', 'No'], options: { inlineSeparator: ', ', inlineOr: ' o ', inlineOrMore: ', o ', includeNumbers: true } },
        'nl-nl': { choices: ['Ja', 'Nee'], options: { inlineSeparator: ', ', inlineOr: ' of ', inlineOrMore: ', of ', includeNumbers: true } },
        'en-us': { choices: ['Yes', 'No'], options: { inlineSeparator: ', ', inlineOr: ' or ', inlineOrMore: ', or ', includeNumbers: true } },
        'fr-fr': { choices: ['Oui', 'Non'], options: { inlineSeparator: ', ', inlineOr: ' ou ', inlineOrMore: ', ou ', includeNumbers: true } },
        'de-de': { choices: ['Ja', 'Nein'], options: { inlineSeparator: ', ', inlineOr: ' oder ', inlineOrMore: ', oder ', includeNumbers: true } },
        'ja-jp': { choices: ['はい', 'いいえ'], options: { inlineSeparator: '、 ', inlineOr: ' または ', inlineOrMore: '、 または ', includeNumbers: true } },
        'pt-br': { choices: ['Sim', 'Não'], options: { inlineSeparator: ', ', inlineOr: ' ou ', inlineOrMore: ', ou ', includeNumbers: true } },
        'zh-cn': { choices: ['是的', '不'], options: { inlineSeparator: '， ', inlineOr: ' 要么 ', inlineOrMore: '， 要么 ', includeNumbers: true } }
    };

    /**
     * The prompts default locale that should be recognized.
     */
    public defaultLocale?: string;

    /**
     * Style of the "yes" and "no" choices rendered to the user when prompting.
     *
     * @remarks
     * Defaults to `ListStyle.auto`.
     */
    public style: ListStyle = ListStyle.auto;

    /**
     * Additional options passed to the `ChoiceFactory` and used to tweak the style of choices
     * rendered to the user.
     */
    public choiceOptions?: ChoiceFactoryOptions;

    /**
     * Custom list of choices to send for the prompt.
     */
    public confirmChoices?: Choice[];

    /**
     * Output format expression.
     */
    public outputFormat?: string;

    public configure(config: ConfirmInputConfiguration): this {
        return super.configure(config);
    }

    protected onComputeId(): string {
        return `ConfirmInput[${ this.prompt.value.toString() }]`;
    }

    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Recognize input if needed
        let input: any = dc.state.getValue(InputDialog.VALUE_PROPERTY);
        if (typeof input !== 'boolean') {
            // Find locale to use
            const activity: Activity = dc.context.activity;
            const locale = activity.locale || this.defaultLocale || 'en-us';

            // Recognize input
            const results: any = Recognizers.recognizeBoolean(input, locale);
            if (results.length > 0 && results[0].resolution) {
                input = results[0].resolution.value;
                dc.state.setValue(InputDialog.VALUE_PROPERTY, !!input);
                if (this.outputFormat) {
                    const outputExpression = new ExpressionEngine().parse(this.outputFormat);
                    const { value, error } = outputExpression.tryEvaluate(dc.state);
                    if (!error) {
                        dc.state.setValue(InputDialog.VALUE_PROPERTY, value);
                    } else {
                        throw new Error(`OutputFormat expression evaluation resulted in an error. Expression: ${outputExpression.toString()}. Error: ${error}`);
                    }
                }
                return InputState.valid;
            } else {
                // Fallback to trying the choice recognizer
                const confirmChoices = this.confirmChoices || ConfirmInput.defaultChoiceOptions[locale].choices;
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

    protected onRenderPrompt(dc: DialogContext, state: InputState): Partial<Activity> {
        // Determine locale
        let locale: string = dc.context.activity.locale || this.defaultLocale;
        if (!locale || !ConfirmInput.defaultChoiceOptions.hasOwnProperty(locale)) {
            locale = 'en-us';
        }

        // Format choices
        const confirmChoices = this.confirmChoices || ConfirmInput.defaultChoiceOptions[locale].choices;
        const choices = ChoiceFactory.toChoices(confirmChoices);

        // Format prompt to send
        const prompt = super.onRenderPrompt(dc, state);
        const channelId: string = dc.context.activity.channelId;
        const choiceOptions: ChoiceFactoryOptions = this.choiceOptions || ConfirmInput.defaultChoiceOptions[locale].options;
        return this.appendChoices(prompt, channelId, choices, this.style, choiceOptions);
    }
}
