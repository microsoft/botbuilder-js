import { DialogSet } from "botbuilder-dialogs";
import { ConversationState } from "botbuilder-core";
export declare class EmulatorAwareBot {
    conversationState: ConversationState;
    dialogs: DialogSet;
    dialogState: any;
    /**
     * SampleBot defines the core business logic of this bot.
     * @param {ConversationState} conversationState A ConversationState object used to store dialog state.
     */
    constructor(conversationState: ConversationState);
    startDialog(step: any): Promise<any>;
    processResults(step: any): Promise<any>;
    shoeSizeValidator(prompt: any): Promise<boolean>;
    /**
     *
     * @param {TurnContext} turnContext A TurnContext object representing an incoming message to be handled by the bot.
     */
    onTurn(turnContext: any): Promise<void>;
}
