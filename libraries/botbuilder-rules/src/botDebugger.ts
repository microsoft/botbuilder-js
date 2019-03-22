/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
	Activity,
	ActivityTypes,
	BotAdapter,
	BotAdapterSet,
	ConversationReference,
	Storage,
	TurnContext
} from 'botbuilder-core';
import {Bot, StoredBotState} from './bot';
import * as crypto from 'crypto';
import {ConnectorClient} from 'botframework-connector';
import * as msRest from "@azure/ms-rest-js";
import {ConversationParameters} from 'botframework-schema';

/**
 * Key for accessing emulator specific data in memory
 * @type {string}
 */
const key = crypto
	.createHash('SHA256')
	.update(JSON.stringify(process.env))
	.digest()
	.toString('base64');

/**
 * Interface used for commands specific to
 * bot debugging.
 */
export interface BotDebuggerCommand {
	/**
	 * The command name
	 */
	name: string;
	/**
	 * The ConversationReference relating this command
	 * to a particular conversation.
	 */
	relatesTo: Partial<ConversationReference>;
	/**
	 * Arbitrary value to pass to the command.
	 */
	value?: any;
}

/**
 * The EmulatorServiceCredentials class is used for
 * The ConnectorAPI client. It adds X headers needed
 * for the emulator to properly begin a debug session.
 */
class EmulatorServiceCredentials implements msRest.ServiceClientCredentials {

	public signRequest(webResource: msRest.WebResource): Promise<msRest.WebResource> {
		// TODO - implant proper config settings for the BotEndpoint
		webResource.headers.set('X-Emulator-BotEndpoint', `http://localhost:${process.env.PORT}/api/messages/`);
		webResource.headers.set('X-Emulator-AppId', process.env.MICROSOFT_APP_ID);
		webResource.headers.set('X-Emulator-AppPassword', process.env.MICROSOFT_APP_PASSWORD);

		return Promise.resolve(webResource);
	}
}

/**
 * The BotDebugger class is the primary class
 * used for local and remote debugging. It mediates
 * the transfer of activities and Bot state to and
 * from the active debug session in the Emulator.
 */
export class BotDebugger extends BotAdapterSet {
	public stateStorage: Storage;

	/**
	 * Attempts to connect to the Emulator and establish
	 * a debug session using the Connector client. If no
	 * connection can be established, an error is thrown.
	 *
	 * @param context The TurnContext of the active conversation between the user and the Bot.
	 * @return Promise<string> A Promise containing the newly created debug session id. This
	 * id is used in later calls to properly route activities to the Emulator.
	 */
	private static async connectToEmulator(context: TurnContext): Promise<string> {
		const client = new ConnectorClient(new EmulatorServiceCredentials() as any, {baseUri: process.env.EMULATOR_URL});
		const payload: ConversationParameters = {
			bot: context.activity.recipient,
			isGroup: context.activity.conversation.isGroup,
			members: [context.activity.recipient],
			activity: BotDebugger.trace(context.activity.conversation, 'https://www.botframework.com/schemas/debug', 'Debug', 'Debug Connection Request') as Activity,
			channelData: null
		};
		try {
			const result = await client.conversations.createConversation(payload);
			if (result._response.status === 200) {
				return result.id;
			}
		} catch (e) {
			throw e;
		}
	}

	/**
	 * Creates a trace activity from the specified arguments.
	 *
	 * @param value Data to be included with this trace
	 * @param valueType The type of the value that's being set
	 * @param name The name of the trace.
	 * @param label The label of the trace.
	 */
	private static trace(value: any, valueType: string, name: string, label: string): Partial<Activity> {
		return {
			type: ActivityTypes.Trace,
			timestamp: new Date(),
			name: name,
			label: label,
			value: value,
			valueType: valueType
		};
	}

	/**
	 * Constructs a new BotDebugger instance.
	 *
	 * @param stateStorage (Optional) The Storage interface
	 * @param defaultAdapter (Optional) The default adapter.
	 */
	constructor(stateStorage?: Storage, defaultAdapter?: BotAdapter) {
		super(defaultAdapter);
		this.stateStorage = stateStorage;
	}

	/**
	 * Retrieves the StoredBotState associated with the
	 * specified ConversationReference.
	 *
	 * @param reference The ConversationReference to load the StoredBotState from.
	 */
	public async loadBotState(reference: Partial<ConversationReference>): Promise<StoredBotState> {
		// Get storage keys and read state
		const keys = Bot.getStorageKeysForReference(reference);
		return await Bot.loadBotState(this.stateStorage, keys);
	}

	/**
	 * Saves the specified bot state to the storage interface.
	 * The bot state should be verified for integrity prior to
	 * calling this function. A typical use case includes changing
	 * the bot state within the Emulator and passing it back via a command
	 * to test or update various use cases.
	 *
	 * @param reference The ConversationReference containing the bot state
	 * @param state Teh StoredBot state to save
	 */
	public async saveBotState(reference: Partial<ConversationReference>, state: StoredBotState): Promise<void> {
		// Get storage keys and write state
		const keys = Bot.getStorageKeysForReference(reference);
		return await Bot.saveBotState(this.stateStorage, keys, state);
	}

	/**
	 * @inheritDoc
	 */
	protected async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
		const {channelId, type, name, value} = context.activity;

		// Check for debugging mode
		const log: Partial<Activity>[] = [];
		const debugging = channelId === 'emulator' || await this.inDebugSession(context);
		if (debugging) {
			// Check for debug commands from emulator
			if (type === ActivityTypes.Event && name === 'debuggerCommand') {
				const command: BotDebuggerCommand = value;
				const relatesTo = command.relatesTo;
				switch (command.name) {
					case 'loadBotState':
						const state = await this.loadBotState(relatesTo);
						await context.sendActivity(BotDebugger.trace(state, 'https://www.botframework.com/schemas/botState', 'BotState', 'Bot State'));
						break;
					case 'saveBotState':
						await this.saveBotState(relatesTo, command.value as StoredBotState);
						break;
				}
				return;
			}

			// Log all activities and changes
			// - We don't need to do this for the emulator as its already seeing everything
			if (channelId !== 'emulator') {
				// Log incoming activity
				log.push(BotDebugger.trace(Object.assign({}, context.activity), 'https://www.botframework.com/schemas/activity', 'ReceivedActivity', 'Received Activity'));

				// Log ougoing activities and changes
				context.onSendActivities((ctx, activities, next) => {
					activities.forEach((activity) => {
						log.push(BotDebugger.trace(Object.assign({}, activity), 'https://www.botframework.com/schemas/activity', 'SentActivity', 'Sent Activity'));
					});
					return next();
				});
				context.onUpdateActivity((ctx, activity, next) => {
					const updated = Object.assign({}, activity);
					updated.type = ActivityTypes.MessageUpdate;
					log.push(BotDebugger.trace(updated, 'https://www.botframework.com/schemas/activity', 'MessageUpdate', 'Updated Message'));
					return next();
				});
				context.onDeleteActivity((ctx, reference, next) => {
					const deleted: Partial<Activity> = {
						type: ActivityTypes.MessageDelete,
						id: reference.activityId
					};
					log.push(BotDebugger.trace(deleted, 'https://www.botframework.com/schemas/activity', 'MessageDelete', 'Deleted Message'));
					return next();
				});
			}
		}

		// Execute turn
		try {
			await next();
		} catch (err) {
			// Log error
			if (debugging) {
				log.push(BotDebugger.trace({message: err.toString()}, 'https://www.botframework.com/schemas/error', 'TurnError', 'Turn Error'));
			}
			throw err;
		} finally {
			// Dump debug info to emulator
			if (debugging) {
				// Append snapshot of turns final bot state to log
				let state = context.turnState.get(Bot.BotStateSnapshotKey);
				if (!state) {
					state = this.loadBotState(TurnContext.getConversationReference(context.activity));
				}
				log.push(BotDebugger.trace(state, 'https://www.botframework.com/schemas/botState', 'BotState', 'Bot State'));

				// Send log to emulator
				await this.sendToEmulator(context, log);
			}
		}
	}

	/**
	 * Determines if the BotDebugger is in a debug session.
	 *
	 * @param context The TurnContext of the conversation between the user and the bot.
	 */
	protected async inDebugSession(context: TurnContext): Promise<boolean> {
		let memory = await this.getMemory(context.activity.conversation.id);
		if (!memory.id) {
			try {
				const result = await BotDebugger.connectToEmulator(context);
				memory = {id: result};
				await this.updateMemory(context.activity.conversation.id, memory);
			} catch (e) {
			}
		}
		return !!memory.id;
	}

	/**
	 * Gets the ConversationReference from the debug session with the Emulator.
	 *
	 * @param context The TurnContext of the conversation between the user and the bot.
	 */
	protected async getEmulatorSession(context: TurnContext): Promise<ConversationReference> {
		const memory = await this.getMemory(context.activity.conversation.id);
		const {id} = memory;
		const conversationReference = TurnContext.getConversationReference(context.activity);
		// If this activity is not from an Emulator session,
		// we should have a conversation Id from the ConnectorAPI
		// used to start a debug session.
		if (context.activity.channelId !== 'emulator') {
			conversationReference.conversation.id = id;
		}
		conversationReference.channelId = 'emulator';
		conversationReference.serviceUrl = process.env.EMULATOR_URL;

		return conversationReference as ConversationReference;
	}

	/**
	 * Creates a TurnContext for the debug session between the bot and the Emulator;
	 *
	 * @param session The ConversationReference generated from a call to <code>getEmulatorSession</code>
	 */
	protected createEmulatorContext(session: ConversationReference): TurnContext {
		// Get emulators adapter
		const emulator = this.findAdapter('emulator');
		if (!emulator) {
			throw new Error(`BotDebugger: Cannot log debug activity to emulator. Adapter not found.`)
		}

		// Create request with session address
		const request = TurnContext.applyConversationReference({
			type: ActivityTypes.Event,
			name: 'debuggerSession'
		}, session);

		// Return context for session
		return new TurnContext(emulator, request);
	}

	/**
	 * Sends the specified activity to the debug session with the Emulator.
	 * A debug session must be established before calling this method.
	 *
	 * @param context The TurnContext of the debug session between the bot and the Emulator
	 * @param log An array of activity objects to send to the Emulator.
	 */
	protected async sendToEmulator(context: TurnContext, log: Partial<Activity>[]): Promise<void> {
		// Get emulator session for current conversation
		const session = await this.getEmulatorSession(context);

		// Create context object for debug session
		const emulatorContext = this.createEmulatorContext(session);

		// Dump log to emulator
		await emulatorContext.sendActivities(log);
	}

	/**
	 * @private
	 */
	private async updateMemory(conversationId, data) {
		const memory = await this.stateStorage.read([conversationId]);
		const oldItem = memory[conversationId] || {};
		const store = oldItem[key];
		const newData = {...store, ...data};
		memory[conversationId] = {...oldItem, [key]: newData};
		return this.stateStorage.write(memory);
	}

	/**
	 * @private
	 */
	private async getMemory(conversationId) {
		const memory = await this.stateStorage.read([conversationId]);
		return (memory[conversationId] || {[key]: {}})[key];
	}
}
