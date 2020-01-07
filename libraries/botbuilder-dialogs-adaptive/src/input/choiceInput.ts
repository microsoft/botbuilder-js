/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext, Choice, ListStyle, ChoiceFactoryOptions, FindChoicesOptions, ChoiceFactory, recognizeChoices, ModelResult, FoundChoice } from 'botbuilder-dialogs';
import { Activity } from 'botbuilder-core';
import { InputDialogConfiguration, InputDialog, InputState } from './inputDialog';
import { ExpressionProperty } from '../expressionProperty';

export interface ChoiceInputConfiguration extends InputDialogConfiguration {
    choices?: ExpressionProperty<Choice[]>;
    style?: ListStyle;
    defaultLocale?: string;
    outputFormat?: ChoiceOutputFormat;
    choiceOptions?: ChoiceFactoryOptions;
    recognizerOptions?: FindChoicesOptions;
}

export enum ChoiceOutputFormat {
    value = 'value',
    index = 'index'
}

export interface ChoiceInputOptions {
    choices: Choice[];
}

export class ChoiceInput extends InputDialog {

    public static declarativeType = 'Microsoft.ChoiceInput';

    /**
     * Default options for rendering the choices to the user based on locale.
     */
    private static defaultChoiceOptions: { [locale: string]: ChoiceFactoryOptions } = {
        'es-es': { inlineSeparator: ', ', inlineOr: ' o ', inlineOrMore: ', o ', includeNumbers: true },
        'nl-nl': { inlineSeparator: ', ', inlineOr: ' of ', inlineOrMore: ', of ', includeNumbers: true },
        'en-us': { inlineSeparator: ', ', inlineOr: ' or ', inlineOrMore: ', or ', includeNumbers: true },
        'fr-fr': { inlineSeparator: ', ', inlineOr: ' ou ', inlineOrMore: ', ou ', includeNumbers: true },
        'de-de': { inlineSeparator: ', ', inlineOr: ' oder ', inlineOrMore: ', oder ', includeNumbers: true },
        'ja-jp': { inlineSeparator: '、 ', inlineOr: ' または ', inlineOrMore: '、 または ', includeNumbers: true },
        'pt-br': { inlineSeparator: ', ', inlineOr: ' ou ', inlineOrMore: ', ou ', includeNumbers: true },
        'zh-cn': { inlineSeparator: '， ', inlineOr: ' 要么 ', inlineOrMore: '， 要么 ', includeNumbers: true }
    };

    /**
     * List of choices to present to user.
     */
    public choices: ExpressionProperty<Choice[]>;

    /**
     * Style of the "yes" and "no" choices rendered to the user when prompting.
     *
     * @remarks
     * Defaults to `ListStyle.auto`.
     */
    public style: ListStyle = ListStyle.auto;

    /**
     * The prompts default locale that should be recognized.
     */
    public defaultLocale?: string;

    /**
     * Control the format of the response (value or index of the choice).
     */
    public outputFormat = ChoiceOutputFormat.value;

    /**
     * Additional options passed to the `ChoiceFactory` and used to tweak the style of choices
     * rendered to the user.
     */
    public choiceOptions?: ChoiceFactoryOptions;

    /**
     * Additional options passed to the underlying `recognizeChoices()` function.
     */
    public recognizerOptions?: FindChoicesOptions;

    public configure(config: ChoiceInputConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'choices':
                        // If we were passed in a choice list then create a lambda that returns the list.
                        const expression = Array.isArray(value) ? _ => value : value;
                        this.choices = new ExpressionProperty(expression);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    protected onInitializeOptions(dc: DialogContext, options: ChoiceInputOptions): ChoiceInputOptions {
        if (!options || !options.choices || options.choices.length == 0) {
            if (!options) {
                options = { choices: [] };
            }
            const choices = this.choices.getValue(dc.state);
            options.choices = choices;
        }
        return super.onInitializeOptions(dc, options);
    }

    protected async onRecognizeInput(dc: DialogContext): Promise<InputState> {
        // Get input and options
        let input: string = dc.state.getValue(InputDialog.VALUE_PROPERTY).toString();
        const options: ChoiceInputOptions = dc.state.getValue(InputDialog.OPTIONS_PROPERTY);

        // Format choices
        const choices = ChoiceFactory.toChoices(options.choices);

        // Initialize recognizer options
        const activity: Activity = dc.context.activity;
        const opt: FindChoicesOptions = Object.assign({}, this.recognizerOptions);
        opt.locale = activity.locale || opt.locale || this.defaultLocale || 'en-us';

        // Recognize input
        const results: ModelResult<FoundChoice>[] = recognizeChoices(input, choices, opt);
        if (!Array.isArray(results) || results.length == 0) {
            return InputState.unrecognized;
        }

        // Format output and return success
        const foundChoice: FoundChoice = results[0].resolution;
        switch (this.outputFormat) {
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

    protected onRenderPrompt(dc: DialogContext, state: InputState): Partial<Activity> {
        // Determine locale
        let locale: string = dc.context.activity.locale || this.defaultLocale;
        if (!locale || !ChoiceInput.defaultChoiceOptions.hasOwnProperty(locale)) {
            locale = 'en-us';
        }

        // Format choices
        const options: ChoiceInputOptions = dc.state.getValue(InputDialog.OPTIONS_PROPERTY);
        const choices = ChoiceFactory.toChoices(options.choices);

        // Format prompt to send
        const prompt = super.onRenderPrompt(dc, state);
        const channelId: string = dc.context.activity.channelId;
        const choiceOptions: ChoiceFactoryOptions = this.choiceOptions || ChoiceInput.defaultChoiceOptions[locale];
        return this.appendChoices(prompt, channelId, choices, this.style, choiceOptions);
    }

    protected onComputeId(): string {
        return `ChoiceInput[${ this.prompt.value.toString() }]`;
    }

}
