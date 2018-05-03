/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity } from 'botbuilder';
import { Choice } from './findChoices';
/**
 * Additional options used to tweak the formatting of choice lists.
 */
export interface ChoiceFactoryOptions {
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
     * choice as in "1. choice". If `false`, the list style will use a bulleted list instead. The
     * default value is `true`.
     */
    includeNumbers?: boolean;
}
/**
 * A set of utility functions to assist with the formatting a 'message' activity containing a list
 * of choices.
 *
 * @remarks
 * This example shows creating a message containing a list of choices that has been conditionally
 * formatted based on the capabilities of the underlying channel:
 *
 * ```JavaScript
 * const { ChoiceFactory } = require('botbuilder-choices');
 *
 * const message = ChoiceFactory.forChannel(context, ['red', 'green', 'blue'], `Pick a color.`);
 * await context.sendActivity(message);
 * ```
 */
export declare class ChoiceFactory {
    /**
     * Returns a 'message' activity containing a list of choices that has been automatically
     * formatted based on the capabilities of a given channel.
     *
     * @remarks
     * The algorithm prefers to format the supplied list of choices as suggested actions but can
     * decide to use a text based list if suggested actions aren't natively supported by the
     * channel, there are too many choices for the channel to display, or the title of any choice
     * is too long.
     *
     * If the algorithm decides to use a list it will use an inline list if there are 3 or less
     * choices and all have short titles. Otherwise, a numbered list is used.
     *
     * ```JavaScript
     * const message = ChoiceFactory.forChannel(context, [
     *    { value: 'red', action: { type: 'imBack', title: 'The Red Pill', value: 'red pill' } },
     *    { value: 'blue', action: { type: 'imBack', title: 'The Blue Pill', value: 'blue pill' } },
     * ], `Which do you choose?`);
     * await context.sendActivity(message);
     * ```
     * @param channelOrContext Channel ID or context object for the current turn of conversation.
     * @param choices List of choices to render.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to speak for the message.
     * @param options (Optional) formatting options to use when rendering as a list.
     */
    static forChannel(channelOrContext: string | TurnContext, choices: (string | Choice)[], text?: string, speak?: string, options?: ChoiceFactoryOptions): Partial<Activity>;
    /**
     * Returns a 'message' activity containing a list of choices that has been formatted as an
     * inline list.
     *
     * @remarks
     * This example generates a message text of "Pick a color: (1. red, 2. green, or 3. blue)":
     *
     * ```JavaScript
     * const message = ChoiceFactory.inline(['red', 'green', 'blue'], `Pick a color:`);
     * await context.sendActivity(message);
     * ```
     * @param choices List of choices to render.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to speak for the message.
     * @param options (Optional) formatting options to tweak rendering of list.
     */
    static inline(choices: (string | Choice)[], text?: string, speak?: string, options?: ChoiceFactoryOptions): Partial<Activity>;
    /**
     * Returns a 'message' activity containing a list of choices that has been formatted as an
     * numbered or bulleted list.
     *
     * @remarks
     * This example generates a message with the choices presented as a numbered list:
     *
     * ```JavaScript
     * const message = ChoiceFactory.list(['red', 'green', 'blue'], `Pick a color:`);
     * await context.sendActivity(message);
     * ```
     * @param choices List of choices to render.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to speak for the message.
     * @param options (Optional) formatting options to tweak rendering of list.
     */
    static list(choices: (string | Choice)[], text?: string, speak?: string, options?: ChoiceFactoryOptions): Partial<Activity>;
    /**
     * Returns a 'message' activity containing a list of choices that have been added as suggested
     * actions.
     *
     * @remarks
     * This example generates a message with the choices presented as suggested action buttons:
     *
     * ```JavaScript
     * const message = ChoiceFactory.suggestedAction(['red', 'green', 'blue'], `Pick a color:`);
     * await context.sendActivity(message);
     * ```
     * @param choices List of choices to add.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to speak for the message.
     */
    static suggestedAction(choices: (string | Choice)[], text?: string, speak?: string): Partial<Activity>;
    /**
     * Takes a mixed list of `string` and `Choice` based choices and returns them as a `Choice[]`.
     *
     * @remarks
     * This example converts a simple array of string based choices to a properly formated `Choice[]`.
     *
     * ```JavaScript
     * const choices = ChoiceFactory.toChoices(['red', 'green', 'blue']);
     * ```
     * @param choices List of choices to add.
     */
    static toChoices(choices: (string | Choice)[] | undefined): Choice[];
}
