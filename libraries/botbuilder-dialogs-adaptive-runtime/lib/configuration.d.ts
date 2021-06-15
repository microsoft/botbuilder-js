import { Runtype } from 'runtypes';
import { Configuration as CoreConfiguration } from 'botbuilder-dialogs-adaptive-runtime-core';
/**
 * Configuration implements the [IConfiguration](xref:botbuilder-dialogs-adaptive-runtime-core.IConfiguration)
 * interface and adds helper methods for setting values, layering sources, and getting type checked values.
 */
export declare class Configuration implements CoreConfiguration {
    private prefix;
    private provider;
    /**
     * Bind a path to a Configuration instance such that calls to get or set will
     * automatically include the bound path as a prefix.
     *
     * @param path path to bind to new Configuration instance
     * @returns configuration instance with `path` bound as a prefix
     */
    bind(path: string[]): Configuration;
    private key;
    /**
     * Get a value by path.
     *
     * @param path path to value
     * @returns the value, or undefined
     */
    get(path: string[]): unknown | undefined;
    /**
     * Set a value by path.
     *
     * @param path path to value
     * @param value value to set
     */
    set(path: string[], value: unknown): void;
    /**
     * Load process.arguments as a configuration source.
     *
     * @param argv arguments to parse, defaults to `process.argv`
     * @returns this for chaining
     */
    argv(argv?: string[]): this;
    /**
     * Load environment variables as a configuration source.
     *
     * @param separator value used to indicate nesting
     * @returns this for chaining
     */
    env(separator?: string): this;
    /**
     * Load a file as a configuration source.
     *
     * @param name file name
     * @param override optional flag that ensures this file takes precedence over other files
     * @returns this for chaining
     */
    file(name: string, override?: boolean): this;
    /**
     * Get a boolean value from config
     *
     * @param path path to boolean value
     * @returns true or false depending on flag
     */
    bool(path: string[]): boolean;
    /**
     * Get a string value from config
     *
     * @param path path to string value
     * @returns the string or undefined
     */
    string(path: string[]): string | undefined;
    /**
     * Get a typed value from config
     *
     * @param path path to value
     * @param runtype runtype to use for type checking
     * @returns the value, or undefined
     */
    type<T>(path: string[], runtype: Runtype<T>): T | undefined;
}
//# sourceMappingURL=configuration.d.ts.map