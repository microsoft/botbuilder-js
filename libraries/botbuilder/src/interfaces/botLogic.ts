// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TurnContext } from 'botbuilder-core';
import { Assertion, Func, assert } from 'botbuilder-stdlib';

export type BotLogic<T = void> = Func<[TurnContext], Promise<T>>;

export const assertBotLogic: Assertion<BotLogic> = (val, path) => {
    assert.func(val, path);
};

export const isBotLogic = assert.toTest(assertBotLogic);
