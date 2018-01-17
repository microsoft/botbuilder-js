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
import { Prompt, IPromptOptions, IPromptFeatures, IPromptContext } from './Prompt';
import { PromptRecognizers } from './PromptRecognizers';
import * as consts from '../consts';

export class PromptTime extends Prompt<IPromptFeatures> {
    constructor(features?: IPromptFeatures) {
        super({
            defaultRetryPrompt: 'default_time',
            defaultRetryNamespace: consts.Library.system
        });
        this.updateFeatures(features);

        // Default recognizer logic
        this.onRecognize((context, cb) => {
            if (context.message.text && !this.features.disableRecognizer) {
                let options = <IPromptOptions>context.dialogData.options;
                let entities = PromptRecognizers.recognizeTimes(context, options);
                let top = PromptRecognizers.findTopEntity(entities);
                if (top) {
                    cb(null, top.score, top);
                } else {
                    cb(null, 0.0);
                }
            } else {
                cb(null, 0.0);
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