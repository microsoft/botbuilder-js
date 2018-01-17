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
import { IRecognizeContext, IRecognizeResult, IIntentRecognizerResult } from './IntentRecognizer';
import { IRouteResult } from '../bots/Library';
import * as consts from '../consts';
import * as utils from '../utils';
import * as async from 'async';

export interface IActionHandler {
    (session: Session, args: IActionRouteData): void;
}

export interface IDialogActionOptions {
    matches?: RegExp|RegExp[]|string|string[];
    intentThreshold?: number;
    onFindAction?: (context: IFindActionRouteContext, callback: (err: Error | null, score: number, routeData?: IActionRouteData) => void) => void;
    onSelectAction?: (session: Session, args?: any, next?: Function) => void;
}

export interface IBeginDialogActionOptions extends IDialogActionOptions {
    dialogArgs?: any;
}

export interface ITriggerActionOptions extends IBeginDialogActionOptions {
    confirmPrompt?: string;
    onInterrupted?: (session: Session, dialogId: string, dialogArgs?: any, next?: Function) => void;
}

export interface ICancelActionOptions extends IDialogActionOptions {
    confirmPrompt?: string|string[]|IMessage|IIsMessage;
}

export interface IActionRouteData {
    action?: string;
    intent?: IIntentRecognizerResult;
    data?: string;
    dialogId?: string;
    dialogIndex?: number;
    libraryName?: string;
}

export interface IFindActionRouteContext extends IRecognizeContext {
    routeType: string;
}

export class ActionSet {
    private actions: { [name: string]: IActionHandlerEntry; } = {};
    private trigger: IInteruptDialogOptions;

    public clone(copyTo?: ActionSet): ActionSet {
        var obj = copyTo || new ActionSet();
        obj.trigger = this.trigger;
        for (var name in this.actions) {
            obj.actions[name] = this.actions[name];
        }
        return obj;
    }

    public addDialogTrigger(actions: ActionSet, dialogId: string): void {
        if (this.trigger) {
            this.trigger.localizationNamespace = dialogId.split(':')[0];
            actions.beginDialogAction(dialogId, dialogId, this.trigger);
        }
    }

    public findActionRoutes(context: IFindActionRouteContext, callback: (err: Error, results: IRouteResult[]) => void): void {
        var results = [{ score: 0.0, libraryName: context.libraryName }];
        function addRoute(route: IRouteResult) {
            if (route.score > 0 && route.routeData) {
                (<IActionRouteData>route.routeData).libraryName = context.libraryName;
                if (route.score > results[0].score) {
                    results = [route];
                } else if (route.score == results[0].score) {
                    results.push(route);
                }
            }
        }

        function matchExpression(action: string, entry: IActionHandlerEntry, cb: (err: Error, score: number, routeData: IActionRouteData) => void) {
            if (entry.options.matches) {
                // Find best match
                var bestScore = 0.0;
                var routeData: IActionRouteData;
                var matches = Array.isArray(entry.options.matches) ? entry.options.matches : [entry.options.matches];
                matches.forEach((exp) => {
                    if (typeof exp == 'string') {
                        if (context.intent && exp === context.intent.intent && context.intent.score > bestScore) {
                            bestScore = context.intent.score;
                            routeData = {
                                action: action,
                                intent: context.intent
                            };
                        }
                    } else {
                        var matches = exp.exec(text);
                        if (matches && matches.length) {
                            // Score is coverage on a scale of 0.4 - 1.0.
                            var intent: IIntentRecognizerResult = {
                                score: 0.4 + ((matches[0].length / text.length) * 0.6),
                                intent: exp.toString(),
                                expression: exp,
                                matched: matches
                            }
                            if (intent.score > bestScore) {
                                bestScore = intent.score;
                                routeData = { 
                                    action: action,
                                    intent: intent
                                };
                            }
                        }
                    }
                });

                // Return best match
                var intentThreshold = entry.options.intentThreshold || 0.1;
                if (bestScore >= intentThreshold) {
                    cb(null, bestScore, routeData);
                } else {
                    cb(null, 0.0, null);
                }
            } else {
                cb(null, 0.0, null);
            }
        }

        var text = context.message.text || '';
        if (text.indexOf('action?') == 0) {
            var parts = text.split('?')[1].split('=');
            var name = parts[0];
            if (this.actions.hasOwnProperty(name)) {
                var options = this.actions[name].options;
                var routeData: IActionRouteData = { action: name };
                if (parts.length > 1) {
                    parts.shift();
                    routeData.data = parts.join('=');
                }
                addRoute({
                   score: 1.0,
                   libraryName: context.libraryName,
                   routeType: context.routeType,
                   routeData: routeData
                });
            }
            callback(null, results);
        } else {
            async.forEachOf(this.actions, (entry: IActionHandlerEntry, action: string, cb: (err?: Error) => void) => {
                if (entry.options.onFindAction) {
                    entry.options.onFindAction(context, (err, score, routeData) => {
                        if (!err) {
                            routeData = routeData || {};
                            routeData.action = action;
                            addRoute({
                                score: score,
                                libraryName: context.libraryName,
                                routeType: context.routeType,
                                routeData: routeData
                            });
                        }
                        cb(err);
                    });
                } else {
                    matchExpression(action, entry, (err, score, routeData) => {
                        if (!err && routeData) {
                            addRoute({
                                score: score,
                                libraryName: context.libraryName,
                                routeType: context.routeType,
                                routeData: routeData
                            });
                        }
                        cb(err);
                    });
                }
            }, (err) => {
                if (!err) {
                    callback(null, results);
                } else {
                    callback(err, null);
                }
            });
        }
    }

    public selectActionRoute(session: Session, route: IRouteResult): void {
        function next() {
            // Call default handler
            entry.handler(session, routeData);
        }

        var routeData = <IActionRouteData>route.routeData;
        var entry = this.actions[routeData.action];
        if (entry.options.onSelectAction) {
            // Call custom handler
            entry.options.onSelectAction(session, routeData, next);
        } else {
            next();
        }
    }

    public dialogInterrupted(session: Session, dialogId: string, dialogArgs: any): void {
        var trigger = this.trigger;
        function next() {
            if (trigger && trigger.confirmPrompt) {
                session.beginDialog(consts.DialogId.ConfirmInterruption, {
                    dialogId: dialogId,
                    dialogArgs: dialogArgs,
                    confirmPrompt: trigger.confirmPrompt,
                    localizationNamespace: trigger.localizationNamespace
                });
            } else {
                session.clearDialogStack();
                session.beginDialog(dialogId, dialogArgs);
            }
        }

        if (trigger && trigger.onInterrupted) {
            // Call custom handler
            this.trigger.onInterrupted(session, dialogId, dialogArgs, next);
        } else {
            next();
        }
    }

    public cancelAction(name: string, msg?: string|string[]|IMessage|IIsMessage, options?: ICancelActionOptions): this {
        return this.action(name, (session, args) => {
            if (options.confirmPrompt) {
                session.beginDialog(consts.DialogId.ConfirmCancel, {
                    localizationNamespace: args.libraryName,
                    confirmPrompt: options.confirmPrompt,
                    dialogIndex: args.dialogIndex,
                    message: msg 
                });
            } else {
                if (msg) {
                    session.sendLocalized(args.libraryName, msg);
                }
                session.cancelDialog(args.dialogIndex);
            }
        }, options);
    }

    public reloadAction(name: string, msg?: string|string[]|IMessage|IIsMessage, options: IBeginDialogActionOptions = {}): this {
        return this.action(name, (session, args) => {
            if (msg) {
                session.sendLocalized(args.libraryName, msg);
            }
            session.cancelDialog(args.dialogIndex, args.dialogId, options.dialogArgs);
        }, options);
    }

    public beginDialogAction(name: string, id: string, options: IBeginDialogActionOptions = {}): this {
        return this.action(name, (session, args) => {
            if (options.dialogArgs) {
                utils.copyTo(options.dialogArgs, args);
            }
            if (id.indexOf(':') < 0) {
                var lib = args.dialogId ? args.dialogId.split(':')[0] : args.libraryName;
                id = lib + ':' + id;
            }
            if (session.sessionState.callstack.length > 0) {
                if ((<IInteruptDialogOptions>options).isInterruption) {
                    // Let the root dialog manage interruption
                    var parts = session.sessionState.callstack[0].id.split(':');
                    var dialog = session.library.findDialog(parts[0], parts[1]);
                    dialog.dialogInterrupted(session, id, args);
                } else  {
                    // Push an interruption wrapper onto the stack
                    session.beginDialog(consts.DialogId.Interruption, { dialogId: id, dialogArgs: args });
                }
            } else {
                session.beginDialog(id, args);
            }
        }, options);
    }

    public endConversationAction(name: string, msg?: string|string[]|IMessage|IIsMessage, options?: ICancelActionOptions): this {
        return this.action(name, (session, args) => {
            if (options.confirmPrompt) {
                session.beginDialog(consts.DialogId.ConfirmCancel, {
                    localizationNamespace: args.libraryName,
                    confirmPrompt: options.confirmPrompt,
                    endConversation: true,
                    message: msg 
                });
            } else {
                if (msg) {
                    session.sendLocalized(args.libraryName, msg);
                }
                session.endConversation();
            }
        }, options);
    }

    public triggerAction(options: ITriggerActionOptions): this {
        // Save trigger options. A global beginDialog() action will get setup at runtime.
        this.trigger = <IInteruptDialogOptions>(options || {});
        this.trigger.isInterruption = true;;
        return this;
    }

    public customAction(options: IDialogActionOptions): this {
        if (!options || !options.onSelectAction) {
            throw "An onSelectAction handler is required."
        }
        var name = options.matches ? 'custom(' + options.matches.toString() + ')' : 'custom(onFindAction())';
        return this.action(name, (session, args) => {
            session.logger.warn(session.dialogStack(), "Shouldn't call next() in onSelectAction() for " + name);
            session.save().sendBatch();
        }, options);
    }

    private action(name: string, handler: IActionHandler, options: IDialogActionOptions = {}): this {
        var key = this.uniqueActionName(name);
        this.actions[name] = { handler: handler, options: options };
        return this;
    }

    private uniqueActionName(name: string, cnt = 1): string {
        var key = cnt > 1 ? name + cnt : name;
        if (this.actions.hasOwnProperty(key)) {
            return this.uniqueActionName(name, cnt + 1);
        } else {
            return key;
        }
    }
}

interface IInteruptDialogOptions extends ITriggerActionOptions {
    isInterruption: boolean;
    localizationNamespace?: string;
}

interface IActionHandlerEntry {
    handler: IActionHandler;
    options: IDialogActionOptions;
}
