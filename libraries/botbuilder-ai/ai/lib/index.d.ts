/**
 * @module botbuilder-ai
 */
/** second comment block */
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
