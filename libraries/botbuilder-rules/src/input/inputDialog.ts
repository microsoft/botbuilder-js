/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AdaptiveDialog, AdaptiveDialogConfiguration } from '../adaptiveDialog';
import { InputSlot } from './inputSlot';
import { PlanningContext, RuleDialogEventNames, RuleDialogState, PlanChangeList, PlanChangeType, PlanStepState } from '../planningContext';
import { DialogEvent, DialogTurnResult, Dialog } from 'botbuilder-dialogs';
import { RecognizerResult, Activity, InputHints } from 'botbuilder-core';
import { SendActivity } from '../steps';

export interface InputDialogAction {
    tagSelector: string;
    steps: Dialog[];
}

export interface CompiledInputDialogAction {
    tags: { [name: string]: any; }
    tagCount: number;
    hasPriority: boolean;
    steps: Dialog[];
}

export interface InputSlotEventValue<T = any> {
    slot: InputSlot<T>;
    value?: T;
    recognized?: RecognizerResult;
}

export interface InputDialogConfiguration extends AdaptiveDialogConfiguration {
    /**
     * Slot class used to recognize and validate the users input.
     */
    slot?: InputSlot;

    /**
     * Actions configured for the input dialog.
     */
    actions?: InputDialogAction[];

    /**
     * The in-memory property that the input dialog is bound to.
     */
    property?: string;
}

export class InputDialog<O extends object = {}> extends AdaptiveDialog<O> {
    constructor(slot?: InputSlot, property?: string, activity?: string|Partial<Activity>, speak?: string, inputHint?: InputHints) {
        super();
        if (slot) { this.slot = slot }
        if (property) { this.property = property }
        if (activity) {
            this.sendActivity('', activity, speak, inputHint);
        }
    }
    
    protected onComputeID(): string {
        return `inputDialog[${this.bindingPath()}]`;
    }

    protected onInstallDependencies(): void {
        // Install actions
        this.actions.forEach((action) => {
            // Install steps
            action.steps.forEach((step) => this.addDialog(step));

            // Compile selector(s)
            // - Commas in a selector are ORs' and periods are ANDs'.
            action.tagSelector.split(',').forEach((selector) => {
                const tags = selector.trim().split('.');
                const compiled: CompiledInputDialogAction = {
                    tags: {},
                    tagCount: tags.length,
                    hasPriority: false,
                    steps: action.steps
                };
                tags.forEach((tag) => { 
                    compiled.tags[tag] = '';
                    if (tag.indexOf('intent(') == 0 || tag.indexOf('turn(')) { compiled.hasPriority = true }
                });
                this.compiledActions.push(compiled);
            });
        });
        super.onInstallDependencies();
    }

    /**
     * Registered [actions](#actions) after they've been compiled on first run.
     */
    protected compiledActions: CompiledInputDialogAction[] = [];

    /**
     * Slot class used to recognize and validate the users input.
     */
    public slot: InputSlot;

    /**
     * Actions configured for the input dialog.
     */
    public readonly actions: InputDialogAction[] = [];

    /**
     * Data binds input dialog to the given property.
     * 
     * @remarks
     * The bound properties current value will be passed to the called dialog as part of its 
     * options and will be accessible within the dialog via `dialog.result`. The result
     * returned from the called dialog will then be copied to the bound property.
     */
    public set property(value: string) {
        this.inputBindings['value'] = value;
        this.outputBinding = value;
    }

    public get property(): string {
        return this.outputBinding;
    }

    public async evaluateRules(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        // Process users input
        let handled = false;
        const state = planning.activeDialog.state as InputDialogState<O>;
        switch (event.name) {
            case RuleDialogEventNames.beginDialog:
                // Initialize turn count and result object
                state.turnCount = 0;

                // Validate slots initial value
                handled = await this.onValidateSlot(planning);
                break;

            case RuleDialogEventNames.consultDialog:
                // Just increment turn count
                state.turnCount += 0;
                break;

            case RuleDialogEventNames.unhandledUtterance:
                if (planning.hasPlans) {
                    // Remember that we're in the middle of continuing an action 
                    state.continuingAction = true;
                } else {
                    // Recognize users input
                    handled = await this.onRecognizeInput(planning, event.value);
                }
                break;

            case RuleDialogEventNames.slotMissing:
                handled = await this.onSlotMissing(planning, event);
                break;

            case RuleDialogEventNames.slotInvalid:
                handled = await this.onSlotInvalid(planning, event);
                break;

            case RuleDialogEventNames.inputFulfilled: 
                handled = await this.onInputFulfilled(planning);
                break;
        }

        // Let base class try to handle event
        if (!handled) {
            handled = await super.evaluateRules(planning, event);
        }
        return handled;
    }

    public configure(config: InputDialogConfiguration): this {
        return super.configure(config);
    }

    //=============================================================================================
    // Recognize and Validate Users Input
    //=============================================================================================

    protected async onRecognizeInput(planning: PlanningContext, recognized: RecognizerResult): Promise<boolean> {
        // Attempt to recognize input
        const state = planning.activeDialog.state as InputDialogState<O>;
        const result = await this.slot.recognizeInput(planning, recognized, state.turnCount);
        if (result.succeeded) {
            state.result = result.value;
        }

        // Validate slot
        return await this.onValidateSlot(planning);
    }

    protected async onValidateSlot(planning: PlanningContext, recognized?: RecognizerResult): Promise<boolean> {
        // Check for a slot value
        const value: InputSlotEventValue = { slot: this.slot, recognized: recognized };
        const state = planning.activeDialog.state as InputDialogState<O>;
        if (state.result != undefined) {
            // Validate slot
            if (await this.slot.validateValue(planning, state.result)) {
                // Emit inputFulfilled event
                return await this.evaluateRules(planning, { name: RuleDialogEventNames.inputFulfilled, bubble: false });
            } else {
                // Emit slotInvalid event 
                value.value = state.result;
                return await this.evaluateRules(planning, { name: RuleDialogEventNames.slotInvalid, value: value, bubble: false });
            }
        } else {
            // Emit slotMissing event
            return await this.evaluateRules(planning, { name: RuleDialogEventNames.slotMissing, value: value, bubble: false });
        }
    }

    //=============================================================================================
    // Slot Missing or Invalid Events
    //=============================================================================================

    protected async onSlotMissing(planning: PlanningContext, event: DialogEvent<InputSlotEventValue>): Promise<boolean> {
        // Get active tags
        const state = planning.activeDialog.state as InputDialogState<O>;
        const additionalTags = [`turn(${state.turnCount})`, `missing(${this.slot.name})`].concat(this.getIntentTags(event.value.recognized));
        if (state.turnCount > 0) { additionalTags.push('reprompt') }      
        const tags = this.getActiveTags(planning, additionalTags);

        // Queue up top missing slot action
        const actions = this.actionsContainingTags(this.compiledActions, tags);
        return this.queueTopAction(planning, actions);
    }

    protected async onSlotInvalid(planning: PlanningContext, event: DialogEvent<InputSlotEventValue>): Promise<boolean> {
        // Get active tags
        const state = planning.activeDialog.state as InputDialogState<O>;
        const additionalTags = [`turn(${state.turnCount})`, `invalid(${this.slot.name} || '')`].concat(this.getIntentTags(event.value.recognized))
        if (state.turnCount > 0) { additionalTags.push('reprompt') }        
        const tags = this.getActiveTags(planning, additionalTags);

        // Queue up top missing slot action
        const actions = this.actionsContainingTags(this.compiledActions, tags);
        return this.queueTopAction(planning, actions, { value: event.value.value });
    }

    //=============================================================================================
    // Input Fulfilled Event
    //=============================================================================================

    protected async onInputFulfilled(planning: PlanningContext): Promise<boolean> {
        // Change state to fulfilled
        const state = planning.activeDialog.state as InputDialogState<O>;
        state.fulfilled = true;

        // Get active tags
        const filledTag = `filled(${this.slot.name} || '')`;
        const tags = this.getActiveTags(planning, [filledTag]);

        // Queue up top fulfillment action (if any.)
        const actions = this.actionsContainingTags(this.compiledActions, tags);
        const filledActions = this.actionsWithTag(actions, filledTag);
        this.queueTopAction(planning, filledActions);

        return true;
    }

    protected async onEndOfPlan(planning: PlanningContext): Promise<DialogTurnResult> {
        // Evaluate current status
        const state = planning.activeDialog.state as InputDialogState<O>;
        if (state.fulfilled) {
            // Return result
            return await planning.endDialog(state.result);
        } else if (state.continuingAction) {
            // The action just completed so we need to re-evaluate our state and re-prompt as
            // needed.
            delete state.continuingAction;
            await this.onValidateSlot(planning);
            return await this.continuePlan(planning);
        } else {
            // Just wait for user to reply
            return Dialog.EndOfTurn;
        }
    }

    //=============================================================================================
    // Actions
    //=============================================================================================

    public sendActivity(tagSelector: string, activity: string|Partial<Activity>, speak?: string, inputHint?: InputHints): this {
        this.actions.push({
            tagSelector: tagSelector,
            steps: [
                new SendActivity(activity, speak, inputHint)
            ]
        })
        return this;
    }

    public doSteps(tagSelector: string, steps: Dialog[]): this {
        this.actions.push({
            tagSelector: tagSelector,
            steps: steps
        })
        return this;
    }

    protected getActiveTags(planning: PlanningContext, additionalTags: string[] = []): { [name: string]: any; } {
        const tags: { [name: string]: any; } = {};

        // Add tag for tun
        const state = planning.activeDialog.state as InputDialogState<O>;
        tags[`turn(${state.turnCount})`] = '';

        // Add active tags
        planning.activeTags.forEach((tag) => tags[tag] = '');

        // Add additional tags
        additionalTags.forEach((tag) => tags[tag] = '');

        return tags;
    }

    protected getIntentTags(recognized: RecognizerResult|undefined): string[] {
        const tags: string[] = [];
        if (recognized && recognized.intents) {
            for (const intent in recognized.intents) {
                if (recognized.intents.hasOwnProperty(intent)) {
                    tags.push(`intent(${intent})`);
                }
            }
        }

        return tags;
    }

    protected actionsContainingTags(actions: CompiledInputDialogAction[], tags: { [name: string]: any; }): CompiledInputDialogAction[] {
        return actions.filter((action) => {
            for (const tag in action.tags) {
                if (action.tags.hasOwnProperty(tag)) {
                    if (!tags.hasOwnProperty(tag)) {
                        return false;
                    }
                }
            }

            return true;
        });
    }

    protected actionsWithTag(actions: CompiledInputDialogAction[], tag: string): CompiledInputDialogAction[] {
        return actions.filter((action) => action.tags.hasOwnProperty(tag));
    }

    protected queueTopAction(planning: PlanningContext, actions: CompiledInputDialogAction[], options?: object): boolean {
        // Find top action
        let top: CompiledInputDialogAction = undefined;
        let hasPriority = false;
        actions.forEach((action) => {
            if (hasPriority) {
                if (action.hasPriority && action.tagCount > top.tagCount) {
                    top = action;
                }
            } else {
                if (top == undefined || action.hasPriority || action.tagCount > top.tagCount) {
                    top = action;
                    hasPriority = action.hasPriority;
                }
            }
        });

        // Queue actions steps
        if (top) {
            const changes: PlanChangeList = { changeType: PlanChangeType.doSteps, steps: [] };
            top.steps.forEach((step) => {
                const stepState: PlanStepState = { dialogStack: [], dialogId: step.id };
                if (options) { stepState.options = options }
                changes.steps.push(stepState);
            });
            planning.queueChanges(changes);
            return true;
        } else {
            return false;
        }
    }
}

interface InputDialogState<O extends object> extends RuleDialogState<O> {
    turnCount: number;
    fulfilled?: boolean;
    continuingAction?: boolean;
}

