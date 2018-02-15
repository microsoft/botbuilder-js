import { Activity } from 'botbuilder';
import { Choice } from './findChoices';
export interface ChoiceStylerOptions {
    /**
     * (Optional) character used to separate individual choices when there are more than 2 choices.
     * The default value is `", "`.
     */
    inlineSeparator?: string;
    /**
     * (Optional) separator inserted between the choices when their are only 2 choices. The default
     * value is `" or "`.
     */
    inlineOr?: string;
    /**
     * (Optional) separator inserted between the last 2 choices when their are more than 2 choices.
     * The default value is `", or "`.
     */
    inlineOrMore?: string;
    /**
     * (Optional) if `true`, inline and list style choices will be prefixed with the index of the
     * choice as in "1. choice". If `false`, the list style will use a bulleted list instead. The default value is `true`.
     */
    includeNumbers?: boolean;
}
export declare class ChoiceStyler {
    static forChannel(channelOrContext: string | BotContext, choices: (string | Choice)[], text?: string, speak?: string, options?: ChoiceStylerOptions): Partial<Activity>;
    static inline(choices: (string | Choice)[], text?: string, speak?: string, options?: ChoiceStylerOptions): Partial<Activity>;
    static list(choices: (string | Choice)[], text?: string, speak?: string, options?: ChoiceStylerOptions): Partial<Activity>;
    static suggestedAction(choices: (string | Choice)[], text?: string, speak?: string, options?: ChoiceStylerOptions): Partial<Activity>;
    static toChoices(choices: (string | Choice)[] | undefined): Choice[];
}
