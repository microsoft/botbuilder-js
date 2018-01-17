/**
 * @module botbuilder-prompts
 */
/** second comment block */
import { Activity, Promiseable } from 'botbuilder-core';
export interface PromptOptions {
    /**
     * Initial prompt to send the user.
     */
    prompt?: Partial<Activity>;
    /**
     * (Optional) prompt to send the user should their reply not be recognized.
     */
    rePrompt?: Partial<Activity>;
}
export interface PromptState<T = any, W extends Object = {}, O extends PromptOptions = PromptOptions> {
    /**
     * URI of the prompt that this state is for.
     */
    uri: string;
    /**
     * Options passed to the prompts begin() call.
     */
    options: O;
    /**
     * Number of turns with the user. This will start at 0 for the initial interaction with the
     * user and then increment with each interaction.
     */
    turns: number;
    /**
     * UTC timestamp of the last interaction with the user in ISO-8061 format.
     */
    lastTurnTimestamp: string;
    /**
     * Additional `with()` parameters passed to the prompt.
     */
    with: W;
    /**
     * The prompts final value.
     */
    value: T;
    /**
     * (Optional) reason the users response was invalid.
     */
    error?: string;
}
export interface ValidatorResult<T> {
    /**
     * (Optional) validated return value.
     */
    value?: T;
    /**
     * (Optional) reason the users response was invalid.
     */
    error?: string;
}
/**
 * Type signature for a prompt validation handler.
 */
export declare type Validator<T, O extends Object = {}> = (context: BotContext, options?: O) => Promiseable<ValidatorResult<T>>;
/**
 * Type signature for a prompts completion handler.
 */
export declare type CompletedHandler<T, W extends Object, O extends PromptOptions> = (context: BotContext, state: PromptState<T, W, O>) => Promiseable<any>;
/**
 * Type signature for a prompts generation handler.
 */
export declare type Prompter<T, W extends Object, O extends PromptOptions> = (context: BotContext, state: PromptState<T, W, O>) => Promiseable<any>;
/**
 * Base class for all prompts.
 *
 * @param T Type of result the prompt returns.
 * @param W Type of parameters that can be passed to [with()](#with).
 * @param O Type of options supported by the derived class.
 */
export declare class Prompt<T, W extends Object, O extends PromptOptions> implements BeginDialog {
    uid: string;
    private _options;
    private _with;
    private _prompter;
    constructor(uid: string, validator: Validator<T, O>, completed: CompletedHandler<T, W, O>, prompter?: Prompter<T, W, O>);
    /**
     * Returns the current set of options.
     */
    readonly options: O;
    /**
     * Starts a new instance of the prompt.
     * @param context Context for the current turn of the conversation.
     */
    begin(context: BotContext): Promiseable<any>;
    /**
     * Cancels the prompt but only if there's an instance of this prompt active.
     * @param context Context for the current turn of the conversation.
     */
    cancel(context: BotContext): this;
    /** Returns a clone of the prompt. */
    clone(): this;
    /**
     * Clones the prompt and assigns the clone a new set of options.
     * @param options Options to set on the new cloned instance.
     */
    set(options: O): this;
    /**
     * Clones the prompt and assigns a new prompt that should be sent to the user when the
     * prompt is started.
     * @param textOrActivity Text of a message or an activity object to send to the user.
     * @param speak (Optional) SSML that should be spoken to the user on channels that support speech.
     * @param additional (Optional) other activities fields, like attachments, that should be sent with the activity.
     */
    reply(textOrActivity: string, speak: string, additional?: Partial<Activity>): this;
    reply(textOrActivity: string, additional?: Partial<Activity>): this;
    reply(textOrActivity: Partial<Activity>): this;
    /**
     * Clones the prompt and assigns a set of additional parameters that should be returned
     * with the users input whenever a prompt ends. These parameters should be serializable
     * and small as they will be written to storage in between turns with the user.
     * @param params Map of parameters to return.
     */
    with(params: W): this;
    private sendPrompt(context, state);
    /**
     * Cancels any active prompts.
     * @param context Context for the current turn of the conversation.
     */
    static cancelActivePrompt(context: BotContext): void;
    /**
     * Implements default prompting logic that simply sends the user the initial `prompt` for
     * turn 0 and then either sends the configured `rePrompt` or the initial prompt again for
     * subsequent turns of the conversation.
     * @param context Context for the current turn of the conversation.
     * @param state The current prompts instance state.
     */
    static prompter(context: BotContext, state: PromptState): Promiseable<any>;
    /**
     * Routes the request to the active prompt (if there is one.)
     * @param context Context for the current turn of the conversation.
     */
    static routeTo(context: BotContext): Promise<boolean>;
    /**
     * Un-registers any registered prompts. Primarily useful for unit tests.
     */
    static unregisterAll(): void;
}
