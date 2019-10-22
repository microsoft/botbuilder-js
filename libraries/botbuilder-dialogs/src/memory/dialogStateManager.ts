/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PathResolver, DollarPathResolver, HashPathResolver, AtAtPathResolver, AtPathResolver, PercentPathResolver } from './pathResolvers';
import { MemoryScope, ScopePath, SettingsMemoryScope, DialogMemoryScope, ClassMemoryScope, ThisMemoryScope } from './scopes';
import { DialogContext } from '../dialogContext';

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

    /**
     * List of path resolvers used to evaluate memory paths.
     */
    static readonly pathResolvers: PathResolver[] = [];

    /**
     * List of the supported memory scopes.
     */
    static readonly memoryScopes: MemoryScope[] = [];

    constructor(dc: DialogContext)
    {
        this.dialogContext = dc;
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
        const segments = this.normalizePath(this.transformPath(pathExpression)).split('.');
        if (segments.length < 1) { return returnDefault() }

        // Get memory scope to search over
        const scope = this.getMemoryScope(segments[0]);
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
        const segments = this.normalizePath(this.transformPath(pathExpression)).split('.');
        if (segments.length < 1) { return }

        // Get memory scope to update
        const scope = this.getMemoryScope(segments[0]);
        if (scope == undefined) { throw new Error(`DialogStateManager.setValue: a scope of '${segments[0]}' wasn't found.`) }

        // Update memory
        if (segments.length > 1) {
            // Find value up to last key
            let key = segments.pop();
            const memory = this.resolveSegments(scope.getMemory(this.dialogContext), segments, true);

            // Update value
            if (Array.isArray(memory)) {
                const index = parseInt(key);
                if (index < 0) {
                    memory.push(value);
                } else {
                    memory[index] = value;
                }
            } else if (typeof memory == 'object') {
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
        const segments = this.normalizePath(this.transformPath(pathExpression)).split('.');
        if (segments.length < 2) { throw new Error(`DialogStateManager.removeValue: invalid path of '${pathExpression}'.`) }

        // Get memory scope to update
        const scope = this.getMemoryScope(segments[0]);
        if (scope == undefined) { throw new Error(`DialogStateManager.removeValue: a scope of '${segments[0]}' wasn't found.`) }

        // Find value up to last key
        let key = segments.pop();
        const memory = this.resolveSegments(scope.getMemory(this.dialogContext), segments, false);

        // Update value
        if (Array.isArray(memory)) {
            const index = parseInt(key);
            if (index < 0) {
                memory.pop();
            } else {
                memory.splice(index, 1);
            }
        } else if (typeof memory == 'object') {
            const found = this.findObjectKey(memory, key);
            if (found) {
                delete memory[found];
            }
        }
    }

    /**
     * Normalizes the path segments of a passed in path.
     * 
     * @remarks
     * A path of `profile.address[0]` will be normalized to `profile.address.0`.    
     * @param pathExpression The path to normalize.
     * @returns The normalized path.
     */
    public normalizePath(pathExpression: string): string {
        function appendSegment() {
            // Check for quotes
            if ((segment.startsWith("'") && segment.endsWith("'")) || 
                (segment.startsWith('"') && segment.endsWith('"'))) {
                segment = segment.length > 2 ? segment.substr(1, segment.length - 2) : '';
            }

            // Append segment
            if (segment.length > 0) {
                if (output.length > 0) { output += '.' }
                output += segment;
                segment = '';
            }
        }

        // Expand path segments
        let output = '';
        let segment = '';
        let inIndexer = false;
        let depth = 0;
        let invalid = false;
        for (let i = 0; i < pathExpression.length; i++) {
            const c = pathExpression[i];
            if (depth == 0) {
                switch (c) {
                    case '{':
                        if (!inIndexer) {
                            depth++;
                        } else {
                            invalid = true;
                        }
                        break;

                    case '[':
                        if (!inIndexer) {
                            appendSegment();
                            inIndexer = true;
                        } else {
                            invalid = true;
                        }
                        break;
    
                    case ']':
                        if (inIndexer) {
                            inIndexer = false;
                            appendSegment();
                        } else {
                            invalid = true;
                        }
                        break;
    
                    case '.':
                        if (!inIndexer) {
                            appendSegment();
                        } else {
                            invalid = true;
                        }
                        break;
                    
                    default:
                        segment += c;
                        break;
                }
            } else {
                // Check for change to expression depth
                switch (c) {
                    case '{':
                        depth++;
                        break;

                    case '}':
                        depth--;
                        break;
                }

                // Append char if still in expression otherwise resolve the expressions value
                if (depth > 0) {
                    segment += c;
                } else {
                    const value = this.getValue(segment);
                    const type = typeof value;
                    segment = type == 'string' || type == 'number' ? value.toString() : '<undefined>';
                    appendSegment();
                }
            }

            // Is the path valid?
            if (invalid) {
                throw new Error(`DialogStateManager.normalizePath: Invalid path detected - ${pathExpression}`);
            }
        }
        if (inIndexer || depth > 0) {
            throw new Error(`DialogStateManager.normalizePath: Invalid path detected - ${pathExpression}`);
        }
        appendSegment();

        return output;
    }

    /**
     * Transform the path using the registered path transformers.
     * @param pathExpression The path to transform.
     * @returns The transformed path.
     */
    public transformPath(pathExpression: string): string {
        // Run path through registered resolvers.
        const resolvers = this.getPathResolvers();
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
        this.getMemoryScopes().forEach((scope) => {
            if (!scope.isReadOnly) {
                output[scope.name] = scope.getMemory(this.dialogContext);
            }
        });

        return output;
    }


    private resolveSegments(memory: object, segments: string[], ensurePath?: boolean): any {
        let value: any = memory;
        for (let i = 1; i < segments.length; i++) {
            // Check for undefined key
            let key = segments[i];
            if (key == '<undefined>') {
                value = undefined;
                break;
            }

            // Lookup key
            if (Array.isArray(value)) {
                value = value[parseInt(key)];
            } else if (typeof value == 'object') {
                // Case-insensitive search for prop
                let found = this.findObjectKey(value, key);

                // Ensure path exists as needed
                if (ensurePath) {
                    if (found && !(Array.isArray(value[found]) || typeof value[found] == 'object')) {
                        // Path segment exists but isn't an Array or Object.
                        value[found] = {};
                    } else {
                        // Path segment not found so add it as an empty Object.
                        found = segments[i];
                        value[found] = {};
                    }
                }

                value = found ? value[found] : undefined;
            } else {
                value = undefined;
                break;
            }
        }
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

    private getPathResolvers(): PathResolver[] {
        if (DialogStateManager.pathResolvers.length == 0) {
            DialogStateManager.pathResolvers.push(
                new DollarPathResolver(),
                new HashPathResolver(),
                new AtAtPathResolver(),
                new AtPathResolver(),
                new PercentPathResolver()
            );
        }

        return DialogStateManager.pathResolvers;
    }

    private getMemoryScopes(): MemoryScope[] {
        if (DialogStateManager.memoryScopes.length == 0) {
            DialogStateManager.memoryScopes.push(
                new MemoryScope(ScopePath.USER),
                new MemoryScope(ScopePath.CONVERSATION),
                new MemoryScope(ScopePath.TURN),
                new SettingsMemoryScope(),
                new DialogMemoryScope(),
                new ClassMemoryScope(),
                new ThisMemoryScope()
            );
        }

        return DialogStateManager.memoryScopes;
    }

    private getMemoryScope(name: string): MemoryScope | undefined {
        const key = name.toLowerCase();
        const scopes = this.getMemoryScopes();
        for (let i = 0; i < scopes.length; i++) {
            const scope = scopes[i];
            if (scope.name.toLowerCase() == key) {
                return scope;
            }
        }

        return undefined;
    }
}
