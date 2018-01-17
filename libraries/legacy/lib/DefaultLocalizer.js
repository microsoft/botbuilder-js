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
Object.defineProperty(exports, "__esModule", { value: true });
var Library_1 = require("./bots/Library");
var systemResources = require("./systemResources");
var logger = require("./logger");
var consts = require("./consts");
var fs = require("fs");
var async = require("async");
var Promise = require("promise");
var path = require("path");
var DefaultLocalizer = /** @class */ (function () {
    function DefaultLocalizer(root, defaultLocale) {
        this.localePaths = [];
        this.locales = {};
        this.defaultLocale(defaultLocale || 'en');
        // Find all of the searchable 
        var libsSeen = {};
        var _that = this;
        function addPaths(library) {
            // Protect against circular references.
            if (!libsSeen.hasOwnProperty(library.name)) {
                libsSeen[library.name] = true;
                // Add paths for child libraries
                library.forEachLibrary(function (child) {
                    addPaths(child);
                });
                // Add libraries '/locale/' folder to list of known paths.
                // - Order is important here. We want the bots root path to be last so that any
                //   overrides for the bot will be applied last.
                var path = library.localePath();
                if (path && fs.existsSync(path)) {
                    _that.localePaths.push(path);
                }
            }
        }
        libsSeen[Library_1.systemLib.name] = true; // <-- skip system library
        addPaths(root);
    }
    DefaultLocalizer.prototype.defaultLocale = function (locale) {
        if (locale) {
            this._defaultLocale = locale;
        }
        else {
            return this._defaultLocale;
        }
    };
    DefaultLocalizer.prototype.load = function (locale, done) {
        var _this = this;
        logger.debug("localizer.load(%s)", locale);
        // Build list of locales to load
        locale = locale ? locale : this._defaultLocale;
        var fbDefault = this.getFallback(this._defaultLocale);
        var fbLocale = this.getFallback(locale);
        var locales = ['en'];
        if (fbDefault !== 'en') {
            locales.push(fbDefault);
        }
        if (this._defaultLocale !== fbDefault) {
            locales.push(this._defaultLocale);
        }
        if (fbLocale !== fbDefault) {
            locales.push(fbLocale);
        }
        if (locale !== fbLocale && locale !== this._defaultLocale) {
            locales.push(locale);
        }
        // Load locales in parallel
        async.each(locales, function (locale, cb) {
            _this.loadLocale(locale).done(function () { return cb(); }, function (err) { return cb(err); });
        }, function (err) {
            if (done) {
                done(err);
            }
        });
    };
    DefaultLocalizer.prototype.trygettext = function (locale, msgid, ns) {
        // Calculate fallbacks
        locale = locale ? locale : this._defaultLocale;
        var fbDefault = this.getFallback(this._defaultLocale);
        var fbLocale = this.getFallback(locale);
        // Calculate namespaced key
        ns = ns ? ns.toLocaleLowerCase() : null;
        var key = this.createKey(ns, msgid);
        // Lookup entry
        var text = this.getEntry(locale, key);
        if (!text && fbLocale !== locale) {
            text = this.getEntry(fbLocale, key);
        }
        if (!text && this._defaultLocale !== locale) {
            text = this.getEntry(this._defaultLocale, key);
        }
        if (!text && fbDefault !== this._defaultLocale) {
            text = this.getEntry(fbDefault, key);
        }
        if (!text && fbDefault !== 'en') {
            text = this.getEntry('en', key);
        }
        // Return localized message
        return text ? this.getValue(text) : null;
    };
    DefaultLocalizer.prototype.gettext = function (locale, msgid, ns) {
        return this.trygettext(locale, msgid, ns) || msgid;
    };
    DefaultLocalizer.prototype.ngettext = function (locale, msgid, msgid_plural, count, ns) {
        return count == 1 ? this.gettext(locale, msgid, ns) : this.gettext(locale, msgid_plural, ns);
    };
    DefaultLocalizer.prototype.getFallback = function (locale) {
        if (locale) {
            var split = locale.indexOf("-");
            if (split != -1) {
                return locale.substring(0, split);
            }
        }
        return this.defaultLocale();
    };
    DefaultLocalizer.prototype.loadLocale = function (locale) {
        var _this = this;
        var asyncEachSeries = Promise.denodeify(async.eachSeries);
        // Load local on first access
        if (!this.locales.hasOwnProperty(locale)) {
            var entry;
            this.locales[locale] = entry = { loaded: null, entries: {} };
            entry.loaded = new Promise(function (resolve, reject) {
                _this.loadSystemResources(locale)
                    .then(function () {
                    return asyncEachSeries(_this.localePaths, function (localePath, cb) {
                        _this.loadLocalePath(locale, localePath).done(function () { return cb(); }, function (err) { return cb(err); });
                    });
                }).done(function () { return resolve(true); }, function (err) { return reject(err); });
            });
        }
        return this.locales[locale].loaded;
    };
    DefaultLocalizer.prototype.loadLocalePath = function (locale, localePath) {
        var _this = this;
        var dir = path.join(localePath, locale);
        var entryCount = 0;
        var p = new Promise(function (resolve, reject) {
            var access = Promise.denodeify(fs.access);
            var readdir = Promise.denodeify(fs.readdir);
            var asyncEach = Promise.denodeify(async.each);
            access(dir)
                .then(function () {
                // Directory exists
                return readdir(dir);
            })
                .then(function (files) {
                // List of files retreived
                return asyncEach(files, function (file, cb) {
                    if (file.substring(file.length - 5).toLowerCase() == ".json") {
                        logger.debug("localizer.load(%s) - Loading %s/%s", locale, dir, file);
                        _this.parseFile(locale, dir, file)
                            .then(function (count) {
                            entryCount += count;
                            cb();
                        }, function (err) {
                            logger.error("localizer.load(%s) - Error reading %s/%s: %s", locale, dir, file, err.toString());
                            cb();
                        });
                    }
                    else {
                        cb();
                    }
                });
            })
                .then(function () {
                // Files successfully added
                resolve(entryCount);
            }, function (err) {
                if (err.code === 'ENOENT') {
                    // No local directory
                    logger.debug("localizer.load(%s) - Couldn't find directory: %s", locale, dir);
                    resolve(-1);
                }
                else {
                    logger.error('localizer.load(%s) - Error: %s', locale, err.toString());
                    reject(err);
                }
            });
        });
        return p;
    };
    DefaultLocalizer.prototype.parseFile = function (locale, localeDir, filename) {
        var _this = this;
        var table = this.locales[locale];
        return new Promise(function (resolve, reject) {
            var filePath = path.join(localeDir, filename);
            var readFile = Promise.denodeify(fs.readFile);
            readFile(filePath, 'utf8')
                .then(function (data) {
                // Find namespace 
                var ns = path.parse(filename).name.toLocaleLowerCase();
                if (ns == 'index') {
                    ns = null;
                }
                // Add entries to map
                try {
                    // Parse locale file and add entries to table
                    var cnt = 0;
                    var entries = JSON.parse(data);
                    for (var key in entries) {
                        var k = _this.createKey(ns, key);
                        table.entries[k] = entries[key];
                        ++cnt;
                    }
                    resolve(cnt);
                }
                catch (error) {
                    return reject(error);
                }
            }, function (err) {
                reject(err);
            });
        });
    };
    DefaultLocalizer.prototype.loadSystemResources = function (locale) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var entries = systemResources.locales[(locale || '').toLowerCase()];
            if (entries) {
                // Add system resource strings to table
                var cnt = 0;
                var table = _this.locales[locale];
                var ns = Library_1.systemLib.name.toLocaleLowerCase();
                for (var key in entries) {
                    var k = _this.createKey(ns, key);
                    table.entries[k] = entries[key];
                    ++cnt;
                }
                resolve(cnt);
            }
            else {
                // Locale not supported
                logger.debug("localizer.loadSystemResources(%s) - Locale not supported.", locale);
                resolve(-1);
            }
        });
    };
    DefaultLocalizer.prototype.createKey = function (ns, msgid) {
        var escapedMsgId = this.escapeKey(msgid);
        var prepend = "";
        if (ns && ns !== consts.Library.default) {
            prepend = ns + ":";
        }
        return prepend + msgid;
    };
    DefaultLocalizer.prototype.escapeKey = function (key) {
        return key.replace(/:/g, "--").toLowerCase();
    };
    DefaultLocalizer.prototype.getEntry = function (locale, key) {
        return this.locales.hasOwnProperty(locale) && this.locales[locale].entries.hasOwnProperty(key) ? this.locales[locale].entries[key] : null;
    };
    DefaultLocalizer.prototype.getValue = function (text) {
        return typeof text == "string" ? text : this.randomizeValue(text);
    };
    DefaultLocalizer.prototype.randomizeValue = function (a) {
        var i = Math.floor(Math.random() * a.length);
        return this.getValue(a[i]);
    };
    return DefaultLocalizer;
}());
exports.DefaultLocalizer = DefaultLocalizer;
