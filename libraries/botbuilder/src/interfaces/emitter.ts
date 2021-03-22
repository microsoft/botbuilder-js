// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Represents a Node.js emitter. Template arg should restrict the set of events supported
 * by a given emitter. Defaults to 'data' | 'end' | 'error'.
 */
export type Emitter<Events extends string = 'data' | 'end' | 'error'> = {
    emit(event: Events, data: unknown): void;
    on(event: Events, callback: (...args: unknown[]) => void): void;
};
