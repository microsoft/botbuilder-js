// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ComponentDialog, WaterfallDialog, TextPrompt, NumberPrompt, ConfirmPrompt } = require('botbuilder-dialogs');

// User state for greeting dialog
const { UserProfile } = require('./userProfile');
const templateReferences = require('../lgTemplateReferences.json');
const fallbackText = require('./fallbackText.json');

// Dialog IDs
const TABLE_BOOK_DIALOG = 'tableBookDialog';

// Prompt IDs
const WELCOME_PROMPT = 'welcomePrompt';
const LOCATION_PROMPT = 'locationPrompt';
const TIME_PROMPT = 'timePrompt';
const PARTY_SIZE_PROMPT = 'partySizePrompt';
const CONFIRM_PROMPT = 'confirmPrompt';
const BOOKING_CONFIRMATION_READOUT_PROMPT = 'bookingConfirmationReadoutPrompt';

/**
 * Demonstrates the following concepts:
 *  Use a subclass of ComponentDialog to implement a mult-turn conversation
 *  Use a Waterflow dialog to model multi-turn conversation flow
 *  Use custom prompts to validate user input
 *  Store conversation and user state
 *
 * @param {String} dialogId unique identifier for this dialog instance
 * @param {PropertyStateAccessor} userProfileStateAccessor property accessor for user state
 * @param {PropertyStateAccessor} lgEntitiesStateAccessor property accessor for user state
 */
class BookTableDialog extends ComponentDialog {
    constructor(dialogId, userProfileStateAccessor, lgEntitiesStateAccessor) {
        super(dialogId);

        // validate what was passed in
        if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
        if (!userProfileStateAccessor) throw new Error('Missing parameter.  userProfileStateAccessor is required');
        if (!lgEntitiesStateAccessor) throw new Error('Missing parameter.  lgEntitiesStateAccessor is required');

        // Add control flow dialogs
        this.addDialog(
            new WaterfallDialog(TABLE_BOOK_DIALOG, [
                this.welcomeStep.bind(this),
                this.locationStep.bind(this),
                this.patySizePrompt.bind(this),
                this.timePrompt.bind(this),
                this.confirmPrompt.bind(this),
                this.confirmReadoutPrompt.bind(this)
            ])
        );

        // Add text prompts for name
        this.addDialog(new TextPrompt(LOCATION_PROMPT));
        this.addDialog(new NumberPrompt(PARTY_SIZE_PROMPT));
        this.addDialog(new TextPrompt(TIME_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new TextPrompt(BOOKING_CONFIRMATION_READOUT_PROMPT));

        // Save off our state accessor for later use
        this.userProfileStateAccessor = userProfileStateAccessor;
        this.lgEntitiesStateAccessor = lgEntitiesStateAccessor;
    }

    /**
     * Waterfall Dialog step function.
     *
     * @param {WaterfallStepContext} step contextual information for the current step being executed
     */
    async welcomeStep(step) {
        let userProfileState = await this.userProfileStateAccessor.get(step.context);
        if (userProfileState === undefined) {
            if (step.options && step.options.userProfileState) {
                await this.userProfileStateAccessor.set(step.context, step.options.userProfileState);
            } else {
                await this.userProfileStateAccessor.set(step.context, new UserProfile());
            }
        }

        // prompt for name, if missing
        await step.context.sendActivity(templateReferences.welcomeUserTemplate);
        return await step.prompt(CONFIRM_PROMPT, 'Please confirm');
    }

    /**
     * Waterfall Dialog step function.
     *
     * @param {WaterfallStepContext} step contextual information for the current step being executed
     */
    async locationStep(step) {
        if (!step.result) {
            await step.context.sendActivity(fallbackText.unableToHelp);
            return this._resetDialog(step);
        }

        this._updateLGEntities(step.context, {
            knowCurUserLocation: true,
            curUserLocation: 'Cairo'
        });

        const newUserProfileState = await this.userProfileStateAccessor.get(step.context);
        if (!newUserProfileState.location) {
            // prompt for name, if missing
            await step.context.sendActivity(templateReferences.askForLocationTemplate);
            return await step.prompt(CONFIRM_PROMPT, 'Please confirm');
        } else {
            return await step.next();
        }
    }

    /**
     * Waterfall Dialog step function.
     *
     * @param {WaterfallStepContext} step contextual information for the current step being executed
     */
    async patySizePrompt(step) {
        if (!step.result) {
            await step.context.sendActivity(fallbackText.notAvailableInThisPlace);
            return this._resetDialog(step);
        }

        await this._updateUserProfileState(step.context, 'location', 'Cairo');

        const userProfileState = await this.userProfileStateAccessor.get(step.context);
        if (!userProfileState.partSize) {
            // prompt for name, if missing
            return await step.prompt(PARTY_SIZE_PROMPT, templateReferences.askForPartySizeTemplate);
        } else {
            return await step.next();
        }
    }

    /**
     * Waterfall Dialog step function.
     *
     * @param {WaterfallStepContext} step contextual information for the current step being executed
     */
    async timePrompt(step) {
        await this._updateUserProfileState(step.context, 'partySize', step.result);

        const userProfileState = await this.userProfileStateAccessor.get(step.context);

        if (!userProfileState.time) {
            this._updateLGEntities(step.context, {
                haveDate: true
            });

            // prompt for name, if missing
            return await step.prompt(TIME_PROMPT, templateReferences.askForDateTimeTemplate);
        } else {
            return await step.next();
        }
    }

    /**
     * Waterfall Dialog step function.
     *
     * @param {WaterfallStepContext} step contextual information for the current step being executed
     */
    async confirmPrompt(step) {
        await this._updateUserProfileState(step.context, 'time', step.result);

        const userProfileState = await this.userProfileStateAccessor.get(step.context);

        this._updateLGEntities(step.context, {
            partySize: userProfileState.partySize,
            userLocation: userProfileState.location,
            dateTimeReadout: userProfileState.time
        });

        return await step.prompt(CONFIRM_PROMPT, templateReferences.confirmBookingReadoutTemplate);
    }

    /**
     * Waterfall Dialog step function.
     *
     * @param {WaterfallStepContext} step contextual information for the current step being executed
     */
    async confirmReadoutPrompt(step) {
        if (step.result) {
            this._updateLGEntities(step.context, {
                confNumber: '#1230'
            });

            return await step.prompt(BOOKING_CONFIRMATION_READOUT_PROMPT, templateReferences.bookingConfirmationReadoutTemplate);
        } else {
            await step.prompt(BOOKING_CONFIRMATION_READOUT_PROMPT, 'Okay, see you!');
            return this._resetDialog(step);
        }
    }

    async _updateUserProfileState(context, field, value) {
        const userProfileState = await this.userProfileStateAccessor.get(context);

        await this.userProfileStateAccessor.set(context, { ...userProfileState, [field]: value });
    }

    /**
     * Helper function to easily update the entities property accessor
     *
     * @param context {Context}
     * @param obj {Object}
     */
    async _updateLGEntities(context, newObj) {
        const obj = await this.lgEntitiesStateAccessor.get(context, {});
        obj.entities = { ...obj.entities, ...newObj };
        await this.lgEntitiesStateAccessor.set(context, obj);
    }

    /**
     * Resets the current dialog and deletes all the property accessors
     *
     * @param {DialogContext}
     */
    async _resetDialog(step) {
        await this.userProfileStateAccessor.set(step.context, new UserProfile());
        await this.lgEntitiesStateAccessor.set(step.context, {});

        return await step.endDialog();
    }
}

module.exports.BookTableDialog = BookTableDialog;
