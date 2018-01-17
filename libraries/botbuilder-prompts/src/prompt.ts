/**
 * @module botbuilder-prompts
 */
/** second comment block */

import { Activity, ActivityTypes, Promiseable, isPromised } from 'botbuilder-core';

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
export type Validator<T, O extends Object = {}> = (context: BotContext, options?: O) => Promiseable<ValidatorResult<T>>;

/**
 * Type signature for a prompts completion handler.
 */
export type CompletedHandler<T, W extends Object, O extends PromptOptions> = (context: BotContext, state: PromptState<T,W,O>) => Promiseable<any>;

/**
 * Type signature for a prompts generation handler.
 */
export type Prompter<T, W extends Object, O extends PromptOptions> = (context: BotContext, state: PromptState<T,W,O>) => Promiseable<any>;

/**
 * Base class for all prompts.
 *
 * @param T Type of result the prompt returns. 
 * @param W Type of parameters that can be passed to [with()](#with). 
 * @param O Type of options supported by the derived class. 
 */
export class Prompt<T, W extends Object, O extends PromptOptions> implements BeginDialog
{
    private _options: O = {} as O;
    private _with: W = {} as W;
    private _prompter: Prompter<T,W,O>;

    constructor(public uid: string, validator: Validator<T,O>, completed: CompletedHandler<T,W,O>, prompter?: Prompter<T,W,O>) 
    {
        const that = this;
        this._prompter = prompter || Prompt.prompter;

        // Validate unique uri and register router function
        if (prompts.hasOwnProperty(uid)) { throw new Error(`Prompt<${uid}>: a prompt with that uri already exists.`); }
        prompts[uid] = <any>function routeTo(context: BotContext, state: PromptState<T,W,O>)  {
            // Call validator and check result
            const result = validator(context, state.options);
            if (isPromised(result)) {
                return result.then((value) => checkValidatorResult(context, state, value));
            } else {
                return checkValidatorResult(context, state, result);
            }
        }

        function checkValidatorResult(context: BotContext, state: PromptState<T,W,O>, result: ValidatorResult<T>): Promiseable<boolean> {
            if (!result || (result.value === undefined && !result.error)) { throw new Error(`Prompt<${uid}>.routeTo(): validator returned an invalid result.`) }

            function waitFor(result: Promiseable<any>): Promiseable<boolean> {
                if (isPromised(result)) {
                    return result.then(() => true);
                } else {
                    return true;
                }
            }

            // Copy result state
            Object.assign(state, { value: undefined, error: undefined } as ValidatorResult<T>, result);            

            // Branch on result
            if (state.value !== undefined) {
                that.cancel(context);
                return waitFor(completed(context, state)); 
            } else {
                return waitFor(that.sendPrompt(context, state));
            }

        }
    }

    /**
     * Returns the current set of options.
     */
    get options(): O {
        return this._options;
    }

    /**
     * Starts a new instance of the prompt.
     * @param context Context for the current turn of the conversation.
     */
    public begin(context: BotContext): Promiseable<any> {
        // Ensure conversation state exists
        if (!context.state.conversation) { throw new Error(`Prompt<${this.uid}>.begin(): Can't start prompt because "context.state.conversation" not found. Add a "BotStateManager" to your middleware stack. `) }
            
        // Initialize prompt state
        const state = {
            uri: this.uid,
            options: this._options,
            turns: 0,
            lastTurnTimestamp: new Date().toISOString(),
            with: this._with || {}
        } as PromptState<T,W,O>;
        context.state.conversation.activePrompt = state;

        // Send initial prompt
        return this.sendPrompt(context, state);
    }

    /**
     * Cancels the prompt but only if there's an instance of this prompt active.
     * @param context Context for the current turn of the conversation.
     */
    public cancel(context: BotContext): this {
        const conversation = context.state.conversation;
        if (conversation && conversation.activePrompt && conversation.activePrompt.uri === this.uid) {
            delete conversation.activePrompt;
        }
        return this;
    }

    /** Returns a clone of the prompt. */
    public clone(): this {
        return Object.assign( Object.create( Object.getPrototypeOf(this)), this);        
    }

    /**
     * Clones the prompt and assigns the clone a new set of options.
     * @param options Options to set on the new cloned instance.
     */
    public set(options: O): this {
        const clone = this.clone();
        clone._options = Object.assign({}, this._options, options);
        return clone;
    }

    /**
     * Clones the prompt and assigns a new prompt that should be sent to the user when the 
     * prompt is started.
     * @param textOrActivity Text of a message or an activity object to send to the user.
     * @param speak (Optional) SSML that should be spoken to the user on channels that support speech.
     * @param additional (Optional) other activities fields, like attachments, that should be sent with the activity.
     */
    public reply(textOrActivity: string, speak: string, additional?: Partial<Activity>): this;
    public reply(textOrActivity: string, additional?: Partial<Activity>): this;
    public reply(textOrActivity: Partial<Activity>): this;
    public reply(textOrActivity: string|Partial<Activity>, speak?: string|Partial<Activity>, additional?: Partial<Activity>): this {
        return this.set({ prompt: composePrompt(textOrActivity, speak, additional) } as O);
    }

    /**
     * Clones the prompt and assigns a set of additional parameters that should be returned
     * with the users input whenever a prompt ends. These parameters should be serializable
     * and small as they will be written to storage in between turns with the user.
     * @param params Map of parameters to return.
     */
    public with(params: W): this {
        const clone = this.clone();
        clone._with = params;
        return clone;
    }

    private sendPrompt(context: BotContext, state: PromptState<T,W,O>): Promiseable<any> {
        const result = this._prompter(context, state);
        if (isPromised(result)) {
            return result.then(() => {
                state.turns++;
                state.lastTurnTimestamp = new Date().toISOString();
            })
        } else {
            state.turns++;
            state.lastTurnTimestamp = new Date().toISOString();
        }
    }

    /**
     * Cancels any active prompts.
     * @param context Context for the current turn of the conversation.
     */
    static cancelActivePrompt(context: BotContext): void {
        const conversation = context.state.conversation;
        if (conversation && conversation.activePrompt) {
            delete conversation.activePrompt;
        }
    }

    /**
     * Implements default prompting logic that simply sends the user the initial `prompt` for 
     * turn 0 and then either sends the configured `rePrompt` or the initial prompt again for
     * subsequent turns of the conversation. 
     * @param context Context for the current turn of the conversation.
     * @param state The current prompts instance state.
     */
    static prompter(context: BotContext, state: PromptState): Promiseable<any> {
        const options = state.options;
        if (state.turns === 0) {
            if (options.prompt) { context.reply(options.prompt) } 
        } else {
            const prompt = options.rePrompt || options.prompt;
            if (prompt) { context.reply(prompt) }          
        }
    }

    /**
     * Routes the request to the active prompt (if there is one.)
     * @param context Context for the current turn of the conversation.
     */
    static routeTo(context: BotContext): Promise<boolean> {
        const conversation = context.state.conversation;
        if (conversation && conversation.activePrompt) {
            const state = conversation.activePrompt;
            const uri = state.uri;
            const fn = prompts[uri];
            if (fn) {
                const result = fn(context, state);
                return Promise.resolve(result);
            } else {
                delete conversation.activePrompt;
                return Promise.reject(new Error(`Prompt<${uri}>.routeTo(): A prompt with that URI doesn't exist. Canceling prompt.`))
            }
        } else {
            return Promise.resolve(false);
        }
    }

    /**
     * Un-registers any registered prompts. Primarily useful for unit tests.
     */
    static unregisterAll(): void {
        prompts = {};
    }
}

let prompts: { [uid:string]: (context: BotContext, state: PromptState) => Promiseable<boolean>; } = {};


function composePrompt(textOrActivity: string|Partial<Activity>, speak?: string|Partial<Activity>, additional?: Partial<Activity>): Partial<Activity> {
    // Check other parameters
    if (!additional && typeof speak === 'object') {
        additional = <Partial<Activity>>speak;
        speak = undefined;
    }

    if (typeof textOrActivity === 'object') {
        if (!textOrActivity.type) { textOrActivity.type = ActivityTypes.message }
        return textOrActivity;
    } else {
        // Compose MESSAGE activity
        const activity: Partial<Activity> = Object.assign(<Partial<Activity>>{
            type: ActivityTypes.message,
            text: textOrActivity || '',
        }, additional || {});
        if (typeof speak === 'string') {
            activity.speak = speak;
        }
        return activity;
    }
}