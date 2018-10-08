// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ComponentDialog, WaterfallDialog, TextPrompt, NumberPrompt, ConfirmPrompt } = require('botbuilder-dialogs');

// User state for greeting dialog
const { UserProfile } = require('./userProfile');
const templateReferences = require('./templateReferences.json');
const fallbackText = require('./fallbackText.json');

// Dialog IDs
const CAFE_DIALOG = 'details';

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
 */
class CafeDialog extends ComponentDialog {
	constructor(dialogId, userProfileStateAccessor, entitiesStateAccessor) {
		super(dialogId);

		// validate what was passed in
		if (!dialogId) throw 'Missing parameter.  dialogId is required';
		if (!userProfileStateAccessor) throw 'Missing parameter.  userProfileStateAccessor is required';
		if (!entitiesStateAccessor) throw 'Missing parameter.  entitiesStateAccessor is required';

		// Add control flow dialogs
		this.addDialog(
			new WaterfallDialog(CAFE_DIALOG, [
				this.locationStep.bind(this),
				this.patySizePrompt.bind(this),
				this.timePrompt.bind(this),
				this.confirmPrompt.bind(this),
				this.confirmReadoutPrompt.bind(this),
			]),
		);

		// Add text prompts for name
		this.addDialog(new TextPrompt(LOCATION_PROMPT));
		this.addDialog(new NumberPrompt(PARTY_SIZE_PROMPT));
		this.addDialog(new TextPrompt(TIME_PROMPT));
		this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
		this.addDialog(new TextPrompt(BOOKING_CONFIRMATION_READOUT_PROMPT));

		// Save off our state accessor for later use
		this.userProfileStateAccessor = userProfileStateAccessor;
		this.entitiesStateAccessor = entitiesStateAccessor;
	}

	/**
	 * Waterfall Dialog step function.
	 *
	 * @param {DialogContext} dc context for this dialog
	 * @param {WaterfallStepContext} step contextual information for the current step being executed
	 */
	async locationStep(dc, step) {
		let userProfileState = await this.userProfileStateAccessor.get(dc.context);
		if (userProfileState === undefined) {
			if (step.options && step.options.userProfileState) {
				await this.userProfileStateAccessor.set(dc.context, step.options.userProfileState);
			} else {
				await this.userProfileStateAccessor.set(dc.context, new UserProfile());
			}
		}

		this._updateLGEntities(dc.context, {
			knowCurUserLocation: true,
			curUserLocation: 'Cairo',
		});

		const newUserProfileState = await this.userProfileStateAccessor.get(dc.context);
		if (!newUserProfileState.location) {
			// prompt for name, if missing
			await dc.context.sendActivity(templateReferences.askForLocationTemplate);
			return await dc.prompt(CONFIRM_PROMPT, 'Please confirm');
		} else {
			return await step.next();
		}
	}

	/**
	 * Waterfall Dialog step function.
	 *
	 * @param {DialogContext} dc context for this dialog
	 * @param {WaterfallStepContext} step contextual information for the current step being executed
	 */
	async patySizePrompt(dc, step) {
		if (!step.result) {
			await dc.context.sendActivity(fallbackText.notAvailableInThisPlace);
			return this._resetDialog(dc);
		}

		await this._updateUserProfileState(dc.context, 'location', 'Cairo');

		const userProfileState = await this.userProfileStateAccessor.get(dc.context);
		if (!userProfileState.partSize) {
			// prompt for name, if missing
			return await dc.prompt(PARTY_SIZE_PROMPT, templateReferences.askForPartySizeTemplate);
		} else {
			return await step.next();
		}
	}

	/**
	 * Waterfall Dialog step function.
	 *
	 * @param {DialogContext} dc context for this dialog
	 * @param {WaterfallStepContext} step contextual information for the current step being executed
	 */
	async timePrompt(dc, step) {
		await this._updateUserProfileState(dc.context, 'partySize', step.result);

		const userProfileState = await this.userProfileStateAccessor.get(dc.context);

		if (!userProfileState.time) {
			this._updateLGEntities(dc.context, {
				haveDate: true,
			});

			// prompt for name, if missing
			return await dc.prompt(TIME_PROMPT, templateReferences.askForDateTimeTemplate);
		} else {
			return await step.next();
		}
	}

	/**
	 * Waterfall Dialog step function.
	 *
	 * @param {DialogContext} dc context for this dialog
	 * @param {WaterfallStepContext} step contextual information for the current step being executed
	 */
	async confirmPrompt(dc, step) {
		await this._updateUserProfileState(dc.context, 'time', step.result);

		const userProfileState = await this.userProfileStateAccessor.get(dc.context);

		this._updateLGEntities(dc.context, {
			partySize: userProfileState.partySize,
			userLocation: userProfileState.location,
			dateTimeReadout: userProfileState.time,
		});

		return await dc.prompt(CONFIRM_PROMPT, templateReferences.confirmBookingReadoutTemplate);
	}

	/**
	 * Waterfall Dialog step function.
	 *
	 * @param {DialogContext} dc context for this dialog
	 * @param {WaterfallStepContext} step contextual information for the current step being executed
	 */
	async confirmReadoutPrompt(dc, step) {
		if (step.result) {
			this._updateLGEntities(dc.context, {
				confNumber: '#1230',
			});

			return await dc.prompt(BOOKING_CONFIRMATION_READOUT_PROMPT, templateReferences.bookingConfirmationReadoutTemplate);
		} else {
			await dc.prompt(BOOKING_CONFIRMATION_READOUT_PROMPT, 'Okay, see you!');
			return this._resetDialog(dc);
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
		const obj = await this.entitiesStateAccessor.get(context);
		obj.entities = { ...obj.entities, ...newObj };
		await this.entitiesStateAccessor.set(context, obj);
	}

	/**
	 * Resets the current dialog and deletes all the property accessors
	 *
	 * @param {DialogContext}
	 */
	async _resetDialog(dc) {
		await this.userProfileStateAccessor.set(dc.context, new UserProfile());
		await this.entitiesStateAccessor.set(dc.context, {});

		await dc.cancelAll();
		return await dc.end();
	}
}

module.exports.CafeDialog = CafeDialog;
