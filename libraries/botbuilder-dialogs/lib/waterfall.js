"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Dialog optimized for prompting a user with a series of questions. Waterfalls accept a stack of
 * functions which will be executed in sequence. Each waterfall step can ask a question of the user
 * by calling either a prompt or another dialog. When the called dialog completes control will be
 * returned to the next step of the waterfall and any input collected by the prompt or other dialog
 * will be passed to the step as an argument.
 *
 * When a step is executed it should call either `context.begin()`, `context.end()`,
 * `context.replace()`, `context.cancelDialog()`, or a prompt. Failing to do so will result
 * in the dialog automatically ending the next time the user replies.
 *
 * Similarly, calling a dialog/prompt from within the last step of the waterfall will result in
 * the waterfall automatically ending once the dialog/prompt completes. This is often desired
 * though as the result from tha called dialog/prompt will be passed to the waterfalls parent
 * dialog.
 */
class Waterfall {
    /**
     * Creates a new waterfall dialog containing the given array of steps.
     * @param steps Array of waterfall steps.
     */
    constructor(steps) {
        this.steps = (steps || []).slice(0);
    }
    begin(context, dialogs, args) {
        const instance = dialogs.getInstance(context);
        instance.step = 0;
        return this.runStep(context, dialogs, args);
    }
    resume(context, dialogs, result) {
        const instance = dialogs.getInstance(context);
        instance.step += 1;
        return this.runStep(context, dialogs, result);
    }
    runStep(context, dialogs, result) {
        try {
            const instance = dialogs.getInstance(context);
            const step = instance.step;
            if (step >= 0 && step < this.steps.length) {
                // Execute step
                return Promise.resolve(this.steps[step](context, result, (r) => {
                    // Skip to next step
                    instance.step += 1;
                    return this.runStep(context, r);
                }));
            }
            else {
                // End of waterfall so just return to parent
                return dialogs.end(context);
            }
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
}
exports.Waterfall = Waterfall;
//# sourceMappingURL=waterfall.js.map