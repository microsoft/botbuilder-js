/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export enum QuantifierType {
    all = 'all',
    any = 'any'
}

export class Quantifier {
    public constructor(variable: string, type: QuantifierType, bindings: string[]) {
        this.variable = variable;
        this.type = type;
        this.bindings = bindings;
    }
    
    public readonly variable: string;
    
    public readonly type: QuantifierType;

    public readonly bindings: string[];
    
    public toString(): string {
        return `${ this.type } ${ this.variable } ${ this.bindings.length }`;
    }
}