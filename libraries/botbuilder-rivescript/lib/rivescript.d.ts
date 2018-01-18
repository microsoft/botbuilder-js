import { Middleware } from 'botbuilder';
import RiveScript = require('rivescript');
export interface RiveScriptOptions {
    utf8?: boolean;
    debug?: boolean;
    onDebug?: (message: string) => void;
    errors?: {
        [key: string]: string;
    };
}
/**
 * Bot Builder Rivescript Receiver
 */
export declare class RiveScriptReceiver implements Middleware {
    protected engine: Promise<RiveScript>;
    /**
     * creates a rivescript middleware host for the rivescript files/folders
     * @param pathOrPaths path or paths to files/folders for .rive files
     * @param options standard rivescript options
     */
    constructor(pathOrPaths: string[] | string, options?: RiveScriptOptions);
    /**
     * Handler for receive activity pipeline
     * @param context Bot context
     */
    receiveActivity(context: BotContext, next: () => Promise<void>): Promise<void>;
}
/**
 * Helper class to instantiate a RiveScript engine as a promise making it easy to be consumed by bot builder
 * @param pathOrPaths path to  rivescript file, or array of paths to files
 * @param options standard rivescript option object
 */
export declare function CreateRivescript(pathOrPaths: string[] | string, options?: RiveScriptOptions): Promise<RiveScript>;
