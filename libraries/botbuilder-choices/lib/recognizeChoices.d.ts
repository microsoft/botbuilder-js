/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Choice, FoundChoice, FindChoicesOptions } from './findChoices';
import { ModelResult } from './modelResult';
export declare function recognizeChoices(utterance: string, choices: (string | Choice)[], options?: FindChoicesOptions): ModelResult<FoundChoice>[];
