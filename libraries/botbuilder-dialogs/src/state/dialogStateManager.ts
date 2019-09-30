/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext } from '../dialogContext';
import { PathResolver } from './pathResolver';
import { DefaultPathResolver } from './defaultPathResolver';

export class DialogStateManager {
    private readonly dc: DialogContext;
    private readonly closureScopes: object[] = [];

    constructor(dc: DialogContext) {
        this.dc = dc;

        // Add turn scope
        if (!this.getScope('turn')) {
            this.setScope('turn', {});
        }
    }

    public getScope(name: string): object|undefined {
        if (name == 'dialog') {
            const instance = this.dc.activeDialog;
            return instance ? instance.state : undefined;
        } else {
            const scopes: object = this.dc.context.turnState.get(SCOPES);
            return scopes ? scopes[name] : undefined;
        }
    }

    public setScope(name: string, state: object): this {
        if (name == 'dialog') { throw new Error(`DialogStateManager: cannot set a scope. The name "dialog" is a reserved scope.`) }
        let scopes: object = this.dc.context.turnState.get(SCOPES);
        if (!scopes) {
            scopes = {};
            this.dc.context.turnState.set(SCOPES, scopes);
        }
        scopes[name] = state;
        return this;
    }

    public getValue(path: string, defaultValue?: any): any {
        const memory = this.getMemory();
        return this.findResolver(path).getValue(this.dc, memory, path, defaultValue);
    }

    public setValue(path: string, value: any): void {
        const memory = this.getMemory();
        return this.findResolver(path).setValue(this.dc, memory, path, value);
    }

    public removeValue(path: string): void {
        const memory = this.getMemory();
        return this.findResolver(path).removeValue(this.dc, memory, path);
    }

    public pushClosureScope(): void {
        this.closureScopes.push({});
    }

    public popClosureScope(): void {
        if (this.closureScopes.length > 0) {
            this.closureScopes.pop();
        }
    }

    public getMemory(): object[] {
        // Initialize memory with current scopes
        const scopes: object = this.dc.context.turnState.get(SCOPES);
        const memory = Object.assign({}, scopes);

        // Add dialog state to memory
        const instance = this.dc.activeDialog;
        if (instance) {
            memory['dialog'] = instance.state;
        }

        // Append closure scopes to base memory
        const output = this.closureScopes.slice();
        output.unshift(memory);

        return output;
    }

    private findResolver(path: string): PathResolver {
        // Search registered resolvers first
        for (let i = 0; i < resolvers.length; i++) {
            const resolver = resolvers[i];
            if (resolver.matched(this.dc, path)) {
                return resolver;
            }
        }

        // Otherwise return default
        return defaultResolver;
    }

    static addPathResolver(resolver: PathResolver): void {
        resolvers.push(resolver);
    }
}

const resolvers: PathResolver[] = [];
const defaultResolver = new DefaultPathResolver();

const SCOPES = Symbol('scopes');
