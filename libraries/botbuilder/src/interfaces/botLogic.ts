// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TurnContext } from 'botbuilder-core';

export type BotLogic<T = void> = (turnContext: TurnContext) => Promise<T>;
