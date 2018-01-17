/**
 * @module botbuilder-choices
 */
/** second comment block */
import { Choice, FoundChoice, FindChoicesOptions } from './findChoices';
import { ModelResult } from './modelResult';
export declare function recognizeChoices(utterance: string, choices: (string | Choice)[], options?: FindChoicesOptions): ModelResult<FoundChoice>[];
