// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as t from 'runtypes';
import type { TurnContext } from 'botbuilder-core';

export type BotLogic<T = void> = (turnContext: TurnContext) => Promise<T>;

export const BotLogicT = t.Unknown.withGuard<BotLogic>(t.Function.guard, { name: 'BotLogic' });
