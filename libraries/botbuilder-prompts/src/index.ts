/**
 * @module botbuilder-prompts
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export * from './attachmentPrompt';
export * from './choicePrompt';
export * from './confirmPrompt';
export * from './datetimePrompt';
export * from './numberPrompt';
export * from './oauthPrompt';
export * from './textPrompt';

// Re-exporting choice related interfaces used just to avoid TS developers from needing to 
// import interfaces from two libraries when working with prompts.
export { FoundChoice, Choice, ChoiceFactoryOptions, FindChoicesOptions } from 'botbuilder-choices';
