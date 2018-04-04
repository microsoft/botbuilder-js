/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, TurnContext } from 'botbuilder';
export declare function sendPrompt(context: TurnContext, prompt: string | Partial<Activity>, speak?: string): Promise<void>;
