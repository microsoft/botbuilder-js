/**
 * @module botbuilder-expression-lg
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
    public  evaluatedChildren : Map<string, any>;
    public constructor(templateName: string, scope: any) {
        this.templateName = templateName;
        this.scope = scope;
        this.evaluatedChildren = new Map<string, any>();
    }

    public getId(): string {
        if (this.scope !== undefined && this.scope !== null) {
            return this.templateName + JSON.stringify(this.scope);
        }

        return this.templateName;
    }
}
