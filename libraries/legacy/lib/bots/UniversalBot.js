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
var Library_1 = require("./Library");
var Session_1 = require("../Session");
var DefaultLocalizer_1 = require("../DefaultLocalizer");
var BotStorage_1 = require("../storage/BotStorage");
var SessionLogger_1 = require("../SessionLogger");
var RemoteSessionLogger_1 = require("../RemoteSessionLogger");
var consts = require("../consts");
var utils = require("../utils");
var async = require("async");
var UniversalBot = /** @class */ (function (_super) {
    __extends(UniversalBot, _super);
    function UniversalBot(connector, defaultDialog, libraryName) {
        var _this = _super.call(this, libraryName || consts.Library.default) || this;
        _this.settings = {
            processLimit: 4,
            persistUserData: true,
            persistConversationData: true
        };
        _this.connectors = {};
        _this.mwReceive = [];
        _this.mwSend = [];
        _this.mwSession = [];
        _this.localePath('./locale/');
        _this.library(Library_1.systemLib);
        if (defaultDialog) {
            // Check for legacy settings passed in
            if (typeof defaultDialog === 'function' || Array.isArray(defaultDialog)) {
                _this.dialog('/', defaultDialog);
            }
            else {
                var settings = defaultDialog;
                for (var name in settings) {
                    if (settings.hasOwnProperty(name)) {
                        _this.set(name, settings[name]);
                    }
                }
            }
        }
        if (connector) {
            _this.connector(consts.defaultConnector, connector);
        }
        return _this;
    }
    UniversalBot.prototype.clone = function (copyTo, newName) {
        var obj = copyTo || new UniversalBot(null, null, newName || this.name);
        for (var name in this.settings) {
            if (this.settings.hasOwnProperty(name)) {
                this.set(name, this.settings[name]);
            }
        }
        for (var channel in this.connectors) {
            obj.connector(channel, this.connectors[channel]);
        }
        obj.mwReceive = this.mwReceive.slice(0);
        obj.mwSession = this.mwSession.slice(0);
        obj.mwSend = this.mwSend.slice(0);
        // obj.localizer is automatically created based on settings
        return _super.prototype.clone.call(this, obj);
    };
    //-------------------------------------------------------------------------
    // Settings
    //-------------------------------------------------------------------------
    UniversalBot.prototype.set = function (name, value) {
        this.settings[name] = value;
        if (value && name === 'localizerSettings') {
            var settings = value;
            if (settings.botLocalePath) {
                this.localePath(settings.botLocalePath);
            }
        }
        return this;
    };
    UniversalBot.prototype.get = function (name) {
        return this.settings[name];
    };
    //-------------------------------------------------------------------------
    // Connectors
    //-------------------------------------------------------------------------
    UniversalBot.prototype.connector = function (channelId, connector) {
        var _this = this;
        var c;
        if (connector) {
            // Bind to connector.
            this.connectors[channelId || consts.defaultConnector] = c = connector;
            c.onEvent(function (events, cb) { return _this.receive(events, cb); });
            // Optionally use connector for storage.
            var asStorage = connector;
            if (!this.settings.storage &&
                typeof asStorage.getData === 'function' &&
                typeof asStorage.saveData === 'function') {
                this.settings.storage = asStorage;
            }
        }
        else if (this.connectors.hasOwnProperty(channelId)) {
            c = this.connectors[channelId];
        }
        else if (this.connectors.hasOwnProperty(consts.defaultConnector)) {
            c = this.connectors[consts.defaultConnector];
        }
        return c;
    };
    //-------------------------------------------------------------------------
    // Middleware
    //-------------------------------------------------------------------------
    UniversalBot.prototype.use = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.forEach(function (mw) {
            var added = 0;
            if (mw.receive) {
                Array.prototype.push.apply(_this.mwReceive, Array.isArray(mw.receive) ? mw.receive : [mw.receive]);
                added++;
            }
            if (mw.send) {
                Array.prototype.push.apply(_this.mwSend, Array.isArray(mw.send) ? mw.send : [mw.send]);
                added++;
            }
            if (mw.botbuilder) {
                Array.prototype.push.apply(_this.mwSession, Array.isArray(mw.botbuilder) ? mw.botbuilder : [mw.botbuilder]);
                added++;
            }
            if (added < 1) {
                console.warn('UniversalBot.use: no compatible middleware hook found to install.');
            }
        });
        return this;
    };
    //-------------------------------------------------------------------------
    // Messaging
    //-------------------------------------------------------------------------
    UniversalBot.prototype.receive = function (events, done) {
        var _this = this;
        var list = Array.isArray(events) ? events : [events];
        async.eachLimit(list, this.settings.processLimit, function (message, cb) {
            message.agent = consts.agent;
            message.type = message.type || consts.messageType;
            _this.lookupUser(message.address, function (user) {
                if (user) {
                    message.user = user;
                }
                _this.emit('receive', message);
                _this.eventMiddleware(message, _this.mwReceive, function () {
                    if (_this.isMessage(message)) {
                        _this.emit('incoming', message);
                        var userId = message.user.id;
                        var conversationId = message.address.conversation ? message.address.conversation.id : null;
                        var storageCtx = {
                            userId: userId,
                            conversationId: conversationId,
                            address: message.address,
                            persistUserData: _this.settings.persistUserData,
                            persistConversationData: _this.settings.persistConversationData
                        };
                        _this.dispatch(storageCtx, message, _this.settings.defaultDialogId || '/', _this.settings.defaultDialogArgs, cb);
                    }
                    else {
                        // Dispatch incoming activity
                        _this.emit(message.type, message);
                        cb(null);
                    }
                }, cb);
            }, cb);
        }, this.errorLogger(done));
    };
    UniversalBot.prototype.beginDialog = function (address, dialogId, dialogArgs, done) {
        var _this = this;
        this.lookupUser(address, function (user) {
            var msg = {
                type: consts.messageType,
                agent: consts.agent,
                source: address.channelId,
                sourceEvent: {},
                address: utils.clone(address),
                text: '',
                user: user
            };
            _this.ensureConversation(msg.address, function (adr) {
                msg.address = adr;
                var conversationId = msg.address.conversation ? msg.address.conversation.id : null;
                var storageCtx = {
                    userId: msg.user.id,
                    conversationId: conversationId,
                    address: msg.address,
                    persistUserData: _this.settings.persistUserData,
                    persistConversationData: _this.settings.persistConversationData
                };
                _this.dispatch(storageCtx, msg, dialogId, dialogArgs, _this.errorLogger(done), true);
            }, _this.errorLogger(done));
        }, this.errorLogger(done));
    };
    UniversalBot.prototype.send = function (messages, done) {
        var _this = this;
        var list;
        if (Array.isArray(messages)) {
            list = messages;
        }
        else if (messages.toMessage) {
            list = [messages.toMessage()];
        }
        else {
            list = [messages];
        }
        async.eachLimit(list, this.settings.processLimit, function (message, cb) {
            _this.ensureConversation(message.address, function (adr) {
                message.address = adr;
                _this.emit('send', message);
                _this.eventMiddleware(message, _this.mwSend, function () {
                    _this.emit('outgoing', message);
                    cb(null);
                }, cb);
            }, cb);
        }, this.errorLogger(function (err) {
            if (!err && list.length > 0) {
                _this.tryCatch(function () {
                    // All messages should be targeted at the same channel.
                    var channelId = list[0].address.channelId;
                    var connector = _this.connector(channelId);
                    if (!connector) {
                        throw new Error("Invalid channelId='" + channelId + "'");
                    }
                    connector.send(list, _this.errorLogger(done));
                }, _this.errorLogger(done));
            }
            else if (done) {
                done(err, null);
            }
        }));
    };
    UniversalBot.prototype.isInConversation = function (address, cb) {
        var _this = this;
        this.lookupUser(address, function (user) {
            var conversationId = address.conversation ? address.conversation.id : null;
            var storageCtx = {
                userId: user.id,
                conversationId: conversationId,
                address: address,
                persistUserData: false,
                persistConversationData: false
            };
            _this.getStorageData(storageCtx, function (data) {
                var lastAccess;
                if (data && data.privateConversationData && data.privateConversationData.hasOwnProperty(consts.Data.SessionState)) {
                    var ss = data.privateConversationData[consts.Data.SessionState];
                    if (ss && ss.lastAccess) {
                        lastAccess = new Date(ss.lastAccess);
                    }
                }
                cb(null, lastAccess);
            }, _this.errorLogger(cb));
        }, this.errorLogger(cb));
    };
    /** Lets a developer override the bots default route disambiguation logic. */
    UniversalBot.prototype.onDisambiguateRoute = function (handler) {
        this._onDisambiguateRoute = handler;
    };
    //-------------------------------------------------------------------------
    // Session
    //-------------------------------------------------------------------------
    /** Loads a session object for an arbitrary address. */
    UniversalBot.prototype.loadSession = function (address, done) {
        this.loadSessionWithOptionalDispatch(address, true, done);
    };
    UniversalBot.prototype.loadSessionWithoutDispatching = function (address, done) {
        this.loadSessionWithOptionalDispatch(address, false, done);
    };
    UniversalBot.prototype.loadSessionWithOptionalDispatch = function (address, shouldDispatch, done) {
        var _this = this;
        var newStack = false;
        this.lookupUser(address, function (user) {
            var msg = {
                type: consts.messageType,
                agent: consts.agent,
                source: address.channelId,
                sourceEvent: {},
                address: utils.clone(address),
                text: '',
                user: user
            };
            _this.ensureConversation(msg.address, function (adr) {
                msg.address = adr;
                var conversationId = msg.address.conversation ? msg.address.conversation.id : null;
                var storageCtx = {
                    userId: msg.user.id,
                    conversationId: conversationId,
                    address: msg.address,
                    persistUserData: _this.settings.persistUserData,
                    persistConversationData: _this.settings.persistConversationData
                };
                _this.createSession(storageCtx, msg, _this.settings.defaultDialogId || '/', _this.settings.defaultDialogArgs, done, newStack, shouldDispatch);
            }, _this.errorLogger(done));
        }, this.errorLogger(done));
    };
    //-------------------------------------------------------------------------
    // Helpers
    //-------------------------------------------------------------------------
    UniversalBot.prototype.dispatch = function (storageCtx, message, dialogId, dialogArgs, done, newStack) {
        var _this = this;
        if (newStack === void 0) { newStack = false; }
        // --------------------------------------------------------------------
        // Theory of Operation
        // --------------------------------------------------------------------
        // The dispatch() function is called for both reactive & pro-active 
        // messages and while they generally work the same there are some 
        // differences worth noting.
        //
        // REACTIVE:
        // * The passed in storageKey will have the normalized userId and the
        //   conversationId for the incoming message. These are used as keys to
        //   load the persisted userData and conversationData objects.
        // * After loading data from storage we create a new Session object and
        //   dispatch the incoming message to the active dialog.
        // * As part of the normal dialog flow the session will call onSave() 1 
        //   or more times before each call to onSend().  Anytime onSave() is 
        //   called we'll save the current userData & conversationData objects
        //   to storage.
        //
        // PROACTIVE:
        // * Proactive follows essentially the same flow but the difference is 
        //   the passed in storageKey will only have a userId and not a 
        //   conversationId as this is a new conversation.  This will cause use
        //   to load userData but conversationData will be set to {}.
        // * When onSave() is called for a proactive message we don't know the
        //   conversationId yet so we can't actually save anything. The first
        //   call to this.send() results in a conversationId being assigned and
        //   that's the point at which we can actually save state. So we'll update
        //   the storageKey with the new conversationId and then manually trigger
        //   saving the userData & conversationData to storage.
        // * After the first call to onSend() for the conversation everything 
        //   follows the same flow as for reactive messages.
        this.createSession(storageCtx, message, dialogId, dialogArgs, function (err, session) {
            // Dispatch message
            if (!err) {
                _this.emit('routing', session);
                _this.routeMessage(session, done);
            }
            else {
                done(err);
            }
        }, newStack);
    };
    UniversalBot.prototype.createSession = function (storageCtx, message, dialogId, dialogArgs, done, newStack, shouldDispatch) {
        var _this = this;
        if (newStack === void 0) { newStack = false; }
        if (shouldDispatch === void 0) { shouldDispatch = true; }
        var loadedData;
        this.getStorageData(storageCtx, function (data) {
            // Create localizer on first access
            if (!_this.localizer) {
                var defaultLocale = _this.settings.localizerSettings ? _this.settings.localizerSettings.defaultLocale : null;
                _this.localizer = new DefaultLocalizer_1.DefaultLocalizer(_this, defaultLocale);
            }
            // Create logger
            var logger;
            if (message.source == consts.emulatorChannel) {
                logger = new RemoteSessionLogger_1.RemoteSessionLogger(_this.connector(consts.emulatorChannel), message.address, message.address);
            }
            else if (data.privateConversationData && data.privateConversationData.hasOwnProperty(consts.Data.DebugAddress)) {
                var debugAddress = data.privateConversationData[consts.Data.DebugAddress];
                logger = new RemoteSessionLogger_1.RemoteSessionLogger(_this.connector(consts.emulatorChannel), debugAddress, message.address);
            }
            else {
                logger = new SessionLogger_1.SessionLogger();
            }
            // Initialize session
            var session = new Session_1.Session({
                localizer: _this.localizer,
                logger: logger,
                autoBatchDelay: _this.settings.autoBatchDelay,
                connector: _this.connector(message.address.channelId),
                library: _this,
                //actions: this.actions,
                middleware: _this.mwSession,
                dialogId: dialogId,
                dialogArgs: dialogArgs,
                dialogErrorMessage: _this.settings.dialogErrorMessage,
                onSave: function (cb) {
                    var finish = _this.errorLogger(cb);
                    loadedData.userData = utils.clone(session.userData);
                    loadedData.conversationData = utils.clone(session.conversationData);
                    loadedData.privateConversationData = utils.clone(session.privateConversationData);
                    loadedData.privateConversationData[consts.Data.SessionState] = session.sessionState;
                    _this.saveStorageData(storageCtx, loadedData, finish, finish);
                },
                onSend: function (messages, cb) {
                    _this.send(messages, cb);
                }
            });
            session.on('error', function (err) { return _this.emitError(err); });
            // Initialize session data
            var sessionState;
            session.userData = data.userData || {};
            session.conversationData = data.conversationData || {};
            session.privateConversationData = data.privateConversationData || {};
            if (session.privateConversationData.hasOwnProperty(consts.Data.SessionState)) {
                sessionState = newStack ? null : session.privateConversationData[consts.Data.SessionState];
                delete session.privateConversationData[consts.Data.SessionState];
            }
            loadedData = data; // We'll clone it when saving data later
            if (shouldDispatch) {
                session.dispatch(sessionState, message, function () { return done(null, session); });
            }
            else {
                done(null, session);
            }
        }, done);
    };
    UniversalBot.prototype.routeMessage = function (session, done) {
        var _this = this;
        // Log start of routing
        var entry = 'UniversalBot("' + this.name + '") routing ';
        if (session.message.text) {
            entry += '"' + session.message.text + '"';
        }
        else if (session.message.attachments && session.message.attachments.length > 0) {
            entry += session.message.attachments.length + ' attachment(s)';
        }
        else {
            entry += '<null>';
        }
        entry += ' from "' + session.message.source + '"';
        session.logger.log(null, entry);
        // Run the root libraries recognizers
        var context = session.toRecognizeContext();
        this.recognize(context, function (err, topIntent) {
            // Check for forwarded intent
            if (session.message.entities) {
                session.message.entities.forEach(function (entity) {
                    if (entity.type === consts.intentEntityType &&
                        entity.score > topIntent.score) {
                        topIntent = entity;
                    }
                });
            }
            // This intent will be automatically inherited by child libraries
            // that don't implement their own recognizers.
            // - We're passing along the library name to avoid running our own
            //   recognizer twice.
            context.intent = topIntent;
            context.libraryName = _this.name;
            // Federate across all libraries to find the best route to trigger. 
            var results = Library_1.Library.addRouteResult({ score: 0.0, libraryName: _this.name });
            async.each(_this.libraryList(), function (lib, cb) {
                lib.findRoutes(context, function (err, routes) {
                    if (!err && routes) {
                        routes.forEach(function (r) { return results = Library_1.Library.addRouteResult(r, results); });
                    }
                    cb(err);
                });
            }, function (err) {
                if (!err) {
                    // Find disambiguation handler to use
                    var disambiguateRoute = function (session, routes) {
                        var route = Library_1.Library.bestRouteResult(results, session.dialogStack(), _this.name);
                        if (route) {
                            _this.library(route.libraryName).selectRoute(session, route);
                        }
                        else {
                            // Just let the active dialog process the message
                            session.routeToActiveDialog();
                        }
                    };
                    if (_this._onDisambiguateRoute) {
                        disambiguateRoute = _this._onDisambiguateRoute;
                    }
                    // Select best route and dispatch message.
                    disambiguateRoute(session, results);
                    done(null);
                }
                else {
                    // Let the session process the error
                    session.error(err);
                    done(err);
                }
            });
        });
    };
    UniversalBot.prototype.eventMiddleware = function (event, middleware, done, error) {
        var i = -1;
        var _that = this;
        function next() {
            if (++i < middleware.length) {
                _that.tryCatch(function () {
                    middleware[i](event, next);
                }, function () { return next(); });
            }
            else {
                _that.tryCatch(function () { return done(); }, error);
            }
        }
        next();
    };
    UniversalBot.prototype.isMessage = function (message) {
        return (message && message.type && message.type.toLowerCase() == consts.messageType);
    };
    UniversalBot.prototype.ensureConversation = function (address, done, error) {
        var _this = this;
        this.tryCatch(function () {
            if (!address.conversation) {
                var connector = _this.connector(address.channelId);
                if (!connector) {
                    throw new Error("Invalid channelId='" + address.channelId + "'");
                }
                connector.startConversation(address, function (err, adr) {
                    if (!err) {
                        _this.tryCatch(function () { return done(adr); }, error);
                    }
                    else if (error) {
                        error(err);
                    }
                });
            }
            else {
                _this.tryCatch(function () { return done(address); }, error);
            }
        }, error);
    };
    UniversalBot.prototype.lookupUser = function (address, done, error) {
        var _this = this;
        this.tryCatch(function () {
            _this.emit('lookupUser', address);
            if (_this.settings.lookupUser) {
                _this.settings.lookupUser(address, function (err, user) {
                    if (!err) {
                        _this.tryCatch(function () { return done(user || address.user); }, error);
                    }
                    else if (error) {
                        error(err);
                    }
                });
            }
            else {
                _this.tryCatch(function () { return done(address.user); }, error);
            }
        }, error);
    };
    UniversalBot.prototype.getStorageData = function (storageCtx, done, error) {
        var _this = this;
        this.tryCatch(function () {
            _this.emit('getStorageData', storageCtx);
            var storage = _this.getStorage();
            storage.getData(storageCtx, function (err, data) {
                if (!err) {
                    _this.tryCatch(function () { return done(data || {}); }, error);
                }
                else if (error) {
                    error(err);
                }
            });
        }, error);
    };
    UniversalBot.prototype.saveStorageData = function (storageCtx, data, done, error) {
        var _this = this;
        this.tryCatch(function () {
            _this.emit('saveStorageData', storageCtx);
            var storage = _this.getStorage();
            storage.saveData(storageCtx, data, function (err) {
                if (!err) {
                    if (done) {
                        _this.tryCatch(function () { return done(); }, error);
                    }
                }
                else if (error) {
                    error(err);
                }
            });
        }, error);
    };
    UniversalBot.prototype.getStorage = function () {
        if (!this.settings.storage) {
            this.settings.storage = new BotStorage_1.MemoryBotStorage();
        }
        return this.settings.storage;
    };
    UniversalBot.prototype.tryCatch = function (fn, error) {
        try {
            fn();
        }
        catch (e) {
            try {
                if (error) {
                    error(e, null);
                }
            }
            catch (e2) {
                this.emitError(e2);
            }
        }
    };
    UniversalBot.prototype.errorLogger = function (done) {
        var _this = this;
        return function (err, result) {
            if (err) {
                _this.emitError(err);
            }
            if (done) {
                done(err, result);
                done = null;
            }
        };
    };
    UniversalBot.prototype.emitError = function (err) {
        var m = err.toString();
        var e = err instanceof Error ? err : new Error(m);
        if (this.listenerCount('error') > 0) {
            this.emit('error', e);
        }
        else {
            console.error(e.stack);
        }
    };
    return UniversalBot;
}(Library_1.Library));
exports.UniversalBot = UniversalBot;
