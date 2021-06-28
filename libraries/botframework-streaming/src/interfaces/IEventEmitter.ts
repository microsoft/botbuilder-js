/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Represents a EventEmitter from the `net` module in Node.js.
 *
 * This interface supports the framework and is not intended to be called directly for your code.
 */
export interface IEventEmitter {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    emit(event: string | symbol, ...args: any[]): boolean;
    off(event: string | symbol, listener: (...args: any[]) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    removeAllListeners(event?: string | symbol): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    /* eslint-disable  @typescript-eslint/ban-types */
    listeners(event: string | symbol): Function[];
    rawListeners(event: string | symbol): Function[];
    /* eslint-enable  @typescript-eslint/ban-types */
    listenerCount(type: string | symbol): number;
    eventNames(): Array<string | symbol>;
}
