import { CustomizedMemory } from './customizedMemory';

/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Runtime template context store
 */

export class EvaluationTarget {
    public templateName: string;
    public scope: any;
    public  evaluatedChildren: Map<string, any>;
    public constructor(templateName: string, scope: any) {
        this.templateName = templateName;
        this.scope = scope;
        this.evaluatedChildren = new Map<string, any>();
    }

    public getId(): string {
        const memory = this.scope as CustomizedMemory;
        let result = this.templateName;
        if (memory !== undefined) {
            if (memory.globalMemory !== undefined){
                const version = memory.globalMemory.version();
                if (version !== undefined) {
                    result = result.concat(version);
                }
            }

            if (memory.localMemory !== undefined){
                const localMemoryString = memory.localMemory.toString();
                if (localMemoryString !== undefined) {
                    result = result.concat(localMemoryString);
                }
            }
        }

        return result;
    }
}
