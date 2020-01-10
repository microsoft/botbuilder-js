/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ITypeBuilder } from "./factory/typeBuilder";

export class TypeRegistration {
    constructor(name: string, builder: ITypeBuilder) {
        this.name = name;
        this.builder = builder;
    }

    public name: string;

    public builder: ITypeBuilder;
}