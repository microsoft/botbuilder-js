/**
 * Configuration is an interface that is used to obtain configurable values
 */
export interface Configuration {
    /**
     * Look up a value by path.
     *
     * @param path path to get
     * @returns the value, or undefined
     */
    get(path: string[]): unknown | undefined;
    /**
     * Set a value by path.
     *
     * @param path path to get
     * @param value path to get
     */
    set(path: string[], value: unknown): void;
}
/**
 * Useful for shimming BotComponents into ComponentRegistrations
 */
export declare const noOpConfiguration: Configuration;
//# sourceMappingURL=configuration.d.ts.map
