// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as z from 'zod';
import yargs from 'yargs-parser';
import { Configuration as CoreConfiguration } from 'botbuilder-dialogs-adaptive-runtime-core';
import { Provider } from 'nconf';

/**
 * Configuration implements the [IConfiguration](xref:botbuilder-dialogs-adaptive-runtime-core.IConfiguration)
 * interface and adds helper methods for setting values, layering sources, and getting type checked values.
 *
 * @internal
 */
export class Configuration implements CoreConfiguration {
    private prefix: string[] = [];
    private provider = new Provider().use('memory');

    /**
     * Create a configuration instance
     *
     * @param initialValues Optional set of default values to provide
     */
    constructor(initialValues?: Record<string, unknown>) {
        if (initialValues) {
            Object.entries(initialValues).forEach(([key, value]) => this.provider.set(key, value));
        }
    }

    /**
     * Bind a path to a Configuration instance such that calls to get or set will
     * automatically include the bound path as a prefix.
     *
     * @param path path to bind to new Configuration instance
     * @returns configuration instance with `path` bound as a prefix
     */
    bind(path: string[]): Configuration {
        const configuration = new Configuration();

        configuration.prefix = this.prefix.concat(path);
        configuration.provider = this.provider;

        return configuration;
    }

    private key(path: string[] | null): string {
        return this.prefix.concat(path ?? []).join(':');
    }

    /**
     * Get a value by path.
     *
     * @param path path to value
     * @returns the value, or undefined
     */
    get<T = unknown>(path: string[] = []): T | undefined {
        // Note: `|| undefined` ensures that empty string is coerced to undefined
        // which ensures nconf returns the entire merged configuration.
        return this.provider.get(this.key(path) || undefined);
    }

    /**
     * Set a value by path.
     *
     * @param path path to value
     * @param value value to set
     */
    set(path: string[], value: unknown): void {
        if (!path.length) {
            throw new Error('`path` must be non-empty');
        }

        this.provider.set(this.key(path), value);
    }

    /**
     * Load process.arguments as a configuration source.
     *
     * @param argv arguments to parse, defaults to `process.argv`
     * @returns this for chaining
     */
    argv(argv = process.argv.slice(2)): this {
        this.provider.argv({
            argv: yargs(argv, {
                configuration: {
                    'parse-numbers': false,
                },
            }),
        });
        return this;
    }

    /**
     * Load environment variables as a configuration source.
     *
     * @param separator value used to indicate nesting
     * @returns this for chaining
     */
    env(separator = '__'): this {
        this.provider.env(separator);
        return this;
    }

    /**
     * Load a file as a configuration source.
     *
     * @param name file name
     * @param override optional flag that ensures this file takes precedence over other files
     * @returns this for chaining
     */
    file(name: string, override = false): this {
        this.provider.file(name, name);

        // If we are given a key to override, we need to reach into the nconf provider and rearrange things.
        // The nconf provider maintains an object that maps names to stores. When looking up a key, nconf iterates
        // through the stores in insertion order and returns the first value it finds. This is not ideal because,
        // in order to rearrange stores, we have to essentially reconstruct the object so the insertion order is
        // correct. So this code does that.
        if (override) {
            // Construct list of entries in current insertion order
            const stores = this.provider.stores ?? {};
            const entries = Object.entries<Record<string, string>>(stores);

            // Locate store to override, if it exists
            const index = entries.findIndex(([, store]) => store.type === 'file');

            // If store exists, we need to remove the store we just added, splice it into entries, and then reduce
            // it back into an object.
            if (index !== -1) {
                // insert this store before the store to override
                entries.splice(index, 0, [name, stores[name]]);

                // slice this store from end of list, then reduce back into object
                this.provider.stores = entries
                    .slice(0, entries.length - 1)
                    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
            }
        }

        return this;
    }

    /**
     * Get a boolean value from config
     *
     * @param path path to boolean value
     * @returns true or false depending on flag
     */
    bool(path: string[]): boolean {
        return this.type(path, z.boolean()) === true;
    }

    /**
     * Get a string value from config
     *
     * @param path path to string value
     * @returns the string or undefined
     */
    string(path: string[]): string | undefined {
        return this.type(path, z.string());
    }

    /**
     * Get a typed value from config
     *
     * @param path path to value
     * @param t zod type to use for type checking
     * @returns the value, or undefined
     */
    type<T>(path: string[], t: z.ZodType<T>): T | undefined {
        try {
            return t.optional().parse(this.get(path));
        } catch (err) {
            if (z.instanceof(z.ZodError).check(err)) {
                err.errors.forEach((error) => (error.path = [...this.prefix, ...path, ...error.path]));
            }

            throw err;
        }
    }
}
