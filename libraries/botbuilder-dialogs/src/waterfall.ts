/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Promiseable, BotContext } from 'botbuilder';
import { Dialog, DialogInstance } from './dialog';
import { DialogContext } from './dialogContext';

/**
 * Function signature of a waterfall step.
 * 
 * **Example usage:**
 * 
 * ```JavaScript
 * dialogs.add('addAlarm', [
 *      function (context, alarm, next) {
 *          dialogs.getInstance(context).state = Object.assign({}, alarm);
 *          if (!alarm.title) {
 *              return dialogs.prompt(context, 'titlePrompt', `What would you like to call your alarm?`);
 *          } else {
 *              return next(alarm.title);
 *          }
 *      },
 *      function (context, title, next) {
 *          const alarm = dialogs.getInstance(context).state;
 *          alarm.title = title;
 *          if (!alarm.time) {
 *              return dialogs.prompt(context, 'timePrompt', `What time would you like to set it for?`);
 *          } else {
 *              return next(alarm.time);
 *          }
 *      },
 *      function (context, time) {
 *          const alarm = dialogs.getInstance(context).state;
 *          alarm.time = time;
 *          
 *          // ... set alarm ...
 * 
 *          context.reply(`Alarm set.`);
 *          return dialogs.end(context);
 *      }
 * ]);
 * ```
 * @param WaterfallStep.context The dialog context for the current turn of conversation.
 * @param WaterfallStep.args Argument(s) passed into the dialog for the first step and then the results from calling a prompt or other dialog for subsequent steps.
 * @param WaterfallStep.next Function passed into the step to let you manually skip to the next step in the waterfall.  
 */
export type WaterfallStep<C extends BotContext> = (dc: DialogContext<C>, args?: any, next?: SkipStepFunction) => Promiseable<any>;

/**
 * When called, control will skip to the next waterfall step.
 * @param SkipStepFunction.args (Optional) additional argument(s) to pass into the next step.
 */
export type SkipStepFunction = (args?: any) => Promise<any>;

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
export class Waterfall<C extends BotContext> implements Dialog<C> {
    private readonly steps: WaterfallStep<C>[];

    /**
     * Creates a new waterfall dialog containing the given array of steps. 
     * @param steps Array of waterfall steps. 
     */
    constructor(steps: WaterfallStep<C>[]) {
        this.steps = (steps || []).slice(0);
    }

    public begin(dc: DialogContext<C>, args?: any): Promiseable<any> {
        const instance = dc.instance as WaterfallInstance<any>;
        instance.step = 0;
        return this.runStep(dc, args);
    }

    public resume(dc: DialogContext<C>, result?: any): Promiseable<any> {
        const instance = dc.instance as WaterfallInstance<any>;
        instance.step += 1
        return this.runStep(dc, result);
    }

    private runStep(dc: DialogContext<C>, result?: any): Promise<any> {
        try {
            const instance = dc.instance as WaterfallInstance<any>;
            const step = instance.step;
            if (step >= 0 && step < this.steps.length) {
                // Execute step
                return Promise.resolve(this.steps[step](dc, result, (r?: any) => {
                    // Skip to next step
                    instance.step += 1;
                    return this.runStep(dc, r);
                }));
            } else {
                // End of waterfall so just return to parent
                return dc.end();
            }
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

interface WaterfallInstance<T extends Object> extends DialogInstance<T> {
    step: number;
}
