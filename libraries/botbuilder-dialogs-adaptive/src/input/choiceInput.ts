/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { InputDialogConfiguration, InputDialog, InputDialogOptions, InputState, PromptType } from "./inputDialog";
import { DialogContext, Choice, ListStyle, ChoiceFactoryOptions, FindChoicesOptions, ChoiceFactory, recognizeChoices, ModelResult, FoundChoice } from "botbuilder-dialogs";
import { Activity } from "botbuilder-core";
import { ExpressionPropertyValue, ExpressionProperty } from "../expressionProperty";

export interface ChoiceInputConfiguration extends InputDialogConfiguration {
    outputFormat?: ChoiceOutputFormat;
    choices?: ChoiceList | ExpressionPropertyValue<ChoiceList>;
    appendChoices?: boolean;
    defaultLocale?: string;
    style?: ListStyle;
    choiceOptions?: ChoiceFactoryOptions;
    recognizerOptions?: FindChoicesOptions;
}

export enum ChoiceOutputFormat {
    value = 'value',
    index = 'index'
}

export interface ChoiceInputOptions extends InputDialogOptions {
    choices: ChoiceList;
}

export type ChoiceList = (string | Choice)[];

export class ChoiceInput extends InputDialog<ChoiceInputOptions> {
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

    public outputFormat = ChoiceOutputFormat.value;

    public choices: ExpressionProperty<ChoiceList>;

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
     * Additional options passed to the underlying `recognizeChoices()` function.
     */
    public recognizerOptions?: FindChoicesOptions;

    constructor();
    constructor(property: string, prompt: PromptType, choices: ChoiceList | ExpressionPropertyValue<ChoiceList>);
    constructor(property: string, value: ExpressionPropertyValue<any>, prompt: PromptType, choices: ChoiceList | ExpressionPropertyValue<ChoiceList>);
    constructor(property?: string, value?: ExpressionPropertyValue<any> | PromptType, prompt?: PromptType | ChoiceList | ExpressionPropertyValue<ChoiceList>, choices?: ChoiceList | ExpressionPropertyValue<ChoiceList>) {
        super();
        if (property) {
            if (choices == undefined) {
                choices = prompt as ChoiceList | ExpressionPropertyValue<any[]>;
                prompt = value;
                value = undefined;
            }

            // Initialize properties
            this.property = property;
            if (value !== undefined) { this.value = new ExpressionProperty(value as any) }
            this.prompt.value = prompt as PromptType;

            // If we were passed in a choice list then create a lambda that returns the list.
            const expression = Array.isArray(choices) ? _ => choices : choices;
            this.choices = new ExpressionProperty(expression as ExpressionPropertyValue<ChoiceList>);
        }
    }

    public configure(config: ChoiceInputConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'choice':
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

    protected onComputeId(): string {
        return `ChoiceInput[${this.prompt.value.toString()}]`;
    }

    protected onInitializeOptions(dc: DialogContext, options: ChoiceInputOptions): ChoiceInputOptions {
        if (!Array.isArray(options.choices)) {
            if (this.choices) {
                // Compute list of choices
                const memory = dc.state;
                const value = this.choices.evaluate(this.id, memory);
                if (Array.isArray(value)) {
                    options.choices = value;
                } else {
                    throw new Error(`${this.id}: no choices returned by expression.`);
                }
            } else {
                throw new Error(`${this.id}: no choices specified.`);
            }
        }
        return super.onInitializeOptions(dc, options);
    }

    protected async onRecognizeInput(dc: DialogContext, consultation: boolean): Promise<InputState> {
        // Get input and options
        let input: string = dc.state.getValue(InputDialog.VALUE_PROPERTY).value.toString();
        const options: ChoiceInputOptions = dc.state.getValue(InputDialog.OPTIONS_PROPERTY).value;

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
        const options: ChoiceInputOptions = dc.state.getValue(InputDialog.OPTIONS_PROPERTY).value;
        const choices = ChoiceFactory.toChoices(options.choices);

        // Format prompt to send
        const prompt = super.onRenderPrompt(dc, state);
        const channelId: string = dc.context.activity.channelId;
        const choiceOptions: ChoiceFactoryOptions = this.choiceOptions || ChoiceInput.defaultChoiceOptions[locale];
        return this.appendChoices(prompt, channelId, choices, this.style, choiceOptions);
    }
}
