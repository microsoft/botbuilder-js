/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext } from "../../dialogContext";
import { TurnContext } from "botbuilder-core";

/**
 * MemoryScope represents a named memory scope stored in `TurnContext.turnState`.
 * 
 * @remarks
 * It is responsible for using the DialogContext to bind to the object for it. 
 * The default MemoryScope is stored in `TurnState[MemoryScope.MEMORYSCOPESKEY][Name]`
 * Example: User memory scope is tracked in `dc.context.TurnState[MemoryScope.MEMORYSCOPEKEY].User`
 */
export class MemoryScope {

    constructor(name: string, isReadOnly = false)
    {
        this.isReadOnly = isReadOnly;
        this.name = name;
    }

    /**
     * Gets or sets name of the scope
     */
    public name: string;

    /**
     * Gets or sets a value indicating whether this memory scope mutable.
     */
    public isReadOnly: boolean;

    /**
     * Get the backing memory for this scope
     * @param dc Current dialog context.
     * @returns memory for the scope
     */
    public getMemory(dc: DialogContext): object {
        const scopesMemory = this.getScopesMemory(dc.context);
        if (!scopesMemory.hasOwnProperty(this.name)) {
            // Initialize memory
            scopesMemory[this.name] = {};
        }

        return scopesMemory[this.name];
    }

    /**
     * Changes the backing object for the memory scope.
     * @param dc Current dialog context
     * @param memory memory to assign
     */
    public setMemory(dc: DialogContext, memory: object): void {
        if (this.isReadOnly) {
            throw new Error(`MemoryScope.setMemory: You cannot set the memory for a readonly memory scope`);
        }

        if (memory == undefined) {
            throw new Error(`MemoryScope.setMemory: null memory object passed in.`);
        }

        const namedScopes = this.getScopesMemory(dc.context);
        namedScopes[this.name] = memory;
    }

    /**
     * Get map of scopes cached on turn context.
     * @param context Current turn context.
     * @returns map of cached scopes.
     */
    protected getScopesMemory(context: TurnContext): { [name: string]: object; } {
        if (!context.turnState.has(MEMORYSCOPEKEY)) {
            context.turnState.set(MEMORYSCOPEKEY, {});
        }

        return context.turnState.get(MEMORYSCOPEKEY);
    }
}

/**
 * @private
 */
const MEMORYSCOPEKEY = Symbol('MemoryScopes');

