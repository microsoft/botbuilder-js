/**
 * @module botbuilder-dialogs
 */
/** Licensed under the MIT License. */
export * from './prompts/index';
export * from './dialog';
export * from './dialogSet';
export * from './waterfall';

// Re-exporting choice related interfaces used just to avoid TS developers from needing to 
// import interfaces from two libraries when working with dialogs.
export { FoundChoice, Choice, ChoiceStylerOptions } from 'botbuilder-choices';