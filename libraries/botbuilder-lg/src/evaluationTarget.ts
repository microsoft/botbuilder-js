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
    templateName: string;

    /**
     * Scope.
     */
    scope: MemoryInterface;

    /**
     * The children templates that this template has evaluated currently.
     */
    cachedEvaluatedChildren: Map<string, unknown>;

    /**
     * Creates a new instance of the [EvaluationTarget](xref:botbuilder-lg.EvaluationTarget) class.
     *
     * @param templateName Template name.
     * @param scope Template scope.
     */
    constructor(templateName: string, scope: MemoryInterface) {
        this.templateName = templateName;
        this.scope = scope;
        this.cachedEvaluatedChildren = new Map<string, unknown>();
    }

    /**
     * Get current instance id. If two target has the same Id,
     * we can say they have the same template evaluation result.
     *
     * @returns Id.
     */
    getId(): string {
        const scopeVersion = this.scope ? this.scope.version() : '';
        return this.templateName + scopeVersion;
    }
}
