/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { MessageFactory, TurnContext, ActionTypes, InputHints, Activity, CardAction } from 'botbuilder';
import { Choice } from './findChoices';
import * as channel from './channel';

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
    inlineOr?: string

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

export class ChoiceFactory {

    static forChannel(channelOrContext: string|TurnContext, choices: (string|Choice)[], text?: string, speak?: string, options?: ChoiceFactoryOptions): Partial<Activity> {
        const channelId = typeof channelOrContext === 'string' ? channelOrContext : channel.getChannelId(channelOrContext);

        // Normalize choices
        const list = ChoiceFactory.toChoices(choices);

        // Find maximum title length
        let maxTitleLength = 0;
        list.forEach((choice) => {
            let l = choice.action && choice.action.title ? choice.action.title.length : choice.value.length;
            if (l > maxTitleLength) {
                maxTitleLength = l;
            }
        });

        // Determine list style
        const supportsSuggestedActions = channel.supportsSuggestedActions(channelId, choices.length);
        const supportsCardActions = channel.supportsCardActions(channelId, choices.length);
        const maxActionTitleLength = channel.maxActionTitleLength(channelId);
        const hasMessageFeed = channel.hasMessageFeed(channelId);
        const longTitles = maxTitleLength > maxActionTitleLength;
        if (!longTitles && (supportsSuggestedActions || (!hasMessageFeed && supportsCardActions))) {
            // We always prefer showing choices using suggested actions. If the titles are too long, however,
            // we'll have to show them as a text list.
            return ChoiceFactory.suggestedAction(list, text, speak, options);
        } else if (!longTitles && choices.length <= 3) {
            // If the titles are short and there are 3 or less choices we'll use an inline list.
            return ChoiceFactory.inline(list, text, speak, options);
        } else {
            // Show a numbered list.
            return ChoiceFactory.list(list, text, speak, options);
        }
    }

    static inline(choices: (string|Choice)[], text?: string, speak?: string, options?: ChoiceFactoryOptions): Partial<Activity> {
        const opt = Object.assign({
            inlineSeparator: ', ',
            inlineOr: ' or ',
            inlineOrMore: ', or ',
            includeNumbers: true
        } as ChoiceFactoryOptions, options);

        // Format list of choices
        let connector = '';
        let txt = (text || '');
        txt += ' ';
        ChoiceFactory.toChoices(choices).forEach((choice: any, index: number) => {
            const title = choice.action && choice.action.title ? choice.action.title : choice.value;
            txt += `${connector}${opt.includeNumbers ? '(' + (index + 1).toString() + ') ' : ''}${title}`;
            if (index == (choices.length - 2)) {
                connector = (index == 0 ? opt.inlineOr : opt.inlineOrMore) || '';
            } else {
                connector = opt.inlineSeparator || '';
            }
        });
        txt += '';

        // Return activity with choices as an inline list.
        return MessageFactory.text(txt, speak, InputHints.ExpectingInput);
    }

    static list(choices: (string|Choice)[], text?: string, speak?: string, options?: ChoiceFactoryOptions): Partial<Activity> {
        const opt = Object.assign({
            includeNumbers: true
        } as ChoiceFactoryOptions, options);

        // Format list of choices
        let connector = '';
        let txt = (text || '');
        txt += '\n\n   ';
        ChoiceFactory.toChoices(choices).forEach((choice: any, index: number) => {
            const title = choice.action && choice.action.title ? choice.action.title : choice.value;
            txt += `${connector}${opt.includeNumbers ? (index + 1).toString() + '. ': '- '}${title}`;
            connector =  '\n   ';
        });

        // Return activity with choices as a numbered list.
        return MessageFactory.text(txt, speak, InputHints.ExpectingInput);
    }

    static suggestedAction(choices: (string|Choice)[], text?: string, speak?: string, options?: ChoiceFactoryOptions): Partial<Activity> {
        // Map choices to actions
        const actions = ChoiceFactory.toChoices(choices).map<CardAction>((choice) => {
            if (choice.action) {
                return choice.action;
            } else {
                return { type: ActionTypes.ImBack, value: choice.value, title: choice.value }
            }
        });

        // Return activity with choices as suggested actions
        return MessageFactory.suggestedActions(actions, text, speak, InputHints.ExpectingInput);
    }

    static toChoices(choices: (string|Choice)[]|undefined): Choice[] {
        return (choices || []).map((choice) => typeof choice === 'string' ? { value: choice } : choice).filter((choice) => choice);
    }

}