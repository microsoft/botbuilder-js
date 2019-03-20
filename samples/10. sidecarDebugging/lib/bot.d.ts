export declare class EmulatorAwareBot {
    private memoryStorage;
    /**
     *
     * @param {MemoryStorage} memoryStorage
     */
    constructor(memoryStorage: any);
    /**
     * Processes the current turn containing the activity from the user
     *
     * @param {TurnContext} context The context of the current conversation turn.
     */
    processTurnContext(context: any): Promise<void>;
}
