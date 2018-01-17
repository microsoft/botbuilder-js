"use strict";
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var WaterfallDialog_1 = require("../dialogs/WaterfallDialog");
var ActionSet_1 = require("../dialogs/ActionSet");
var IntentRecognizerSet_1 = require("../dialogs/IntentRecognizerSet");
var Session_1 = require("../Session");
var consts = require("../consts");
var utils = require("../utils");
var events_1 = require("events");
var path = require("path");
var async = require("async");
var Library = /** @class */ (function (_super) {
    __extends(Library, _super);
    function Library(name) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.dialogs = {};
        _this.libraries = {};
        _this.actions = new ActionSet_1.ActionSet();
        _this.recognizers = new IntentRecognizerSet_1.IntentRecognizerSet();
        _this.triggersAdded = false;
        return _this;
    }
    /** Returns a clone of the current library. */
    Library.prototype.clone = function (copyTo, newName) {
        var obj = copyTo || new Library(newName || this.name);
        for (var id in this.dialogs) {
            obj.dialogs[id] = this.dialogs[id];
        }
        for (var name in this.libraries) {
            obj.libraries[name] = this.libraries[name];
        }
        this.actions.clone(obj.actions);
        this.recognizers.clone(obj.recognizers);
        obj._localePath = this._localePath;
        obj._onFindRoutes = this._onFindRoutes;
        obj._onSelectRoute = this._onSelectRoute;
        obj.triggersAdded = this.triggersAdded;
        return obj;
    };
    //-------------------------------------------------------------------------
    // Localization
    //-------------------------------------------------------------------------
    /** Gets/sets the path to the libraries localization folder. */
    Library.prototype.localePath = function (path) {
        if (path) {
            this._localePath = path;
        }
        return this._localePath;
    };
    //-------------------------------------------------------------------------
    // Recognition
    //-------------------------------------------------------------------------
    /** Attempts to recognize the top intent for the current message. */
    Library.prototype.recognize = function (context, callback) {
        var _this = this;
        // Check to see if our recognizer has already been run.
        // - When a message is received the root libraries recognizers are run and the
        //   top intent is passed along as part of routing. The root libraries recognize()
        //   method will be called a second time so we want to avoid the second recognize
        //   pass.
        if (this.recognizers.length > 0 && context.libraryName !== this.name) {
            this.recognizers.recognize(context, function (err, result) {
                if (result && result.score > 0) {
                    context.logger.log(null, _this.logPrefix() + 'recognize() recognized: ' +
                        result.intent + '(' + result.score + ')');
                }
                callback(err, result);
            });
        }
        else {
            callback(null, context.intent || { intent: 'None', score: 0.0 });
        }
    };
    /** Adds a recognizer to the libraries intent recognizer set. */
    Library.prototype.recognizer = function (plugin) {
        // Append recognizer
        this.recognizers.recognizer(plugin);
        return this;
    };
    //-------------------------------------------------------------------------
    // Routing
    //-------------------------------------------------------------------------
    /** Finds candidate routes. */
    Library.prototype.findRoutes = function (context, callback) {
        var _this = this;
        // Add triggers on first calls
        if (!this.triggersAdded) {
            this.forEachDialog(function (dialog, id) { return dialog.addDialogTrigger(_this.actions, _this.name + ':' + id); });
            this.triggersAdded = true;
        }
        // Search for route
        if (this._onFindRoutes) {
            this._onFindRoutes(context, callback);
        }
        else {
            this.defaultFindRoutes(context, callback);
        }
    };
    /** Lets a developer override the libraries default search logic. */
    Library.prototype.onFindRoutes = function (handler) {
        this._onFindRoutes = handler;
    };
    /** Selects a route returned by findRoute(). */
    Library.prototype.selectRoute = function (session, route) {
        if (this._onSelectRoute) {
            this._onSelectRoute(session, route);
        }
        else {
            this.defaultSelectRoute(session, route);
        }
    };
    /** Lets a developer override the libraries default selection logic. */
    Library.prototype.onSelectRoute = function (handler) {
        this._onSelectRoute = handler;
    };
    /** Checks to see if the active dialog is from the current library and gets its confidence score for the utterance. */
    Library.prototype.findActiveDialogRoutes = function (context, callback, dialogStack) {
        var _this = this;
        // Find stack to search over
        if (!dialogStack) {
            dialogStack = context.dialogStack();
        }
        // Ensure that the active dialog is for this library 
        var results = Library.addRouteResult({ score: 0.0, libraryName: this.name });
        var entry = Session_1.Session.activeDialogStackEntry(dialogStack);
        var parts = entry ? entry.id.split(':') : null;
        if (parts && parts[0] == this.name) {
            // Get the dialog (if it exists)
            var dialog = this.dialog(parts[1]);
            if (dialog) {
                // Call recognize for the active dialog
                var ctx = utils.clone(context);
                ctx.libraryName = this.name;
                ctx.dialogData = entry.state;
                ctx.activeDialog = true;
                dialog.recognize(ctx, function (err, result) {
                    if (!err) {
                        if (result.score < 0.1) {
                            // The active dialog should always have some score otherwise it
                            // can't ensure that its route data will be properly round tripped.
                            result.score = 0.1;
                        }
                        callback(null, Library.addRouteResult({
                            score: result.score,
                            libraryName: _this.name,
                            routeType: Library.RouteTypes.ActiveDialog,
                            routeData: result
                        }, results));
                    }
                    else {
                        callback(err, null);
                    }
                });
            }
            else {
                context.logger.warn(context.dialogStack(), "Active dialog '" + entry.id + "' not found in library.");
                callback(null, results);
            }
        }
        else {
            callback(null, results);
        }
    };
    /** Routes the received message to the active dialog. */
    Library.prototype.selectActiveDialogRoute = function (session, route, newStack) {
        if (!route || route.libraryName !== this.name || route.routeType !== Library.RouteTypes.ActiveDialog) {
            throw new Error('Invalid route type passed to Library.selectActiveDialogRoute().');
        }
        // Optionally switch stacks
        if (newStack) {
            session.dialogStack(newStack);
        }
        // Route to the active dialog.
        session.routeToActiveDialog(route.routeData);
    };
    /** Searches for any stack actions that have been triggered for the library. */
    Library.prototype.findStackActionRoutes = function (context, callback, dialogStack) {
        var _this = this;
        // Find stack to search over
        if (!dialogStack) {
            dialogStack = context.dialogStack();
        }
        // Search all stack entries in parallel
        var results = Library.addRouteResult({ score: 0.0, libraryName: this.name });
        var ctx = utils.clone(context);
        ctx.libraryName = this.name;
        ctx.routeType = Library.RouteTypes.StackAction;
        async.forEachOf(dialogStack || [], function (entry, index, next) {
            // Filter to library.
            var parts = entry.id.split(':');
            if (parts[0] == _this.name) {
                var dialog = _this.dialog(parts[1]);
                if (dialog) {
                    // Find trigered actions
                    dialog.findActionRoutes(ctx, function (err, ra) {
                        if (!err) {
                            for (var i = 0; i < ra.length; i++) {
                                var r = ra[i];
                                if (r.routeData) {
                                    r.routeData.dialogId = entry.id;
                                    r.routeData.dialogIndex = index;
                                }
                                results = Library.addRouteResult(r, results);
                            }
                        }
                        next(err);
                    });
                }
                else {
                    ctx.logger.warn(ctx.dialogStack(), "Dialog '" + entry.id + "' not found in library.");
                    next(null);
                }
            }
            else {
                next(null);
            }
        }, function (err) {
            if (!err) {
                callback(null, results);
            }
            else {
                callback(err, null);
            }
        });
    };
    /** Routes the received message to an action on the dialog stack. */
    Library.prototype.selectStackActionRoute = function (session, route, newStack) {
        if (!route || route.libraryName !== this.name || route.routeType !== Library.RouteTypes.StackAction) {
            throw new Error('Invalid route type passed to Library.selectStackActionRoute().');
        }
        // Optionally switch stacks
        if (newStack) {
            session.dialogStack(newStack);
        }
        // Route to triggered action
        var routeData = route.routeData;
        var parts = routeData.dialogId.split(':');
        this.dialog(parts[1]).selectActionRoute(session, route);
    };
    /** Searches for any global actions that have been triggered for the library. */
    Library.prototype.findGlobalActionRoutes = function (context, callback) {
        var results = Library.addRouteResult({ score: 0.0, libraryName: this.name });
        var ctx = utils.clone(context);
        ctx.libraryName = this.name;
        ctx.routeType = Library.RouteTypes.GlobalAction;
        this.actions.findActionRoutes(ctx, function (err, ra) {
            if (!err) {
                for (var i = 0; i < ra.length; i++) {
                    var r = ra[i];
                    results = Library.addRouteResult(r, results);
                }
                callback(null, results);
            }
            else {
                callback(err, null);
            }
        });
    };
    /** Routes the received message to one of the libraries global actions. */
    Library.prototype.selectGlobalActionRoute = function (session, route) {
        if (!route || route.libraryName !== this.name || route.routeType !== Library.RouteTypes.GlobalAction) {
            throw new Error('Invalid route type passed to Library.selectGlobalActionRoute().');
        }
        // Route to triggered action
        this.actions.selectActionRoute(session, route);
    };
    /** Libraries default logic for finding candidate routes. */
    Library.prototype.defaultFindRoutes = function (context, callback) {
        var _this = this;
        var explain = '';
        var results = Library.addRouteResult({ score: 0.0, libraryName: this.name });
        this.recognize(context, function (err, topIntent) {
            if (!err) {
                var ctx = utils.clone(context);
                ctx.intent = topIntent && topIntent.score > 0 ? topIntent : null;
                ctx.libraryName = _this.name;
                async.parallel([
                    function (cb) {
                        // Check the active dialogs score
                        _this.findActiveDialogRoutes(ctx, function (err, routes) {
                            if (!err && routes) {
                                routes.forEach(function (r) {
                                    results = Library.addRouteResult(r, results);
                                    if (r.score > 0) {
                                        explain += '\n\tActiveDialog(' + r.score + ')';
                                    }
                                });
                            }
                            cb(err);
                        });
                    },
                    function (cb) {
                        // Search for triggered stack actions.
                        _this.findStackActionRoutes(ctx, function (err, routes) {
                            if (!err && routes) {
                                routes.forEach(function (r) {
                                    results = Library.addRouteResult(r, results);
                                    if (r.score > 0) {
                                        explain += '\n\tStackAction(' + r.score + ')';
                                    }
                                });
                            }
                            cb(err);
                        });
                    },
                    function (cb) {
                        // Search for global actions.
                        _this.findGlobalActionRoutes(ctx, function (err, routes) {
                            if (!err && routes) {
                                routes.forEach(function (r) {
                                    results = Library.addRouteResult(r, results);
                                    if (r.score > 0) {
                                        explain += '\n\tGlobalAction(' + r.score + ')';
                                    }
                                });
                            }
                            cb(err);
                        });
                    }
                ], function (err) {
                    if (!err) {
                        if (explain.length > 0) {
                            context.logger.log(null, _this.logPrefix() + '.findRoutes() explanation:' + explain);
                        }
                        callback(null, results);
                    }
                    else {
                        callback(err, null);
                    }
                });
            }
            else {
                callback(err, null);
            }
        });
    };
    /** Libraries default logic for selecting a route returned by findRoutes(). */
    Library.prototype.defaultSelectRoute = function (session, route) {
        switch (route.routeType || '') {
            case Library.RouteTypes.ActiveDialog:
                this.selectActiveDialogRoute(session, route);
                break;
            case Library.RouteTypes.StackAction:
                this.selectStackActionRoute(session, route);
                break;
            case Library.RouteTypes.GlobalAction:
                this.selectGlobalActionRoute(session, route);
                break;
            default:
                throw new Error('Invalid route type passed to Library.selectRoute().');
        }
    };
    /** Conditionally adds a route with a higher confidence to a list of candidate routes. */
    Library.addRouteResult = function (route, current) {
        if (!current || current.length < 1 || route.score > current[0].score) {
            current = [route];
        }
        else if (route.score == current[0].score) {
            current.push(route);
        }
        return current;
    };
    /** Returns the best route to use from a set of results. */
    Library.bestRouteResult = function (routes, dialogStack, rootLibraryName) {
        // Find library with highest priority
        var bestLibrary = rootLibraryName;
        if (dialogStack) {
            dialogStack.forEach(function (entry) {
                var parts = entry.id.split(':');
                for (var i = 0; i < routes.length; i++) {
                    if (routes[i].libraryName == parts[0]) {
                        bestLibrary = parts[0];
                        break;
                    }
                }
            });
        }
        // See if the ambiguous result is a better match.
        var best;
        var bestPriority = 5;
        for (var i = 0; i < routes.length; i++) {
            var r = routes[i];
            // Filter out scores of 0.0
            if (r.score > 0.0) {
                // Determine the routes priority
                var priority;
                switch (r.routeType) {
                    default:
                        priority = 1;
                        break;
                    case Library.RouteTypes.ActiveDialog:
                        priority = 2;
                        break;
                    case Library.RouteTypes.StackAction:
                        priority = 3;
                        break;
                    case Library.RouteTypes.GlobalAction:
                        priority = 4;
                        break;
                }
                // Update best route
                if (priority < bestPriority) {
                    best = r;
                    bestPriority = priority;
                }
                else if (priority == bestPriority) {
                    switch (priority) {
                        case 3:
                            if (r.routeData.dialogIndex > best.routeData.dialogIndex) {
                                best = r;
                            }
                            break;
                        case 4:
                            if (bestLibrary && best.libraryName !== bestLibrary && r.libraryName == bestLibrary) {
                                best = r;
                            }
                            break;
                    }
                }
            }
        }
        return best;
    };
    //-------------------------------------------------------------------------
    // Dialogs
    //-------------------------------------------------------------------------
    /** Adds or looks up a dialog within the library. */
    Library.prototype.dialog = function (id, dialog, replace) {
        var d;
        if (dialog) {
            // Fixup id
            if (id.indexOf(':') >= 0) {
                id = id.split(':')[1];
            }
            // Ensure unique
            if (this.dialogs.hasOwnProperty(id) && !replace) {
                throw new Error("Dialog[" + id + "] already exists in library[" + this.name + "].");
            }
            // Wrap dialog and save
            if (Array.isArray(dialog) || typeof dialog === 'function') {
                d = new WaterfallDialog_1.WaterfallDialog(dialog);
            }
            else {
                d = dialog;
            }
            this.dialogs[id] = d;
        }
        else if (this.dialogs.hasOwnProperty(id)) {
            d = this.dialogs[id];
        }
        return d;
    };
    /** Searches for a dialog in the library hierarchy. */
    Library.prototype.findDialog = function (libName, dialogId) {
        var d;
        var lib = this.library(libName);
        if (lib) {
            d = lib.dialog(dialogId);
        }
        return d;
    };
    /** Enumerates all of the libraries dialogs. */
    Library.prototype.forEachDialog = function (callback) {
        for (var id in this.dialogs) {
            callback(this.dialog(id), id);
        }
    };
    //-------------------------------------------------------------------------
    // Child Libraries
    //-------------------------------------------------------------------------
    /** Adds a child library to the hierarchy or looks up a library given its name. */
    Library.prototype.library = function (lib) {
        var l;
        if (typeof lib === 'string') {
            if (lib == this.name) {
                l = this;
            }
            else if (this.libraries.hasOwnProperty(lib)) {
                l = this.libraries[lib];
            }
            else {
                // Search for lib
                for (var name in this.libraries) {
                    l = this.libraries[name].library(lib);
                    if (l) {
                        break;
                    }
                }
            }
        }
        else {
            // Save library
            l = this.libraries[lib.name] = lib;
        }
        return l;
    };
    /** Enumerates the libraries immediate child libraries. */
    Library.prototype.forEachLibrary = function (callback) {
        for (var lib in this.libraries) {
            callback(this.libraries[lib]);
        }
    };
    /** Returns a list of unique libraries within the hierarchy. */
    Library.prototype.libraryList = function (reverse) {
        if (reverse === void 0) { reverse = false; }
        var list = [];
        var added = {};
        function addChildren(lib) {
            if (!added.hasOwnProperty(lib.name)) {
                added[lib.name] = true;
                if (!reverse) {
                    list.push(lib);
                }
                lib.forEachLibrary(function (child) { return addChildren(child); });
                if (reverse) {
                    list.push(lib);
                }
            }
        }
        addChildren(this);
        return list;
    };
    //-------------------------------------------------------------------------
    // Global Actions
    //-------------------------------------------------------------------------
    Library.prototype.beginDialogAction = function (name, id, options) {
        this.actions.beginDialogAction(name, id, options);
        return this;
    };
    Library.prototype.endConversationAction = function (name, msg, options) {
        this.actions.endConversationAction(name, msg, options);
        return this;
    };
    Library.prototype.customAction = function (options) {
        this.actions.customAction(options);
        return this;
    };
    //-------------------------------------------------------------------------
    // Helpers
    //-------------------------------------------------------------------------
    Library.prototype.logPrefix = function () {
        return 'Library("' + this.name + '")';
    };
    Library.RouteTypes = {
        GlobalAction: 'GlobalAction',
        StackAction: 'StackAction',
        ActiveDialog: 'ActiveDialog'
    };
    return Library;
}(events_1.EventEmitter));
exports.Library = Library;
exports.systemLib = new Library(consts.Library.system);
exports.systemLib.localePath(path.join(__dirname, '../locale/'));
