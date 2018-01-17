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

export interface IPromptAttachmentOptions extends IPromptOptions {
    /** (Optional) list of content types the prompt is waiting for. Types ending with '*' will be prefixed matched again the received attachment(s). */
    contentTypes?: string|string[];
}

export interface IPromptAttachmentFeatures extends IPromptFeatures {
    /** (Optional) The score that should be returned when attachments are detected. The default value is "1.0". */
    recognizeScore?: number;
}

export class PromptAttachment extends Prompt<IPromptAttachmentFeatures> {
    constructor(features?: IPromptAttachmentFeatures) {
        super({
            defaultRetryPrompt: 'default_file',
            defaultRetryNamespace: consts.Library.system,
            recognizeScore: 1.0
        });
        this.updateFeatures(features);

        // Default recognizer logic
        this.onRecognize((context, cb) => {
            if (context.message.attachments && !this.features.disableRecognizer) {
                // Filter to alowed attachment types.
                const options = <IPromptAttachmentOptions>context.dialogData.options;
                let contentTypes = typeof options.contentTypes == 'string' ? options.contentTypes.split('|') : options.contentTypes;
                let attachments: IAttachment[] = [];
                context.message.attachments.forEach((value) => {
                    if (this.allowed(value, contentTypes)) {
                        attachments.push(value);
                    }
                });

                // Return attachments
                if (attachments.length > 0) {
                    cb(null, this.features.recognizeScore, attachments);
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

    private allowed(attachment: IAttachment, contentTypes?: string[]): boolean {
        let allowed = false;
        if (contentTypes && contentTypes.length > 0) {
            const type = attachment.contentType.toLowerCase();
            for (let i = 0; !allowed && i < contentTypes.length; i++) {
                const filter = contentTypes[i].toLowerCase();
                if (filter.charAt(filter.length - 1) == '*') {
                    if (type.indexOf(filter.substr(0, filter.length - 1)) == 0) {
                        allowed = true;
                    }
                } else if (type === filter) {
                    allowed = true;
                }
            }
        } else {
            allowed = true;
        }
        return allowed;
    }
}