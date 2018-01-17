"use strict";
/**
 * @module botbuilder-prompts
 */
/** second comment block */
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_core_1 = require("botbuilder-core");
/**
 * Base class for all prompts.
 *
 * @param T Type of result the prompt returns.
 * @param W Type of parameters that can be passed to [with()](#with).
 * @param O Type of options supported by the derived class.
 */
class Prompt {
    constructor(uid, validator, completed, prompter) {
        this.uid = uid;
        this._options = {};
        this._with = {};
        const that = this;
        this._prompter = prompter || Prompt.prompter;
        // Validate unique uri and register router function
        if (prompts.hasOwnProperty(uid)) {
            throw new Error(`Prompt<${uid}>: a prompt with that uri already exists.`);
        }
        prompts[uid] = function routeTo(context, state) {
            // Call validator and check result
            const result = validator(context, state.options);
            if (botbuilder_core_1.isPromised(result)) {
                return result.then((value) => checkValidatorResult(context, state, value));
            }
            else {
                return checkValidatorResult(context, state, result);
            }
        };
        function checkValidatorResult(context, state, result) {
            if (!result || (result.value === undefined && !result.error)) {
                throw new Error(`Prompt<${uid}>.routeTo(): validator returned an invalid result.`);
            }
            function waitFor(result) {
                if (botbuilder_core_1.isPromised(result)) {
                    return result.then(() => true);
                }
                else {
                    return true;
                }
            }
            // Copy result state
            Object.assign(state, { value: undefined, error: undefined }, result);
            // Branch on result
            if (state.value !== undefined) {
                that.cancel(context);
                return waitFor(completed(context, state));
            }
            else {
                return waitFor(that.sendPrompt(context, state));
            }
        }
    }
    /**
     * Returns the current set of options.
     */
    get options() {
        return this._options;
    }
    /**
     * Starts a new instance of the prompt.
     * @param context Context for the current turn of the conversation.
     */
    begin(context) {
        // Ensure conversation state exists
        if (!context.state.conversation) {
            throw new Error(`Prompt<${this.uid}>.begin(): Can't start prompt because "context.state.conversation" not found. Add a "BotStateManager" to your middleware stack. `);
        }
        // Initialize prompt state
        const state = {
            uri: this.uid,
            options: this._options,
            turns: 0,
            lastTurnTimestamp: new Date().toISOString(),
            with: this._with || {}
        };
        context.state.conversation.activePrompt = state;
        // Send initial prompt
        return this.sendPrompt(context, state);
    }
    /**
     * Cancels the prompt but only if there's an instance of this prompt active.
     * @param context Context for the current turn of the conversation.
     */
    cancel(context) {
        const conversation = context.state.conversation;
        if (conversation && conversation.activePrompt && conversation.activePrompt.uri === this.uid) {
            delete conversation.activePrompt;
        }
        return this;
    }
    /** Returns a clone of the prompt. */
    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
    /**
     * Clones the prompt and assigns the clone a new set of options.
     * @param options Options to set on the new cloned instance.
     */
    set(options) {
        const clone = this.clone();
        clone._options = Object.assign({}, this._options, options);
        return clone;
    }
    reply(textOrActivity, speak, additional) {
        return this.set({ prompt: composePrompt(textOrActivity, speak, additional) });
    }
    /**
     * Clones the prompt and assigns a set of additional parameters that should be returned
     * with the users input whenever a prompt ends. These parameters should be serializable
     * and small as they will be written to storage in between turns with the user.
     * @param params Map of parameters to return.
     */
    with(params) {
        const clone = this.clone();
        clone._with = params;
        return clone;
    }
    sendPrompt(context, state) {
        const result = this._prompter(context, state);
        if (botbuilder_core_1.isPromised(result)) {
            return result.then(() => {
                state.turns++;
                state.lastTurnTimestamp = new Date().toISOString();
            });
        }
        else {
            state.turns++;
            state.lastTurnTimestamp = new Date().toISOString();
        }
    }
    /**
     * Cancels any active prompts.
     * @param context Context for the current turn of the conversation.
     */
    static cancelActivePrompt(context) {
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
    static prompter(context, state) {
        const options = state.options;
        if (state.turns === 0) {
            if (options.prompt) {
                context.reply(options.prompt);
            }
        }
        else {
            const prompt = options.rePrompt || options.prompt;
            if (prompt) {
                context.reply(prompt);
            }
        }
    }
    /**
     * Routes the request to the active prompt (if there is one.)
     * @param context Context for the current turn of the conversation.
     */
    static routeTo(context) {
        const conversation = context.state.conversation;
        if (conversation && conversation.activePrompt) {
            const state = conversation.activePrompt;
            const uri = state.uri;
            const fn = prompts[uri];
            if (fn) {
                const result = fn(context, state);
                return Promise.resolve(result);
            }
            else {
                delete conversation.activePrompt;
                return Promise.reject(new Error(`Prompt<${uri}>.routeTo(): A prompt with that URI doesn't exist. Canceling prompt.`));
            }
        }
        else {
            return Promise.resolve(false);
        }
    }
    /**
     * Un-registers any registered prompts. Primarily useful for unit tests.
     */
    static unregisterAll() {
        prompts = {};
    }
}
exports.Prompt = Prompt;
let prompts = {};
function composePrompt(textOrActivity, speak, additional) {
    // Check other parameters
    if (!additional && typeof speak === 'object') {
        additional = speak;
        speak = undefined;
    }
    if (typeof textOrActivity === 'object') {
        if (!textOrActivity.type) {
            textOrActivity.type = botbuilder_core_1.ActivityTypes.message;
        }
        return textOrActivity;
    }
    else {
        // Compose MESSAGE activity
        const activity = Object.assign({
            type: botbuilder_core_1.ActivityTypes.message,
            text: textOrActivity || '',
        }, additional || {});
        if (typeof speak === 'string') {
            activity.speak = speak;
        }
        return activity;
    }
}
//# sourceMappingURL=prompt.js.map