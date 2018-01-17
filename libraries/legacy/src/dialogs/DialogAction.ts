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
import { Dialog, IDialogResult, ResumeReason } from '../dialogs/Dialog';
import { PromptType } from '../dialogs/Prompt';
import { IPromptArgs } from '../deprecated/LegacyPrompts'
import { SimpleDialog } from '../dialogs/SimpleDialog';
import * as consts from '../consts';
import * as utils from '../utils';


export interface IDialogHandler<T> {
    (session: Session, args?: T): void;
}

export class DialogAction {
    static send(msg: string|string[]|IMessage|IIsMessage, ...args: any[]): IDialogHandler<any> {
        args.splice(0, 0, msg);
        return function sendAction(s: Session) {
            // Send a message to the user.
            Session.prototype.send.apply(s, args);
        };
    }

    static beginDialog<T>(id: string, args?: T): IDialogHandler<T> {
        return function beginDialogAction(s: Session, a: any) {
            // Handle calls where we're being resumed.
            if (a && a.hasOwnProperty('resumed')) {
                var r = <IDialogResult<any>>a;
                if (r.error) {
                    s.error(r.error);
                }
            } else  {
                // Merge args
                if (args) {
                    a = a || {};
                    for (var key in args) {
                        if (args.hasOwnProperty(key)) {
                            a[key] = (<any>args)[key];
                        }
                    }
                }

                // Begin a new dialog
                s.beginDialog(id, a);
            }
        };
    }

    static endDialog(result?: any): IDialogHandler<any> {
        return function endDialogAction(s: Session) {
            // End dialog
            s.endDialog(result);
        };
    }
    
    static validatedPrompt(promptType: PromptType, validator: (response: any) => boolean): Dialog {
        console.warn('DialogAction.validatedPrompt() has been deprecated as of version 3.8. Consider using custom prompts instead.');
        return new SimpleDialog((s: Session, r: IDialogResult<any>) => {
            r = r || <any>{};

            // Validate response
            var valid = false;
            if (r.response) {
                try {
                    valid = validator(r.response);
                } catch (e) {
                    s.error(e);
                }
            } 
            
            // Check for the user canceling the prompt
            var canceled = false;
            switch (r.resumed) {
                case ResumeReason.canceled:
                case ResumeReason.forward:
                case ResumeReason.back:
                    canceled = true;
                    break;
            }

            // Return results or prompt the user     
            if (valid || canceled) {
                // The user either entered a properly formatted response or they canceled by saying "nevermind"  
                s.endDialogWithResult(r);
            } else if (!s.dialogData.hasOwnProperty('prompt')) {
                // First call to the prompt so save args passed to the prompt
                s.dialogData = utils.clone(r);
                s.dialogData.promptType = promptType;
                if (!s.dialogData.hasOwnProperty('maxRetries')) {
                    s.dialogData.maxRetries = 2;
                }
                
                // Prompt user
                var a: IPromptArgs = utils.clone(s.dialogData);
                a.maxRetries = 0;
                s.beginDialog('BotBuilder:Prompts', a);
            } else if (s.dialogData.maxRetries > 0) {
                // Reprompt the user
                s.dialogData.maxRetries--;
                var a: IPromptArgs = utils.clone(s.dialogData);
                a.maxRetries = 0;
                a.prompt = s.dialogData.retryPrompt || "I didn't understand. " + s.dialogData.prompt;
                s.beginDialog('BotBuilder:Prompts', a);
            } else {
                // User failed to enter a valid response
                s.endDialogWithResult({ resumed: ResumeReason.notCompleted });
            }
        }); 
    }
}
