/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TypeBuilder } from './factory/typeBuilder';

export class BuilderRegistration {
    public constructor(name: string, builder: TypeBuilder) {
        this.name = name;
        this.builder = builder;
    }

    public name: string;

    public builder: TypeBuilder;
}
