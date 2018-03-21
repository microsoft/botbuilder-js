/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, BotContext } from 'botbuilder';
export declare function sendPrompt(context: BotContext, prompt: string | Partial<Activity>, speak?: string): Promise<void>;
