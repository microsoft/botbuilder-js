/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TypeBuilder } from './typeBuilder';

/**
 * Declarative type factory
 */
export class TypeFactory {

    /**
     * Internal type builder registry
     */
    private readonly registrations: { [name: string]: TypeBuilder } = {};

    /**
     * Registers a new type in the factory
     * @param name name under which to register the type
     * @param converter optional builder logic for the registered type. Will be invoked each time the type is built
     */
    public register(name: string, builder?: TypeBuilder): void {

        if (!name) {
            throw new Error(`TypeFactory: name must be provided to register in the factory`);
        }

        if (!builder) {
            throw new Error(`TypeFactory: builder must be provided to register in the factory`);
        }

        this.registrations[name] = builder;
    }

    public build(name: string, config: object): object {

        if (!name) {
            throw new Error(`TypeFactory: type name must be provided.`)
        }

        const builder = this.registrations[name];

        if (!builder) {
            throw new Error(`TypeFactory: type ${ name } not registered in factory.`)
        }

        return builder.build(config);
    }
}
