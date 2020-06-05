
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { MemoryInterface } from 'adaptive-expressions';


/**
 * Runtime template state.
 */
export class EvaluationTarget {

    /**
     * Template name.
     */
    public templateName: string;

    /**
     * Scope.
     */
    public scope: MemoryInterface;

    /**
     * The children templates that this template has evaluated currently. 
     */
    public  evaluatedChildren: Map<string, any>;
    public constructor(templateName: string, scope: MemoryInterface) {
        this.templateName = templateName;
        this.scope = scope;
        this.evaluatedChildren = new Map<string, any>();
    }

    /**
     * Get current instance id. If two target has the same Id,
     * we can say they have the same template evaluation result.
     * @returns Id.
     */
    public getId(): string {
        const scopeVersion = this.scope ? this.scope.version() : '';
        return this.templateName + scopeVersion;
    }
}
