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
import { Dialog, ResumeReason } from './Dialog';
import { systemLib, IRouteResult } from '../bots/Library';
import { LegacyPrompts, IPromptsOptions } from '../deprecated/LegacyPrompts';
import { IChoice } from './PromptRecognizers';
import { IPromptOptions, PromptType } from './Prompt';
import { PromptAttachment, IPromptAttachmentOptions } from './PromptAttachment';
import { PromptChoice, IPromptChoiceOptions } from './PromptChoice';
import { PromptConfirm } from './PromptConfirm';
import { PromptNumber, IPromptNumberOptions } from './PromptNumber';
import { PromptText, IPromptTextOptions } from './PromptText';
import { PromptTime } from './PromptTime';
import * as consts from '../consts';
import * as utils from '../utils';

export interface IDisambiguateChoices {
    [label: string]: IRouteResult;
}

interface IPrompts {
    text(session: Session, prompt: TextOrMessageType, options?: IPromptTextOptions): void;
    number(session: Session, prompt: TextOrMessageType, options?: IPromptNumberOptions): void;
    confirm(session: Session, prompt: TextOrMessageType, options?: IPromptOptions): void;
    choice(session: Session, prompt: TextOrMessageType, choices: string|(string|IChoice)[]|Object, options?: IPromptChoiceOptions): void;
    time(session: Session, prompt: TextOrMessageType, options?: IPromptOptions): void;
    attachment(session: Session, prompt: TextOrMessageType, options?: IPromptAttachmentOptions): void;
    disambiguate(session: Session, prompt: TextOrMessageType, choices: IDisambiguateChoices, options?: IPromptOptions): void;
    customize(type: PromptType, dialog: Dialog): IPrompts;
}

const promptPrefix = consts.Library.system + ':prompt-';

export const Prompts = <IPrompts>{
    text: (session, prompt, options) => {
        validateSession(session);
        let args: IPromptTextOptions = utils.clone(options || {});
        args.prompt = prompt || options.prompt;
        session.beginDialog(promptPrefix + 'text', args);
    },
    number: (session, prompt, options) => {
        validateSession(session);
        let args: IPromptNumberOptions = utils.clone(options || {});
        args.prompt = prompt || options.prompt;
        session.beginDialog(promptPrefix + 'number', args);
    },
    confirm: (session, prompt, options) => {
        validateSession(session);
        let args: IPromptOptions = utils.clone(options || {});
        args.prompt = prompt || options.prompt;
        session.beginDialog(promptPrefix + 'confirm', args);
    },
    choice: (session, prompt, choices, options) => {
        validateSession(session);
        let args: IPromptChoiceOptions = utils.clone(options || {});
        args.prompt = prompt || options.prompt;
        if (choices) {
            // Map choices
            args.choices = [];
            if (Array.isArray(choices)) {
                choices.forEach((value) => {
                    if (typeof value === 'string') {
                        args.choices.push({ value: value });
                    } else {
                        args.choices.push(value);
                    }
                });
            } else if (typeof choices === 'string') {
                choices.split('|').forEach((value) => {
                    args.choices.push({ value: value });
                });
            } else {
                for (let key in choices) {
                    if (choices.hasOwnProperty(key)) {
                        args.choices.push({ value: key });
                    }
                }
            }
        }
        session.beginDialog(promptPrefix + 'choice', args);
    },
    time: (session, prompt, options) => {
        validateSession(session);
        let args: IPromptOptions = utils.clone(options || {});
        args.prompt = prompt || options.prompt;
        session.beginDialog(promptPrefix + 'time', args);
    },
    attachment: (session, prompt, options) => {
        validateSession(session);
        let args: IPromptOptions = utils.clone(options || {});
        args.prompt = prompt || options.prompt;
        session.beginDialog(promptPrefix + 'attachment', args);
    },
    disambiguate: (session, prompt, choices, options) => {
        validateSession(session);
        session.beginDialog(consts.DialogId.Disambiguate, {
            prompt: prompt,
            choices: choices,
            options: options
        });
    },
    customize: (type, dialog) => {
        systemLib.dialog(promptPrefix + PromptType[type], dialog, true);
        return this;
    },
    configure: (options: IPromptOptions) => {
        console.warn("Prompts.configure() has been deprecated as of version 3.8. Consider using custom prompts instead.");
        LegacyPrompts.configure(options);
    }
};

function validateSession(session: Session): void {
    // Make sure that the session is passed, otherwise throw a clear error 
    if (!session || typeof session != 'object') {
        throw 'Session should be provided as first parameter.';
    }
}

// Install base prompts
Prompts.customize(PromptType.attachment, new PromptAttachment());
Prompts.customize(PromptType.choice, new PromptChoice());
Prompts.customize(PromptType.confirm, new PromptConfirm());
Prompts.customize(PromptType.number, new PromptNumber());
Prompts.customize(PromptType.text, new PromptText());
Prompts.customize(PromptType.time, new PromptTime());

/**
 * Internal dialog that prompts a user to confirm a cancelAction().
 * dialogArgs: { 
 *      localizationNamespace: string;
 *      confirmPrompt: string; 
 *      message?: string;
 *      dialogIndex?: number;
 *      endConversation?: boolean;
 * }
 */
systemLib.dialog(consts.DialogId.ConfirmCancel, [
    function (session, args) {
        session.dialogData.localizationNamespace = args.localizationNamespace;
        session.dialogData.dialogIndex = args.dialogIndex;
        session.dialogData.message = args.message;
        session.dialogData.endConversation = args.endConversation;
        Prompts.confirm(session, args.confirmPrompt, { localizationNamespace: args.localizationNamespace });
    },
    function (session, results) {
        if (results.response) {
            // Send optional message
            var args = session.dialogData;
            if (args.message) {
                session.sendLocalized(args.localizationNamespace, args.message);
            }

            // End conversation or cancel dialog
            if (args.endConversation) {
                session.endConversation();
            } else {
                session.cancelDialog(args.dialogIndex);
            }
        } else {
            session.endDialogWithResult({ resumed: ResumeReason.reprompt });
        }
    }
]);

/**
 * Internal dialog that prompts a user to confirm a that a root dialog should be
 * interrupted with a new dialog.
 * dialogArgs: { 
 *      localizationNamespace: string;
 *      confirmPrompt: string; 
 *      dialogId: string;
 *      dialogArgs?: any;
 * }
 */
systemLib.dialog(consts.DialogId.ConfirmInterruption, [
    function (session, args) {
        session.dialogData.dialogId = args.dialogId;
        session.dialogData.dialogArgs = args.dialogArgs;
        Prompts.confirm(session, args.confirmPrompt, { localizationNamespace: args.localizationNamespace });
    },
    function (session, results) {
        if (results.response) {
            var args = session.dialogData;
            session.clearDialogStack();
            session.beginDialog(args.dialogId, args.dialogArgs);
        } else {
            session.endDialogWithResult({ resumed: ResumeReason.reprompt });
        }
    }
]);

/**
 * Begins a new dialog as an interruption. If the stack has a depth of 1 that means
 * only the interruption exists so it will be replaced with the new dialog. Otherwise,
 * the interruption will stay on the stack and ensure that ResumeReason.reprompt is
 * returned.  This is to fix an issue with waterfalls that they can advance when we
 * don't want them too.
 * dialogArgs: { 
 *      dialogId: string; 
 *      dialogArgs?: any;
 *      isRootDialog?: boolean;
 * }
 */
systemLib.dialog(consts.DialogId.Interruption, [
    function (session, args) {
        if (session.sessionState.callstack.length > 1) {
            session.beginDialog(args.dialogId, args.dialogArgs);
        } else {
            session.replaceDialog(args.dialogId, args.dialogArgs);
        }
    },
    function (session, results) {
        session.endDialogWithResult({ resumed: ResumeReason.reprompt });
    }
]);


/**
 * Prompts the user to disambiguate between multiple routes that were troggered.
 * dialogArgs: { 
 *      prompt: string|string[]|IMessage|IIsMessage;
 *      choices: IDisambiguateChoices;
 *      options?: IPromptsOptions;
 * }
 */
systemLib.dialog(consts.DialogId.Disambiguate, [
    function (session, args) {
        // Prompt user
        session.dialogData.choices = args.choices;
        Prompts.choice(session, args.prompt, args.choices, args.options);
    },
    function (session, results) {
        var route = session.dialogData.choices[results.response.entity];
        if (route) {
            // Pop ourselves off the stack
            var stack = session.dialogStack();
            stack.pop();
            session.dialogStack(stack);

            // Route to action
            session.library.library(route.libraryName).selectRoute(session, route);
        } else {
            // Return with reprompt
            session.endDialogWithResult({ resumed: ResumeReason.reprompt });
        }
    }
]);
