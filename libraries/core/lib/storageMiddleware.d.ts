/**
 * @module botbuilder
 */
/** second comment block */
import { BotService } from './botService';
import { Storage, StorageSettings } from './storage';
/**
 * Abstract base class for all storage middleware.
 *
 * @param SETTINGS (Optional) settings to configure additional features of the storage provider.
 */
export declare abstract class StorageMiddleware<SETTINGS extends StorageSettings = StorageSettings> extends BotService<Storage> {
    private warningLogged;
    /** Settings that configure the various features of the storage provider. */
    settings: SETTINGS;
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings (Optional) settings to configure additional features of the storage provider.
     */
    constructor(settings?: Partial<SETTINGS>);
    protected getService(context: BotContext): Storage;
    /**
     * Overriden by derived classes to dynamically provide a storage provider instance for a given
     * request.
     *
     * @param context Context for the current turn of the conversation.
     */
    protected abstract getStorage(context: BotContext): Storage;
}
