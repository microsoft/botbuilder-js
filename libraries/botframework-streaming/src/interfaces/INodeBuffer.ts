/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Represents a Buffer from the `buffer` module in Node.js.
 * 
 * This interface supports the framework and is not intended to be called directly for your code.
 */
export interface INodeBuffer {
    byteLength: number;
    length: number;

    copy(targetBuffer: Uint8Array, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;

    readBigUInt64BE?(offset?: number): bigint;
    readBigUInt64LE?(offset?: number): bigint;
    readBigInt64BE?(offset?: number): bigint;
    readBigInt64LE?(offset?: number): bigint;

    toString(encoding?: string, start?: number, end?: number): string;

    // write(string: string, encoding?: BufferEncoding): number;
    write(string: string, offset?: number, length?: number, encoding?: string): number;
    // write(string: string, offset: number, encoding?: BufferEncoding): number;
    // write(string: string, offset: number, length: number, encoding?: BufferEncoding): number;

    writeBigInt64BE?(value: bigint, offset?: number): number;
    writeBigInt64LE?(value: bigint, offset?: number): number;
    writeBigUInt64BE?(value: bigint, offset?: number): number;
    writeBigUInt64LE?(value: bigint, offset?: number): number;

    /**
     * Determines whether an array includes a certain element, returning true or false as appropriate.
     * @param searchElement The element to search for.
     * @param fromIndex The position in this array at which to begin searching for searchElement.
     */
    includes(searchElement: number, fromIndex?: number): boolean;
}

export type ValidBuffer = string | Uint8Array | INodeBuffer;

export type BufferEncoding = "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex";

