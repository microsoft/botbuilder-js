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

import { Library, systemLib } from './bots/Library';
import * as systemResources from './systemResources';
import * as logger from './logger';
import * as consts from './consts';
import * as fs from 'fs';
import * as async from 'async';
import * as Promise from 'promise';
import * as path from 'path';

export class DefaultLocalizer implements ILocalizer {
    private _defaultLocale: string;
    private localePaths = <string[]>[];
    private locales: { [locale:string]: ILocaleEntry; } = {}

    constructor(root: Library, defaultLocale: string) {
        this.defaultLocale(defaultLocale || 'en');

        // Find all of the searchable 
        var libsSeen = <any>{};
        var _that = this;
        function addPaths(library: Library) {
            // Protect against circular references.
            if (!libsSeen.hasOwnProperty(library.name)) {
                libsSeen[library.name] = true;

                // Add paths for child libraries
                library.forEachLibrary((child) => {
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
        libsSeen[systemLib.name] = true;    // <-- skip system library
        addPaths(root);
    }

    public defaultLocale(locale?: string): string {
        if (locale) {
            this._defaultLocale = locale;
        } else {
            return this._defaultLocale;
        }
    }

    public load(locale: string, done?: (err: Error) => void): void {
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
        async.each(locales, (locale, cb) => {
            this.loadLocale(locale).done(() => cb(), (err: Error) => cb(err));
        }, (err: Error) => {
            if (done) {
                done(err);
            }    
        });
    }

    public trygettext(locale: string, msgid: string, ns: string): string {
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
    }

    public gettext(locale: string, msgid: string, ns: string): string {
        return this.trygettext(locale, msgid, ns) || msgid;
    } 

    public ngettext(locale: string, msgid: string, msgid_plural: string, count: number, ns: string): string {
        return count == 1 ? this.gettext(locale, msgid, ns) : this.gettext(locale, msgid_plural, ns);
    }   

    private getFallback(locale?: string): string {
        if (locale) {
            var split = locale.indexOf("-");
            if (split != -1) {
                return locale.substring(0, split);
            }
        }
        return this.defaultLocale();
    }
    private loadLocale(locale: string): Promise<boolean> {
        const asyncEachSeries = Promise.denodeify(async.eachSeries);

        // Load local on first access
        if (!this.locales.hasOwnProperty(locale)) {
            var entry: ILocaleEntry;
            this.locales[locale] = entry = { loaded: null, entries: {} };
            entry.loaded = new Promise((resolve, reject) => {
                this.loadSystemResources(locale)
                    .then(() => {
                        return asyncEachSeries(this.localePaths, (localePath: string, cb: (err?: Error) => void) => {
                            this.loadLocalePath(locale, localePath).done(() => cb(), (err: Error) => cb(err));
                        });
                    }).done(() => resolve(true), (err: Error) => reject(err));
            });
        } 
        return this.locales[locale].loaded;
    }

    private loadLocalePath(locale: string, localePath: string): Promise<number> {
        var dir = path.join(localePath, locale);
        var entryCount = 0;
        var p = new Promise<number>((resolve, reject) => {
            var access = Promise.denodeify(fs.access);
            var readdir = Promise.denodeify(fs.readdir);
            var asyncEach = Promise.denodeify(async.each);
            access(dir)
                .then(() =>{
                    // Directory exists
                    return readdir(dir);
                })
                .then((files: string[]) => {
                    // List of files retreived
                    return asyncEach(files, (file: string, cb: (err?: Error) => void) => {
                        if (file.substring(file.length - 5).toLowerCase() == ".json") {
                            logger.debug("localizer.load(%s) - Loading %s/%s", locale, dir, file);
                            this.parseFile(locale, dir, file)
                                .then((count: number) => {
                                    entryCount += count;
                                    cb();
                                }, (err: Error) => {
                                    logger.error("localizer.load(%s) - Error reading %s/%s: %s", locale, dir, file, err.toString());
                                    cb();
                                }); 
                        } else {
                            cb();
                        }
                    });
                })
                .then(() => {
                    // Files successfully added
                    resolve(entryCount);
                }, (err: Error) => {
                    if ((err as any).code === 'ENOENT') {
                        // No local directory
                        logger.debug("localizer.load(%s) - Couldn't find directory: %s", locale, dir);                                
                        resolve(-1);
                    } else {
                        logger.error('localizer.load(%s) - Error: %s', locale, err.toString());
                        reject(err);
                    }                        
                });
        });
        return p;
    }

    private parseFile(locale: string, localeDir: string, filename: string): Promise<number> {
        var table = this.locales[locale];
        return new Promise<number>((resolve, reject) => {
            var filePath = path.join(localeDir, filename);
            var readFile = Promise.denodeify(fs.readFile);
            readFile(filePath, 'utf8')
                .then((data) => {
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
                            var k = this.createKey(ns, key);
                            table.entries[k] = entries[key];
                            ++cnt;
                        }
                        resolve(cnt);                        
                    } catch (error) {
                        return reject(error);
                    }
                }, (err: Error) => {
                    reject(err);
                });
        });
    }

    private loadSystemResources(locale: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const entries = systemResources.locales[(locale || '').toLowerCase()];
            if (entries) {
                // Add system resource strings to table
                let cnt = 0;
                const table = this.locales[locale];
                const ns = systemLib.name.toLocaleLowerCase();
                for (const key in entries) {
                    var k = this.createKey(ns, key);
                    table.entries[k] = entries[key];
                    ++cnt;
                }
                resolve(cnt);                        
            } else {
                // Locale not supported
                logger.debug("localizer.loadSystemResources(%s) - Locale not supported.", locale);                                
                resolve(-1);
            }
        });
    }

    private createKey(ns: string, msgid: string) : string {
        var escapedMsgId = this.escapeKey(msgid);
        var prepend = "";
        if (ns && ns !== consts.Library.default) {
            prepend = ns + ":";
        }
        return prepend + msgid;
    }

    private escapeKey(key: string): string {
        return key.replace(/:/g, "--").toLowerCase();
    }

    private getEntry(locale: string, key: string): string|string[] {
        return this.locales.hasOwnProperty(locale) && this.locales[locale].entries.hasOwnProperty(key) ? this.locales[locale].entries[key] : null;
    }

    private getValue(text: string|string[]) : string {
        return typeof text == "string" ? text : this.randomizeValue(text);
    }

    private randomizeValue(a: Array<any>): string {
        var i = Math.floor(Math.random() * a.length);
        return this.getValue(a[i]);
    }
}

interface ILocaleEntry {
    loaded: Promise<boolean>;
    entries: {
        [key:string]: string|string[];
    };
}
