
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { CustomizedMemory } from './customizedMemory';
/**
 * Runtime template context store
 */

/**
 * Runtime template state.
 */
export class EvaluationTarget {

    /**
     * template name.
     */
    public templateName: string;

    /**
     * Scope.
     */
    public scope: any;

    /**
     * The children template that this template has evaluated currently. 
     */
    public  evaluatedChildren: Map<string, any>;
    public constructor(templateName: string, scope: any) {
        this.templateName = templateName;
        this.scope = scope;
        this.evaluatedChildren = new Map<string, any>();
    }

    /**
     * Get current instance id. If two target has the same Id,
     * we can say they have the same template evaluation.
     * @returns id.
     */
    public getId(): string {
        const memory = this.scope as CustomizedMemory;
        let result = this.templateName;
        if (memory) {
            if (memory.globalMemory) {
                const version = memory.globalMemory.version();
                if (version) {
                    result = result.concat(version);
                }
            }

            if (memory.localMemory) {
                const localMemoryString = memory.localMemory.toString();
                if (localMemoryString) {
                    result = result.concat(localMemoryString);
                }
            }
        }

        return result;
    }
}
