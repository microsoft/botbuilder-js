// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes, CardFactory } = require('botbuilder');
const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');

const { CafeDialog } = require('./dialog');
const templateReferences = require('./dialog/templateReferences.json');

// Cafe Dialog ID
const CAFE_DIALOG = 'cafeDialog';

// State Accessor Properties
const DIALOG_STATE_PROPERTY = 'dialogState';
const USER_PROFILE_STATE_PROPERTY = 'userProfileState';

class Bot {
	/**
	 * @param {ConversationState} conversationState property accessor
	 * @param {UserState} userState property accessor
	 * @param {BotConfiguration} botConfig contents of the .bot file
	 * @param {any} entitiesStateAccessor property accessor
	 */
	constructor(conversationState, userState, botConfig, entitiesStateAccessor) {
		if (!conversationState) throw 'Missing parameter.  conversationState is required';
		if (!userState) throw 'Missing parameter.  userState is required';
		if (!botConfig) throw 'Missing parameter.  botConfig is required';

		// Create the property accessors for user and conversation state
		this.userProfileStateAccessor = userState.createProperty(USER_PROFILE_STATE_PROPERTY);
		this.dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);

		// Create top-level dialog(s)
		this.dialogs = new DialogSet(this.dialogState);
		this.dialogs.add(new CafeDialog(CAFE_DIALOG, this.userProfileStateAccessor, entitiesStateAccessor));
	}

	/**
	 * Driver code that does one of the following:
	 * 1. Display a welcome message upon startup
	 * 2. Start a cafe bot dialog
	 *
	 * @param {Context} context turn context from the adapter
	 */
	async onTurn(context) {
		// // Create a dialog context
		const dc = await this.dialogs.createContext(context);

		const dialogResult = await dc.continue();

		if (context.activity.type === ActivityTypes.Message && dialogResult.status === DialogTurnStatus.empty) {
			await dc.begin(CAFE_DIALOG);
		} else if (context.activity.type === 'conversationUpdate' && context.activity.membersAdded[0].name === 'Bot') {
			await context.sendActivity({ text: templateReferences.welcomeUserTemplate });
		}
	}
}

module.exports = Bot;
