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
    public TemplateName: string;
    public Scope: any;
    public  EvaluatedChildren : Map<string, any>;
    public constructor(templateName: string, scope: any) {
        this.TemplateName = templateName;
        this.Scope = scope;
        this.EvaluatedChildren = new Map<string, any>();
    }

    public GetId(): string {
        if (this.Scope !== undefined && this.Scope !== null) {
            return this.TemplateName + JSON.stringify(this.Scope);
        }

        return this.TemplateName;
    }
}
