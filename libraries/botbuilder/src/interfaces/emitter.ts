// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { assert, Assertion } from 'botbuilder-stdlib';

/**
 * Represents a Node.js emitter. Template arg should restrict the set of events supported
 * by a given emitter. Defaults to 'data' | 'end' | 'error'.
 */
export type Emitter<Events extends string = 'data' | 'end' | 'error'> = {
    emit(event: Events, data: unknown): void;
    on(event: Events, callback: (...args: unknown[]) => void): void;
};

export const assertEmitter: Assertion<Emitter> = (val, path) => {
    assert.unsafe.castObjectAs<Emitter>(val, path);
    assert.func(val.emit, path.concat('emit'));
    assert.func(val.on, path.concat('on'));
};

export const isEmitter = assert.toTest(assertEmitter);
