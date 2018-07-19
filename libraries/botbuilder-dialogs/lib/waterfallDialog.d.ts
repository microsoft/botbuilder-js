import { DialogContext } from './dialogContext';
import { Dialog, DialogTurnResult } from './dialog';
/**
 * Function signature of a waterfall step.
 *
 * @remarks
 * This example shows a simple waterfall that prompts a user to enter the fields needed to set an alarm:
 *
 * ```TypeScript
 * type WaterfallStep = (dc: DialogContext, args?: any, next?: SkipStepFunction) => Promise<DialogTurnResult>;
 * ```
 *
 * ```JavaScript
 * const { Waterfall } = require('botbuilder-dialogs');
 *
 * dialogs.add('addAlarm', new Waterfall([
 *      async function (dc, alarm, next) {
 *          dc.activeDialog.state.alarm = alarm || {};
 *          if (!alarm.title) {
 *              return await dc.prompt('titlePrompt', `What would you like to call your alarm?`);
 *          } else {
 *              return await next(alarm.title);
 *          }
 *      },
 *      async function (dc, title, next) {
 *          const alarm = dc.activeDialog.state.alarm;
 *          alarm.title = title;
 *          if (!alarm.time) {
 *              return await dc.prompt('timePrompt', `What time would you like to set it for?`);
 *          } else {
 *              return await next(alarm.time);
 *          }
 *      },
 *      async function (dc, time) {
 *          const alarm = dc.activeDialog.state.alarm;
 *          alarm.time = time;
 *
 *          // ... set alarm ...
 *
 *          await dc.context.sendActivity(`Alarm set.`);
 *          return await dc.end();
 *      }
 * ]));
 * ```
 * @param WaterfallStep.context The dialog context for the current turn of conversation.
 * @param WaterfallStep.args Argument(s) passed into the dialog for the first step and then the results from calling a prompt or other dialog for subsequent steps.
 * @param WaterfallStep.next Function passed into the step to let you manually skip to the next step in the waterfall.
 */
export declare type WaterfallStep = (dc: DialogContext, args?: any, next?: SkipStepFunction) => Promise<DialogTurnResult>;
/**
 * When called within a waterfall step the dialog will skip to the next waterfall step.
 *
 * ```TypeScript
 * type SkipStepFunction = (args?: any) => Promise<DialogTurnResult>;
 * ```
 * @param SkipStepFunction.args (Optional) additional argument(s) to pass into the next step.
 */
export declare type SkipStepFunction = (args?: any) => Promise<DialogTurnResult>;
/**
 * Dialog optimized for prompting a user with a series of questions.
 *
 * @remarks
 * Waterfalls accept a stack of functions which will be executed in sequence. Each waterfall step
 * can ask a question of the user and the users response will be passed as an argument to the next
 * waterfall step.
 *
 * For simple text questions you can send the user a message and then process their answer in the
 * next step:
 *
 * ```JavaScript
 * const { Waterfall, Dialog } = require('botbuilder-dialogs');
 *
 * dialogs.add('namePrompt', new Waterfall([
 *      async function (dc) {
 *          dc.activeDialog.state.profile = { first: '', last: '', full: '' };
 *          await dc.context.sendActivity(`What's your first name?`);
 *          return Dialog.EndOfTurn;
 *      },
 *      async function (dc, firstName) {
 *          dc.activeDialog.state.profile.first = firstName;
 *          await dc.context.sendActivity(`Great ${firstName}! What's your last name?`);
 *          return Dialog.EndOfTurn;
 *      },
 *      async function (dc, lastName) {
 *          const profile = dc.activeDialog.state.profile;
 *          profile.last = lastName;
 *          profile.full = profile.first + ' ' + profile.last;
 *          return await dc.end(profile);
 *      }
 * ]));
 * ```
 *
 * For more complex sequences you can call other dialogs from within a step and the result returned
 * by the dialog will be passed to the next step:
 *
 * ```JavaScript
 * const { Waterfall, Dialog } = require('botbuilder-dialogs');
 *
 * dialogs.add('survey', [
 *      async function (dc) {
 *          dc.activeDialog.state.survey = { name: undefined, languages: '', years: 0 };
 *          return await dc.begin('namePrompt');
 *      },
 *      async function (dc, name) {
 *          dc.activeDialog.state.survey.name = name;
 *          return await dc.context.sendActivity(`Ok ${name.full}... What programming languages do you know?`);
 *      },
 *      async function (dc, languages) {
 *          dc.activeDialog.state.survey.languages = languages;
 *          return await dc.prompt('yearsPrompt', `Great. So how many years have you been programming?`);
 *      },
 *      async function (dc, years) {
 *          dc.activeDialog.state.survey.years = years;
 *          await dc.context.sendActivity(`Thank you for taking our survey.`);
 *          return await dc.end(dc.activeDialog.survey);
 *      }
 * ]);
 *
 * dialogs.add('yearsPrompt', new NumberPrompt(async (dc, value) => {
 *      if (value === undefined || value < 0 || value > 110) {
 *          await dc.context.sendActivity(`Enter a number from 0 to 110.`);
 *      } else {
 *          return value;
 *      }
 * }));
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
export declare class WaterfallDialog extends Dialog {
    private readonly steps;
    /**
     * Creates a new waterfall dialog containing the given array of steps.
     * @param steps Array of waterfall steps.
     */
    constructor(dialogId: string, steps: WaterfallStep[]);
    dialogBegin(dc: DialogContext, args?: any): Promise<DialogTurnResult>;
    dialogContinue(dc: DialogContext): Promise<DialogTurnResult>;
    dialogResume(dc: DialogContext, result?: any): Promise<DialogTurnResult>;
    private runStep(dc, result?);
}
