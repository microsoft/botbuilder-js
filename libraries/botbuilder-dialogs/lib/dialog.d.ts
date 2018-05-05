/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Promiseable } from 'botbuilder';
import { DialogContext } from './dialogContext';
/**
 * Tracking information for a dialog on the stack.
 * @param T (Optional) type of state being persisted for dialog.
 */
export interface DialogInstance<T = any> {
    /** ID of the dialog this instance is for. */
    id: string;
    /** The instances persisted state. */
    state: T;
}
/**
 * Returned by `Dialog.begin()` and `Dialog.continue()` to indicate whether the dialog is still
 * active after the turn has been processed by the dialog.  This can also be used to access the
 * result of a dialog that just completed.
 * @param T (Optional) type of result returned by the dialog when it calls `dc.end()`.
 */
export interface DialogCompletion<T = any> {
    /** If `true` the dialog is still active. */
    isActive: boolean;
    /** If `true` the dialog just completed and the final [result](#result) can be retrieved. */
    isCompleted: boolean;
    /** Final result returned by a dialog that just completed. */
    result?: T;
}
/**
 * Base class for all dialogs.
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 * @param R (Optional) type of result that's expected to be returned by the dialog.
 * @param O (Optional) options that can be passed into the [begin()](#begin) method.
 */
export declare abstract class Dialog<C extends TurnContext, R = any, O = {}> {
    /**
     * Starts the dialog when its called in isolation from a bot that isn't dialog based.
     *
     * @remarks
     * The bot is responsible for maintaining the sticky-ness of the dialog. To do that it should
     * persist the state object it passed into the dialog as part of its overall state when the
     * turn completes. When the user replies it then needs to pass the persisted state object into
     * a call to the dialogs [continue()](#continue) method.
     *
     * Depending on the dialog, its possible for the dialog to finish immediately so it's advised
     * to check the completion object returned by `begin()` and ensure that the dialog is still
     * active before continuing.
     *
     * ```JavaScript
     * const state = {};
     * const completion = await dialog.begin(context, state);
     * if (completion.isCompleted) {
     *     const value = completion.result;
     * }
     * ```
     * @param context Context for the current turn of the conversation with the user.
     * @param state A state object that the dialog will use to persist its current state. This should be an empty object which the dialog will populate. The bot should persist this with its other conversation state for as long as the dialog is still active.
     * @param options (Optional) additional options supported by the dialog.
     */
    begin(context: C, state: object, options?: O): Promise<DialogCompletion<R>>;
    /**
     * Passes a users reply to a dialog thats being used in isolation.
     *
     * @remarks
     * The bot should keep calling `continue()` for future turns until the dialog returns a
     * completion object with `isCompleted == true`. To cancel or interrupt the prompt simply
     * delete the `state` object being persisted.
     *
     * ```JavaScript
     * const completion = await dialog.continue(context, state);
     * if (completion.isCompleted) {
     *     const value = completion.result;
     * }
     * ```
     * @param context Context for the current turn of the conversation with the user.
     * @param state A state object that was previously initialized by a call to [begin()](#begin).
     */
    continue(context: C, state: object): Promise<DialogCompletion<R>>;
    /**
     * Method called when a new dialog has been pushed onto the stack and is being activated.
     * @param dc The dialog context for the current turn of conversation.
     * @param dialogArgs (Optional) arguments that were passed to the dialog during `begin()` call that started the instance.
     */
    abstract dialogBegin(dc: DialogContext<C>, dialogArgs?: any): Promiseable<any>;
    /**
     * (Optional) method called when an instance of the dialog is the active dialog and the user
     * replies with a new activity. The dialog will generally continue to receive the users replies
     * until it calls `DialogContext.end()`, `DialogContext.begin()`, or `DialogContext.prompt()`.
     *
     * If this method is NOT implemented then the dialog will be automatically ended when the user
     * replies.
     * @param dc The dialog context for the current turn of conversation.
     */
    dialogContinue?(dc: DialogContext<C>): Promiseable<any>;
    /**
     * (Optional) method called when an instance of the dialog is being returned to from another
     * dialog that was started by the current instance using `DialogContext.begin()` or
     * `DialogContext.prompt()`.
     *
     * If this method is NOT implemented then the dialog will be automatically ended with a call
     * to `DialogContext.end()`. Any result passed from the called dialog will be passed to the
     * active dialogs parent.
     * @param dc The dialog context for the current turn of conversation.
     * @param result (Optional) value returned from the dialog that was called. The type of the value returned is dependant on the dialog that was called.
     */
    dialogResume?(dc: DialogContext<C>, result?: any): Promiseable<any>;
}
/**
 * Function signature of a waterfall step.
 *
 * ```TypeScript
 * type WaterfallStep<C extends TurnContext> = (dc: DialogContext<C>, args?: any, next?: SkipStepFunction) => Promiseable<any>;
 * ```
 *
 * @remarks
 * This example shows a simple waterfall that prompts a user to enter the fields needed to set an alarm:
 *
 * ```JavaScript
 * dialogs.add('addAlarm', [
 *      async function (dc, alarm, next) {
 *          dc.activeDialog.state.alarm = alarm || {};
 *          if (!alarm.title) {
 *              await dc.prompt('titlePrompt', `What would you like to call your alarm?`);
 *          } else {
 *              await next(alarm.title);
 *          }
 *      },
 *      async function (dc, title, next) {
 *          const alarm = dc.activeDialog.state.alarm;
 *          alarm.title = title;
 *          if (!alarm.time) {
 *              await dc.prompt('timePrompt', `What time would you like to set it for?`);
 *          } else {
 *              await next(alarm.time);
 *          }
 *      },
 *      async function (dc, time) {
 *          const alarm = dc.activeDialog.state.alarm;
 *          alarm.time = time;
 *
 *          // ... set alarm ...
 *
 *          await dc.context.sendActivity(`Alarm set.`);
 *          await dc.end();
 *      }
 * ]);
 * ```
 * @param WaterfallStep.context The dialog context for the current turn of conversation.
 * @param WaterfallStep.args Argument(s) passed into the dialog for the first step and then the results from calling a prompt or other dialog for subsequent steps.
 * @param WaterfallStep.next Function passed into the step to let you manually skip to the next step in the waterfall.
 */
export declare type WaterfallStep<C extends TurnContext> = (dc: DialogContext<C>, args?: any, next?: SkipStepFunction) => Promiseable<any>;
/**
 * When called within a waterfall step the dialog will skip to the next waterfall step.
 *
 * ```TypeScript
 * type SkipStepFunction = (args?: any) => Promise<any>;
 * ```
 * @param SkipStepFunction.args (Optional) additional argument(s) to pass into the next step.
 */
export declare type SkipStepFunction = (args?: any) => Promise<any>;
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
 *  dialogs.add('namePrompt', [
 *      async function (dc) {
 *          dc.activeDialog.state.profile = { first: '', last: '', full: '' };
 *          await dc.context.sendActivity(`What's your first name?`);
 *      },
 *      async function (dc, firstName) {
 *          dc.activeDialog.state.profile.first = firstName;
 *          await dc.context.sendActivity(`Great ${firstName}! What's your last name?`);
 *      },
 *      async function (dc, lastName) {
 *          const profile = dc.activeDialog.state.profile;
 *          profile.last = lastName;
 *          profile.full = profile.first + ' ' + profile.last;
 *          await dc.end(profile);
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
 *          dc.activeDialog.state.survey = { name: undefined, languages: '', years: 0 };
 *          await dc.begin('namePrompt');
 *      },
 *      async function (dc, name) {
 *          dc.activeDialog.state.survey.name = name;
 *          await dc.context.sendActivity(`Ok ${name.full}... What programming languages do you know?`);
 *      },
 *      async function (dc, languages) {
 *          dc.activeDialog.state.survey.languages = languages;
 *          await dc.prompt('yearsPrompt', `Great. So how many years have you been programming?`);
 *      },
 *      async function (dc, years) {
 *          dc.activeDialog.state.survey.years = years;
 *          await dc.context.sendActivity(`Thank you for taking our survey.`);
 *          await dc.end(dc.activeDialog.survey);
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
