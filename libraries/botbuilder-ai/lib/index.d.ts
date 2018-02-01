/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export * from './luisRecognizer';
export * from './languageTranslator';
export * from './languageMap';
export * from './qnaMaker';
export * from './bingEntitySearch';
declare global  {
    interface EntityTypes {
        luis: string;
    }
}
