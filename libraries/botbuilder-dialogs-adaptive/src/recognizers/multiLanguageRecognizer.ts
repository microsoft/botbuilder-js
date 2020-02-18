/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { RecognizerResult, Activity, ActivityTypes } from 'botbuilder-core';
import { Configurable, DialogContext } from 'botbuilder-dialogs';
import { Recognizer } from './recognizer';
import { LanguagePolicy } from '../languagePolicy';

export interface MultiLanguageRecognizerConfiguration {
    id?: string;
    recognizers?: { [locale: string]: Recognizer };
}

export class MultiLanguageRecognizer extends Configurable implements Recognizer {

    public static declarativeType = 'Microsoft.MultiLanguageRecognizer';

    public id: string;

    public languagePolicy: any = LanguagePolicy.defaultPolicy;

    public recognizers: { [locale: string]: Recognizer };

    public configure(config: MultiLanguageRecognizerConfiguration): this {
        return super.configure(config);
    }

    public async recognize(dialogContext: DialogContext): Promise<RecognizerResult>;
    public async recognize(dialogContext: DialogContext, textOrActivity: Activity): Promise<RecognizerResult>;
    public async recognize(dialogContext: DialogContext, textOrActivity?: string | Activity, locale?: string): Promise<RecognizerResult> {
        let text = '';
        if (!textOrActivity) {
            const activity: Activity = dialogContext.context.activity;
            if (activity && activity.type == ActivityTypes.Message) {
                text = activity.text || '';
                locale = activity.locale;
            }
        } else if (typeof (textOrActivity) == 'object') {
            const activity: Activity = textOrActivity;
            if (activity.type == ActivityTypes.Message) {
                text = activity.text || '';
                locale = activity.locale;
            }
        } else if (typeof (textOrActivity) == 'string') {
            text = textOrActivity || '';
        }

        locale = locale ? locale : '';
        let policy: string[];
        if (this.languagePolicy.hasOwnProperty(locale)) {
            policy = this.languagePolicy[locale];
        } else {
            policy = [''];
        }

        for (let i = 0; i < policy.length; i++) {
            const option = policy[i];
            if (this.recognizers.hasOwnProperty(option)){
                const recognizer = this.recognizers[option];
                return await recognizer.recognize(dialogContext, text, locale);
            }
        }

        const recognizerResult: RecognizerResult = {
            text: text,
            intents: {},
            entities: {}
        };
        return recognizerResult;
    }
}