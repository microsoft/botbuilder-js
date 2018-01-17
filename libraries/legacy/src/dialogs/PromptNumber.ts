// 
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
// 
// Microsoft Bot Framework: http://botframework.com
// 
// Bot Builder SDK Github:
// https://github.com/Microsoft/BotBuilder
// 
// Copyright (c) Microsoft Corporation
// All rights reserved.
// 
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { Session } from '../Session';
import { Prompt, IPromptContext, IPromptOptions, IPromptFeatures } from './Prompt';
import { IRecognizeContext } from './IntentRecognizer';
import { PromptRecognizers } from './PromptRecognizers';
import * as consts from '../consts';

export interface IPromptNumberOptions extends IPromptOptions {
    /** (Optional) minimum value that can be recognized. */
    minValue?: number;

    /** (Optional) maximum value that can be recognized. */
    maxValue?: number;

    /** (Optional) if true, then only integers will be recognized. */
    integerOnly?: boolean;
}

export class PromptNumber extends Prompt<IPromptFeatures> {
    constructor(features?: IPromptFeatures) {
        super({
            defaultRetryPrompt: 'default_number',
            defaultRetryNamespace: consts.Library.system
        });
        this.updateFeatures(features);

        // Default recognizer logic
        this.onRecognize((context, cb) => {
            if (context.message.text && !this.features.disableRecognizer) {
                let options: IPromptNumberOptions = context.dialogData.options;
                let entities = PromptRecognizers.recognizeNumbers(context, options);
                let top = PromptRecognizers.findTopEntity(entities);
                if (top) {
                    cb(null, top.score, top.entity);
                } else {
                    cb(null, 0.0);
                }
            } else {
                cb(null, 0.0);
            }
        });

        this.onFormatMessage((session, text, speak, callback) => {
            const context = (<IPromptContext>session.dialogData);
            const options = (<IPromptNumberOptions>context.options);
            const hasMinValue = typeof options.minValue === 'number';
            const hasMaxValue = typeof options.maxValue === 'number';
            const hasIntegerOnly = options.integerOnly;
            const turnZero = context.turns === 0 || context.isReprompt;
            if (!turnZero && (hasMinValue || hasMaxValue || hasIntegerOnly)) {
                // Find error prompt
                let errorPrompt: string;
                let context = session.toRecognizeContext();
                let top = PromptRecognizers.findTopEntity(PromptRecognizers.recognizeNumbers(context));
                if (top) {
                    let value = top.entity;
                    let bellowMin = hasMinValue && value < options.minValue;
                    let aboveMax = hasMaxValue && value > options.maxValue;
                    let notInteger = hasIntegerOnly && Math.floor(value) !== value; 
                    if (hasMinValue && hasMaxValue && (bellowMin || aboveMax)) {
                        errorPrompt = 'number_range_error';
                    } else if (hasMinValue && bellowMin) {
                        errorPrompt = 'number_minValue_error';
                    } else if (hasMaxValue && aboveMax) {
                        errorPrompt = 'number_maxValue_error';
                    } else if (hasIntegerOnly && notInteger) {
                        errorPrompt = 'number_integer_error';
                    }
                }

                // Format error message
                if (errorPrompt) {
                    let text = Prompt.gettext(session, errorPrompt, consts.Library.system);
                    let msg = <IMessage>{ text: session.gettext(text, options) };
                    if (speak) {
                        msg.speak = Prompt.gettext(session, speak);
                    }
                    callback(null, msg);
                } else {
                    callback(null, null);
                }
            } else {
                callback(null, null);
            }
        });

        // Add repeat intent handler
        this.matches(consts.Intents.Repeat, (session) => {
            // Set to turn-0 and re-prompt.
            (<IPromptContext>session.dialogData).turns = 0;
            this.sendPrompt(session);
        });
    }

}