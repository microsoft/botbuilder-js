/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Promiseable, TurnContext } from 'botbuilder';
import { Dialog } from './dialog';
import { DialogContext } from './dialogContext';
/**
 * :package: **botbuilder-dialogs**
 *
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
export declare type WaterfallStep<C extends TurnContext> = (dc: DialogContext<C>, args?: any, next?: SkipStepFunction) => Promiseable<any>;
/**
 * :package: **botbuilder-dialogs**
 *
 * When called, control will skip to the next waterfall step.
 * @param SkipStepFunction.args (Optional) additional argument(s) to pass into the next step.
 */
export declare type SkipStepFunction = (args?: any) => Promise<any>;
/**
 * :package: **botbuilder-dialogs**
 *
 * Dialog optimized for prompting a user with a series of questions. Waterfalls accept a stack of
 * functions which will be executed in sequence. Each waterfall step can ask a question of the user
 * and the users response will be passed as an argument to the next waterfall step.
 *
 * For simple text questions you can send the user a message and then process their answer in the
 * next step:
 *
 * ```JavaScript
 *  dialogs.add('namePrompt', [
 *      async function (dc) {
 *          dc.instance.state = { first: '', last: '', full: '' };
 *          await dc.context.sendActivity(`What's your first name?`);
 *      },
 *      async function (dc, firstName) {
 *          dc.instance.state.first = firstName;
 *          await dc.context.sendActivity(`Great ${firstName}! What's your last name?`);
 *      },
 *      async function (dc, lastName) {
 *          const name = dc.instance.state;
 *          name.last = lastName;
 *          name.full = name.first + ' ' + name.last;
 *          await dc.end(name);
 *      }
 *  ]);
 * ```
 *
 * For more complex sequences you can call other dialogs from within a step and the result returned
 * by the dialog will be passed to the next step:
 *
 * ```JavaScript
 *  dialogs.add('survey', [
 *      async function (dc) {
 *          dc.instance.state = { name: undefined, languages: '', years: 0 };
 *          await dc.begin('namePrompt');
 *      },
 *      async function (dc, name) {
 *          dc.instance.state.name = name;
 *          await dc.context.sendActivity(`Ok ${name.full}... What programming languages do you know?`);
 *      },
 *      async function (dc, languages) {
 *          dc.instance.state.languages = languages;
 *          await dc.prompt('yearsPrompt', `Great. So how many years have you been programming?`);
 *      },
 *      async function (dc, years) {
 *          dc.instance.state.years = years;
 *          await dc.context.sendActivity(`Thank you for taking our survey.`);
 *          await dc.end(dc.instance.state);
 *      }
 *  ]);
 *
 *  dialogs.add('yearsPrompt', new NumberPrompt(async (dc, value) => {
 *      if (value === undefined || value < 0 || value > 110) {
 *          await dc.context.sendActivity(`Enter a number from 0 to 110.`);
 *      } else {
 *          return value;
 *      }
 *  }));
 * ```
 *
 * The example builds on the previous `namePrompt` sample and shows how you can call another dialog
 * which will ask its own sequence of questions. The dialogs library provides a built-in set of
 * prompt classes which can be used to recognize things like dates and numbers in the users response.
 *
 * You should generally call `dc.end()` or `dc.replace()` from your last waterfall step but if you fail
 * to do that the dialog will be automatically ended for you on the users next reply.  The users
 * response will be passed to the calling dialogs next waterfall step if there is one.
 */
export declare class Waterfall<C extends TurnContext> extends Dialog<C> {
    private readonly steps;
    /**
     * Creates a new waterfall dialog containing the given array of steps.
     * @param steps Array of waterfall steps.
     */
    constructor(steps: WaterfallStep<C>[]);
    dialogBegin(dc: DialogContext<C>, args?: any): Promiseable<any>;
    dialogContinue(dc: DialogContext<C>): Promise<any>;
    dialogResume(dc: DialogContext<C>, result?: any): Promiseable<any>;
    private runStep(dc, result?);
}
