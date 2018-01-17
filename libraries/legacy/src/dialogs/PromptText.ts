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
import { Prompt, IPromptFeatures, IPromptOptions, IPromptContext } from './Prompt';
import * as consts from '../consts';

export interface IPromptTextOptions extends IPromptOptions {
    /** (Optional) minimum value that can be recognized. */
    minLength?: number;

    /** (Optional) maximum value that can be recognized. */
    maxLength?: number;
}

export interface IPromptTextFeatures extends IPromptFeatures {
    /** (Optional) The score that should be returned when the prompts `onRecognize()` handler is called. The default value is "0.5". */
    recognizeScore?: number;
}

export class PromptText extends Prompt<IPromptTextFeatures> {
    constructor(features?: IPromptTextFeatures) {
        super({
            defaultRetryPrompt: 'default_text',
            defaultRetryNamespace: consts.Library.system,
            recognizeScore: 0.5
        });
        this.updateFeatures(features);

        // Default recognizer logic
        this.onRecognize((context, cb) => {
          const text = context.message.text;

            if (text && !this.features.disableRecognizer) {
                const options = context.dialogData.options

                if ((options.minLength && text.length < Number(options.minLength)) ||
                      (options.maxLength && text.length > Number(options.maxLength))) {
                    cb(null, 0.0);
                } else {
                    cb(null, this.features.recognizeScore, text);
                }
            } else {
                cb(null, 0.0);
            }
        });

        this.onFormatMessage((session, text, speak, callback) => {
            const context = (<IPromptContext>session.dialogData);
            const options = (<IPromptTextOptions>context.options);
            const turnZero = context.turns === 0 || context.isReprompt;
            const message = session.message.text

            if (!turnZero && (options.minLength || options.maxLength)) {
                var errorPrompt: string;

                if (options.minLength && message.length < Number(options.minLength)) {
                    errorPrompt = 'text_minLength_error';
                } else if (options.maxLength && message.length > Number(options.maxLength)) {
                    errorPrompt = 'text_maxLength_error';
                }

                if (errorPrompt) {
                    let text = Prompt.gettext(session, errorPrompt, consts.Library.system);
                    let msg = <IMessage>{ text: session.gettext(text, options) };

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
