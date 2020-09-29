/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TypeBuilder } from './factory/typeBuilder';

/**
 * Registers a builder to receive notifications on builder events.
 */
export class BuilderRegistration {
    /**
     * Creates a new instance of the `BuilderRegistration` class.
     * @param name Name for the builder.
     * @param builder Type Builder.
     */
    public constructor(name: string, builder: TypeBuilder) {
        this.name = name;
        this.builder = builder;
    }

    public name: string;

    public builder: TypeBuilder;
}
