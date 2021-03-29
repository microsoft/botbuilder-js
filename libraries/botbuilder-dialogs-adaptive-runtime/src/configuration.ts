// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import yargs from 'yargs-parser';
import { Boolean, Runtype, String, Undefined, ValidationError } from 'runtypes';
import { Configuration as CoreConfiguration } from 'botbuilder-dialogs-adaptive-runtime-core';
import { Provider } from 'nconf';

/**
 * Configuration implements the [IConfiguration](xref:botbuilder-dialogs-adaptive-runtime-core.IConfiguration)
 * interface and adds helper methods for setting values, layering sources, and getting type checked values.
 */
export class Configuration implements CoreConfiguration {
    private prefix: string[] = [];
    private provider = new Provider().use('memory');

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

    private key(path: string[]): string {
        return this.prefix.concat(path).join(':');
    }

    /**
     * Get a value by path.
     *
     * @param path path to value
     * @returns the value, or undefined
     */
    get(path: string[]): unknown | undefined {
        // Note: empty path should yield the entire configuration
        if (!path.length) {
            return this.provider.get();
        }

        return this.provider.get(this.key(path));
    }

    /**
     * Set a value by path.
     *
     * @param path path to value
     * @param value value to set
     */
    set(path: string[], value: unknown): void {
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
     * @returns this for chaining
     */
    file(name: string): this {
        this.provider.file(name, name);
        return this;
    }

    /**
     * Get a boolean value from config
     *
     * @param path path to boolean value
     * @returns true or false depending on flag
     */
    bool(path: string[]): boolean {
        return this.type(path, Boolean) === true;
    }

    /**
     * Get a string value from config
     *
     * @param path path to string value
     * @returns the string or undefined
     */
    string(path: string[]): string | undefined {
        return this.type(path, String);
    }

    /**
     * Get a typed value from config
     *
     * @param path path to value
     * @param runtype runtype to use for type checking
     * @returns the value, or undefined
     */
    type<T>(path: string[], runtype: Runtype<T>): T | undefined {
        const value = this.get(path);

        try {
            return runtype.Or(Undefined).check(value);
        } catch (err) {
            if (err instanceof ValidationError) {
                err.key = JSON.stringify(this.prefix.concat(path));
            }

            throw err;
        }
    }
}
