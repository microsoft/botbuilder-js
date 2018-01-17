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

import { Dialog, ResumeReason, IDialogResult, IRecognizeDialogContext } from './Dialog';
import { IRecognizeResult } from './IntentRecognizer';
import { Session } from '../Session';
import * as consts from '../consts';

export interface IDialogWaterfallStep {
    (session: Session, result?: any, skip?: (results?: IDialogResult<any>) => void): void;
}

export type BeforeWaterfallStepHandler = (session: Session, step: number, args: any, next: (step: number, args: any) => void) => void;

interface IWaterfallRecognizerResult extends IRecognizeResult {
    args?: any;
}

export class WaterfallDialog extends Dialog {
    private steps: IDialogWaterfallStep[];
    private _onBeforeStep: BeforeWaterfallStepHandler[] = [];

    constructor(steps: IDialogWaterfallStep|IDialogWaterfallStep[]) {
        super();
        if (steps) {
            this.steps = Array.isArray(steps) ? steps : [steps];
        } else {
            this.steps = [];
        }
    }

    public begin<T>(session: Session, args?: T): void {
        this.doStep(session, 0, args);
    }
 
    public replyReceived(session: Session, recognizeResult: IWaterfallRecognizerResult): void {
        this.doStep(session, 0, recognizeResult.args);        
    }

    public dialogResumed(session: Session, result: IDialogResult<any>): void {
        let step = session.dialogData[consts.Data.WaterfallStep];
        switch (result.resumed) {
            case ResumeReason.reprompt:
                // Ignore re-prompts
                return;
            case ResumeReason.back:
                step--;
                break;
            default:
                step++;
                break;

        }
        this.doStep(session, step, result);
    }

    public onBeforeStep(handler: BeforeWaterfallStepHandler): this {
        this._onBeforeStep.unshift(handler);
        return this;
    }

    /** Executes a waterfall step. */
    private doStep(session: Session, step: number, args: any): void {
        var skip = (result?: IDialogResult<any>) => {
            result = result || <any>{};
            if (result.resumed == null) {
                result.resumed = ResumeReason.forward;
            }
            this.dialogResumed(session, result);
        };

        // Call any onBeforeStep() handlers                
        this.beforeStep(session, step, args, (s, a) => {
            if (s >= 0) {
                if (s < this.steps.length) {
                    // Execute next step of the waterfall
                    try {
                        session.logger.log(session.dialogStack(), 'waterfall() step ' + (s + 1) + ' of ' + this.steps.length);
                        session.dialogData[consts.Data.WaterfallStep] = s;
                        this.steps[s](session, a, skip);
                    } catch (e) {
                        session.error(e);
                    }
                } else if (a && a.hasOwnProperty('resumed')) {
                    // End the current dialog and return results to parent
                    session.endDialogWithResult(a);
                } else {
                    // Empty waterfall so end dialog with not completed
                    session.logger.warn(session.dialogStack(), 'waterfall() empty waterfall detected');
                    session.endDialogWithResult({ resumed: ResumeReason.notCompleted });
                }
            }
        });
    }

    /** Calls any custom step handlers. */
    private beforeStep(session: Session, step: number, args: any, final: (step: number, args: any) => void): void {
        let index = 0;
        let handlers = this._onBeforeStep;
        function next(s: number, a: any) {
            try {
                if (index < handlers.length) {
                    handlers[index++](session, s, a, next);
                } else {
                    final(s, a);
                }
            } catch (e) {
                session.error(e);
            }
        }
        next(step, args);
    }

    static createHandler(steps: IDialogWaterfallStep[]): (session: Session, args?: any) => void {
        return function waterfallHandler(s: Session, r: IDialogResult<any>) {
            var skip = (result?: IDialogResult<any>) => {
                result = result || <any>{};
                if (result.resumed == null) {
                    result.resumed = ResumeReason.forward;
                }
                waterfallHandler(s, result);
            };

            // Check for continuation of waterfall
            if (r && r.hasOwnProperty('resumed')) {
                // Ignore re-prompts
                if (r.resumed !== ResumeReason.reprompt) {
                    // Adjust step based on users utterance
                    var step = s.dialogData[consts.Data.WaterfallStep];
                    switch (r.resumed) {
                        case ResumeReason.back:
                            step -= 1;
                            break;
                        default:
                            step++;
                    }

                    // Handle result
                    if (step >= 0 && step < steps.length) {
                        // Execute next step of the waterfall
                        try {
                            s.logger.log(s.dialogStack(), 'waterfall() step ' + step + 1 + ' of ' + steps.length);
                            s.dialogData[consts.Data.WaterfallStep] = step;
                            steps[step](s, r, skip);
                        } catch (e) {
                            s.error(e);
                        }
                    } else {
                        // End the current dialog and return results to parent
                        s.endDialogWithResult(r);
                    }
                }
            } else if (steps && steps.length > 0) {
                // Start waterfall
                try {
                    s.logger.log(s.dialogStack(), 'waterfall() step 1 of ' + steps.length);
                    s.dialogData[consts.Data.WaterfallStep] = 0;
                    steps[0](s, r, skip);
                } catch (e) {
                    s.error(e);
                }
            } else {
                // Empty waterfall so end dialog with not completed
                s.logger.warn(s.dialogStack(), 'waterfall() empty waterfall detected');
                s.endDialogWithResult({ resumed: ResumeReason.notCompleted });
            }
        }; 
    }
}
