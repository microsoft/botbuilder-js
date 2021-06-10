// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { TurnContext } from './turnContext';

export type BotLogic<T = void> = (turnContext: TurnContext) => Promise<T>;
