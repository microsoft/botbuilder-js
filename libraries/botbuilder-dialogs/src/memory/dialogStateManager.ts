/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PathResolver, DollarPathResolver, HashPathResolver, AtAtPathResolver, AtPathResolver, PercentPathResolver } from './pathResolvers';
import { MemoryScope, SettingsMemoryScope, DialogMemoryScope, ClassMemoryScope, ThisMemoryScope } from './scopes';
import { DialogContext } from '../dialogContext';
import { ConversationState, UserState } from 'botbuilder-core';
import { ConversationMemoryScope } from './scopes/conversationMemoryScope';
import { TurnMemoryScope } from './scopes/turnMemoryScope';
import { UserMemoryScope } from './scopes/userMemoryScope';
import { DialogPath } from '../constants';

export interface DialogStateManagerConfiguration {
    /**
     * List of path resolvers used to evaluate memory paths.
     */
    readonly pathResolvers: PathResolver[];

    /**
     * List of the supported memory scopes.
     */
    readonly memoryScopes: MemoryScope[];
}

const PATH_TRACKER = 'dialog._tracker.paths';

/**
 * The DialogStateManager manages memory scopes and path resolvers.
 * 
 * @remarks
 * MemoryScopes are named root level objects, which can exist either in the dialog context or off 
 * of turn state. Path resolvers allow for shortcut behavior for mapping things like 
 * $foo -> dialog.foo
 */
export class DialogStateManager {
    private readonly dialogContext: DialogContext;
    private _config: DialogStateManagerConfiguration;

    constructor(dc: DialogContext) {
        this.dialogContext = dc;
    }

    /**
     * Gets or sets the configured path resolvers and memory scopes for the dialog state manager.
     * 
     * @remarks
     * There is a single set of configuration information for a given chain of dialog contexts. 
     * Assigning a new configuration to any DialogStateManager within the chain will update the
     * configuration for the entire chain.
     */
    public get configuration(): DialogStateManagerConfiguration {
        if (this.dialogContext.parent) {
            return this.dialogContext.parent.state.configuration;
        } else {
            if (this._config == undefined) {
                this._config = DialogStateManager.createStandardConfiguration();
            }

            return this._config;
        }
    }

    public set configuration(value: DialogStateManagerConfiguration) {
        if (this.dialogContext.parent) {
            throw new Error(`DialogStateManager.configuration: configuration should only be assigned to root dialog context.`);
        } else {
            this._config = value;
        }
    }

    /**
     * Get the value from memory using path expression.
     * 
     * @remarks
     * This always returns a CLONE of the memory, any modifications to the result will not affect memory.
     * @param T The value type to return.
     * @param pathExpression Path expression to use.
     * @param defaultValue (Optional) default value to use if the path isn't found. May be a function that returns the default value to use.
     * @returns The found value or undefined if not found and no `defaultValue` specified.
     */
    public getValue<T = any>(pathExpression: string, defaultValue?: T|(() => T)): T {
        function returnDefault(): T {
            return typeof defaultValue == 'function' ? (defaultValue as Function)() : defaultValue;  
        }

        // Get path segments
        const segments = this.parsePath(this.transformPath(pathExpression));
        if (segments.length < 1) { return returnDefault() }

        // Get memory scope to search over
        const scope = this.getMemoryScope(segments[0].toString());
        if (scope == undefined) { throw new Error(`DialogStateManager.getValue: a scope of '${segments[0]}' wasn't found.`) }
        
        // Search over path
        const memory = this.resolveSegments(scope.getMemory(this.dialogContext), segments, false);

        // Return default value if nothing found
        return memory != undefined ? memory : returnDefault();
    }

    /**
     * Set memory to value.
     * @param pathExpression Path to memory. 
     * @param value Value to set.
     */
    public setValue(pathExpression: string, value: any): void {
        // Get path segments
        const tpath = this.transformPath(pathExpression);
        const segments = this.parsePath(tpath);
        if (segments.length < 1) { throw new Error(`DialogStateManager.setValue: path wasn't specified.`) }

        // Track changes
        this.trackChange(tpath);

        // Get memory scope to update
        const scope = this.getMemoryScope(segments[0].toString());
        if (scope == undefined) { throw new Error(`DialogStateManager.setValue: a scope of '${segments[0]}' wasn't found.`) }

        // Update memory
        if (segments.length > 1) {
            // Find value up to last key
            // - Missing paths will be populated as needed
            let memory = scope.getMemory(this.dialogContext);
            memory = this.resolveSegments(memory, segments, true);

            // Update value
            let key = segments[segments.length - 1];
            if (key === 'first()') { key = 0 };
            if (typeof key == 'number' && Array.isArray(memory)) {
                // Only allow positive indexes
                if (key < 0) { throw new Error(`DialogStateManager.setValue: unable to update value for '${pathExpression}'. Negative indexes aren't allowed.`) } 
                
                // Expand array as needed and update array
                const l = key + 1;
                while (memory.length < l) {
                    memory.push(undefined);
                }
                memory[key] = value;
            } else if (typeof key == 'string' && key.length > 0 && typeof memory == 'object' && !Array.isArray(memory)) {
                // Find key to use and update object
                key = this.findObjectKey(memory, key) || key;
                memory[key] = value;
            } else {
                throw new Error(`DialogStateManager.setValue: unable to update value for '${pathExpression}'.`);
            }
        } else {
            // Just update memory scope
            scope.setMemory(this.dialogContext, value);
        }
    }

    /**
     * Delete property from memory
     * @param path The leaf property to remove.
     */
    public deleteValue(pathExpression: string): void {
        // Get path segments
        const tpath = this.transformPath(pathExpression);
        const segments = this.parsePath(tpath);
        if (segments.length < 2) { throw new Error(`DialogStateManager.deleteValue: invalid path of '${pathExpression}'.`) }

        // Track change
        this.trackChange(tpath);

        // Get memory scope to update
        const scope = this.getMemoryScope(segments[0].toString());
        if (scope == undefined) { throw new Error(`DialogStateManager.deleteValue: a scope of '${segments[0]}' wasn't found.`) }

        // Find value up to last key
        let key = segments.pop();
        const memory = this.resolveSegments(scope.getMemory(this.dialogContext), segments, false);

        // Update value
        if (typeof key == 'number' && Array.isArray(memory)) {
            if (key < memory.length) {
                memory.splice(key, 1);
            }
        } else if (typeof key == 'string' && key.length > 0 && typeof memory == 'object' && !Array.isArray(memory)) {
            const found = this.findObjectKey(memory, key);
            if (found) {
                delete memory[found];
            }
        }
    }

    /**
     * Ensures that all memory scopes have been loaded for the current turn.
     * 
     * @remarks
     * This should be called at the beginning of the turn.
     */
    public async loadAllScopes(): Promise<void> {
        const scopes = this.configuration.memoryScopes;
        for (let i = 0; i < scopes.length; i++) {
            await scopes[i].load(this.dialogContext);
        }
    }

    /**
     * Saves any changes made to memory scopes.
     * 
     * @remarks
     * This should be called at the end of the turn.
     */
    public async saveAllChanges(): Promise<void> {
        const scopes = this.configuration.memoryScopes;
        for (let i = 0; i < scopes.length; i++) {
            await scopes[i].saveChanges(this.dialogContext);
        }
    }

    /**
     * Deletes all of the backing memory for a given scope.
     */
    public async deleteScopesMemory(name: string): Promise<void> {
        name = name.toLowerCase();
        const scopes = this.configuration.memoryScopes;
        for (let i = 0; i < scopes.length; i++) {
            const scope = scopes[i];
            if (scope.name.toLowerCase() == name) {
                await scope.delete(this.dialogContext);
                break;
            }
        }
    }

    /**
     * Normalizes the path segments of a passed in path.
     * 
     * @remarks
     * A path of `profile.address[0]` will be normalized to `profile.address.0`.    
     * @param pathExpression The path to normalize.
     * @param allowNestedPaths Optional. If `false` then detection of a nested path will cause an empty path to be returned. Defaults to 'true'.
     * @returns The normalized path.
     */
    public parsePath(pathExpression: string, allowNestedPaths = true): (string|number)[] {
        // Expand path segments
        let segment = '';
        let depth = 0;
        let quote = '';
        const output: (string|number)[] = [];
        for (let i = 0; i < pathExpression.length; i++) {
            const c = pathExpression[i];
            if (depth > 0) {
                // We're in a set of brackets
                if (quote.length) {
                    // We're in a string
                    switch (c) {
                        case '\\':
                            // Escape code detected
                            i++;
                            segment += pathExpression[i];
                            break;
                        default:
                            segment += c;
                            if (c == quote) {
                                quote = '';
                            }
                            break;
                    }
                } else {
                    // We're in a bracket 
                    switch (c) {
                        case '[':
                            depth++;
                            segment += c;
                            break;
                        case ']':
                            depth--;
                            if (depth > 0) { segment += c }
                            break;
                        case "'":
                        case '"':
                            quote = c;
                            segment += c;
                            break;
                        default:
                            segment += c;
                            break;
                    }

                    // Are we out of the brackets
                    if (depth == 0) {
                        if (isQuoted(segment)) {
                            // Quoted segment
                            output.push(segment.length > 2 ? segment.substr(1, segment.length - 2) : '');
                        } else if (isIndex(segment)) {
                            // Array index
                            output.push(parseInt(segment));
                        } else if (allowNestedPaths) {
                            // Resolve nested value
                            const val = this.getValue(segment);
                            const t = typeof val;
                            output.push(t == 'string' || t == 'number' ? val : '');
                        } else {
                            // Abort parsing and return empty path (used for change tracking.)
                            return [];
                        }
                        segment = '';
                    }
                }
            } else {
                // We're parsing the outer path
                switch (c) {
                    case '[':
                        if (segment.length > 0) {
                            output.push(segment);
                            segment = '';
                        }
                        depth++;
                        break;
                    case '.':
                        if (segment.length > 0) {
                            output.push(segment);
                            segment = '';
                        } else if (i == 0 || i == (pathExpression.length - 1)) {
                            // Special case a "." at beginning or end of path
                            output.push('');
                        } else if (pathExpression[i - 1] == '.') {
                            // Special case ".."
                            output.push('');
                        }
                        break;
                    default:
                        if (isValidPathChar(c)) {
                            segment += c;
                        } else {
                            throw new Error(`DialogStateManager.normalizePath: Invalid path detected - ${pathExpression}`);
                        }
                        break;
                }
            }
        }
        if (depth > 0) {
            throw new Error(`DialogStateManager.normalizePath: Invalid path detected - ${pathExpression}`);
        } else if (segment.length > 0) {
            output.push(segment);
        }

        return output;
    }

    /**
     * Transform the path using the registered path transformers.
     * @param pathExpression The path to transform.
     * @returns The transformed path.
     */
    public transformPath(pathExpression: string): string {
        // Run path through registered resolvers.
        const resolvers = this.configuration.pathResolvers;
        for (let i = 0; i < resolvers.length; i++) {
            pathExpression = resolvers[i].transformPath(pathExpression);
        }

        return pathExpression;
    }

    /**
     * Gets all memory scopes suitable for logging.
     * @returns Object which represents all memory scopes.
     */
    public getMemorySnapshot(): object {
        const output = {};
        this.configuration.memoryScopes.forEach((scope) => {
            if (scope.includeInSnapshot) {
                output[scope.name] = scope.getMemory(this.dialogContext);
            }
        });

        return output;
    }

    /**
     * Track when specific paths are changed.
     * @param paths Paths to track.
     * @returns Normalized paths to pass to [anyPathChanged()](#anypathchanged).
     */
    public trackPaths(paths: string[]): string[] {
        const allPaths: string[] = [];
        paths.forEach((path) => {
            const tpath = this.transformPath(path);
            const segments = this.parsePath(tpath, false);
            if (segments.length > 0 && (segments.length == 1 || !segments[1].toString().startsWith('_'))) {
                // Normalize path and initialize change tracker
                const npath = segments.join('_').toLowerCase();
                this.setValue(`${PATH_TRACKER}.${npath}`, 0);

                // Return normalized path
                allPaths.push(npath);

            }
        });

        return allPaths;
    }

    /**
     * Check to see if any path has changed since watermark.
     * @param counter Time counter to compare to.
     * @param paths Paths from [trackPaths()](#trackpaths) to check.
     * @returns True if any path has changed since counter.
     */
    public anyPathChanged(counter: number, paths: string[]): boolean {
        let found = false;
        if (paths) {
            for (let i = 0; i < paths.length; i++) {
                if (this.getValue(`${PATH_TRACKER}.${paths[i]}`, 0) > counter) {
                    found = true;
                    break;
                }
            }
        }

        return found;
    }

    private trackChange(path: string): void {
        // Normalize path and scan for any matches or children that match.
        // - We're appending an extra '_' so that we can do substring matches and
        //   avoid any false positives.
        let counter: number = undefined;
        const npath = this.parsePath(path, false).join('_') + '_';
        const tracking: object = this.getValue(PATH_TRACKER) || {};
        for (const key in tracking) {
            if (`${key}_`.startsWith(npath)) {
                // Populate counter on first use
                if (counter == undefined) {
                    counter = this.getValue(DialogPath.EventCounter);
                }

                // Update tracking watermark
                this.setValue(`${PATH_TRACKER}.${key}`, counter);
            }
        }
    }

    private resolveSegments(memory: object, segments: (string|number)[], assignment?: boolean): any {
        let value: any = memory;
        const l = assignment ? segments.length - 1 : segments.length;
        for (let i = 1; i < l && value != undefined; i++) {
            let key = segments[i];
            if (typeof key == 'number') {
                // Key is an array index
                if (Array.isArray(value)) {
                    value = value[key];
                } else {
                    value = undefined;
                }
            } else if (key === 'first()') {
                // Special case returning the first entity in an array of entities.
                if (Array.isArray(value) && value.length > 0) {
                    value = value[0];
                    if (Array.isArray(value)) {
                        // Nested array detected
                        if (value.length > 0) {
                            value = value[0];
                        } else {
                            value = undefined;
                        }
                    }
                } else {
                    value = undefined;
                }
            } else if (typeof key == 'string' && key.length > 0) {
                // Key is an object index
                if (typeof value == 'object' && !Array.isArray(value)) {
                    // Case-insensitive search for prop
                    let found = this.findObjectKey(value, key);

                    // Ensure path exists as needed
                    if (assignment) {
                        const nextKey = segments[i + 1];
                        if (typeof nextKey == 'number' || nextKey === 'first()') {
                            // Ensure prop contains an array
                            if (found) {
                                if (value[found] == undefined) {
                                    value[found] = [];
                                }
                            } else {
                                found = key;
                                value[found] = [];
                            }
                        } else if (typeof nextKey == 'string' && nextKey.length > 0) {
                            // Ensure prop contains an object
                            if (found) {
                                if (value[found] == undefined) {
                                    value[found] = {};
                                }
                            } else {
                                found = key;
                                value[found] = {};
                            }
                        } else {
                            // We can't determine type so return undefined
                            found = undefined;
                        }
                    }

                    value = found ? value[found] : undefined;
                } else {
                    value = undefined;
                }
            } else {
                // Key is missing
                value = undefined;
            }
        }

        return value;
    }

    private findObjectKey(obj: object, key: string): string|undefined {
        const k = key.toLowerCase();
        for (const prop in obj) {
            if (prop.toLowerCase() == k) {
                return prop;
            }
        }

        return undefined;
    }

    private getMemoryScope(name: string): MemoryScope | undefined {
        const key = name.toLowerCase();
        const scopes = this.configuration.memoryScopes;
        for (let i = 0; i < scopes.length; i++) {
            const scope = scopes[i];
            if (scope.name.toLowerCase() == key) {
                return scope;
            }
        }

        return undefined;
    }

    static createStandardConfiguration(conversationState?: ConversationState, userState?: UserState): DialogStateManagerConfiguration {
        const config: DialogStateManagerConfiguration = { 
            pathResolvers: [
                new DollarPathResolver(),
                new HashPathResolver(),
                new AtAtPathResolver(),
                new AtPathResolver(),
                new PercentPathResolver()
            ],
            memoryScopes: [
                new TurnMemoryScope(),
                new SettingsMemoryScope(),
                new DialogMemoryScope(),
                new ClassMemoryScope(),
                new ThisMemoryScope()
            ]
        };

        // Add optional scopes
        if (conversationState) {
            config.memoryScopes.push(new ConversationMemoryScope(conversationState));
        }
        if (userState) {
            config.memoryScopes.push(new UserMemoryScope(userState));
        }

        return config;
    }

    public version(): string {
        return '0';
    }
}

/**
 * @private
 */
function isIndex(segment: string): boolean {
    const digits = '0123456789';
    for (let i = 0; i < segment.length; i++) {
        const c= segment[i];
        if (digits.indexOf(c) < 0) {
            // Check for negative sign 
            if (c != '-' || i > 0 || segment.length < 2) {
                return false;
            }
        }
    }

    return segment.length > 0;
}

/**
 * @private
 */
function isQuoted(segment: string): boolean {
    return segment.length > 1 && (segment.startsWith("'") && segment.endsWith("'")) || 
    (segment.startsWith('"') && segment.endsWith('"'));
}

/**
 * @private
 */
function isValidPathChar(c: string): boolean {
    return '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-()'.indexOf(c) >= 0;
}