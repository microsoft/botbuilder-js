/**
 * @module botbuilder-ai
 *
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	Activity,
	CardAction,
	CardFactory,
	MediaCard,
	OAuthCard,
	ReceiptCard,
	ReceiptItem,
	SigninCard,
	ThumbnailCard,
} from 'botbuilder';
import {
	flatten,
	isBoolean,
	isDate,
	isEmpty,
	isInteger,
	isNil,
	isNumber,
	isString,
	replace,
} from 'lodash';
import * as request from 'request-promise-native';

//  ######################################### EXPORTED API #########################################

export type PrimitiveType = string | number | boolean | Date;

/**
 * Description of a language generation application used for initializing a LanguageGenerationResolver.
 */
export interface LanguageGenerationApplication {
	/* Language generation application id */
	applicationId: string;

	/* Language generation locale */
	applicationLocale: string;

	/** Language generation region */
	applicationRegion: string;

	/** Language generation version */
	applicationVersion: string;

	/* Congnetive services subscription key */
	subscriptionKey: string;
}

/**
 * Options for LanguageGenerationResolver.
 */
export interface LanguageGenerationOptions {
	resolverApiEndpoint?: string;
	tokenGenerationApiEndpoint?: string;
}

/**
 * Component used to extract template references from the activity object, resolve them using the language generation service
 * and inject them back in the activity.
 */
export class LanguageGenerationResolver {
	private lgApi: LGAPI;
	constructor(
		private application: LanguageGenerationApplication,
		options: LanguageGenerationOptions = {}
	) {
		this.validateApplicationInputs();
		this.lgApi = new LGAPI(application, options);
	}

	/**
	 * Extracts template references from the activity object, resolves them using the language generation service
	 * and injects them back in the activity
	 *
	 * @param activity botbuilder activity
	 * @param [entities] map object that contains slots accepted by the LG service
	 * @returns
	 */
	public async resolve(
		activity: Partial<Activity>,
		entities?: { [key: string]: PrimitiveType }
	): Promise<void> {
		if (isNil(activity)) {
			throw new Error("Activity can't be null or undefined");
		}

		await this.lgApi.authenticate();

		const slotsBuilder = new SlotsBuilder(activity, entities);
		const activityInjector = new ActivityInjector(activity);

		const [templateReferences, entitiesSlots] = slotsBuilder.build();

		const requestsPromises = templateReferences
			.map(templateReference =>
				new LGRequestBuilder()
					.setScenario(this.application.applicationId)
					.setLocale(this.application.applicationLocale)
					.setSlots(entitiesSlots)
					.setTemplateId(templateReference)
					.setVersion(this.application.applicationVersion)
					.build()
			)
			.map(this.lgApi.fetch);

		const responses = await Promise.all(requestsPromises);

		const templateResolutions = Utilities.transformLGResponsestoMap(responses);

		this.validateResponses(templateReferences, templateResolutions);

		activityInjector.injectTemplateReferences(templateResolutions);
	}

	private validateResponses(
		templateReferences: string[],
		templateResolutions: Map<string, string>
	): void {
		templateReferences.forEach(templateReference => {
			if (!templateResolutions.has(templateReference)) {
				throw new Error('Internal Error');
			}
		});
	}

	private validateApplicationInputs(): void {
		const makeErrorStr = (resourceName: string) => `${resourceName} can't be null or empty`;

		if (isEmpty(this.application.applicationId)) {
			throw new Error(makeErrorStr('applicationId'));
		}

		if (isEmpty(this.application.applicationLocale)) {
			throw new Error(makeErrorStr('applicationLocale'));
		}

		if (isEmpty(this.application.applicationRegion)) {
			throw new Error(makeErrorStr('applicationRegion'));
		}

		if (isEmpty(this.application.applicationVersion)) {
			throw new Error(makeErrorStr('applicationVersion'));
		}

		if (isEmpty(this.application.subscriptionKey)) {
			throw new Error(makeErrorStr('subscriptionKey'));
		}
	}
}

//  ######################################### INTERNAL API #########################################

//#region  Activity Inspectors
type IActivityInspector = (activity: Partial<Activity>) => string[];

const textInspector: IActivityInspector = (activity: Partial<Activity>): string[] => {
	const text = activity.text || '';

	return PatternRecognizer.extractPatterns(text);
};

const speakInspector: IActivityInspector = (activity: Partial<Activity>): string[] => {
	const text = activity.speak || '';

	return PatternRecognizer.extractPatterns(text);
};

const cardActionInspector = (cardAction: CardAction): string[] => {
	let res: string[] = [];

	if (cardAction.text) {
		res = res.concat(PatternRecognizer.extractPatterns(cardAction.text));
	}

	if (cardAction.displayText) {
		res = res.concat(PatternRecognizer.extractPatterns(cardAction.displayText));
	}

	if (cardAction.title) {
		res = res.concat(PatternRecognizer.extractPatterns(cardAction.title));
	}

	if (isString(cardAction.value)) {
		res = res.concat(PatternRecognizer.extractPatterns(cardAction.value));
	}

	return res;
};

const buttonsInspector = (buttons: CardAction[]): string[] => {
	return flatten(buttons.map(cardActionInspector));
};

const suggestedActionsInspector: IActivityInspector = (activity: Partial<Activity>): string[] => {
	if (activity.suggestedActions && activity.suggestedActions.actions) {
		return flatten(activity.suggestedActions.actions.map(cardActionInspector));
	}

	return [];
};

const oauthOrSigninCardInspector = (card: OAuthCard | SigninCard): string[] => {
	let res: string[] = [];

	if (card.text) {
		res = res.concat(PatternRecognizer.extractPatterns(card.text));
	}

	if (card.buttons) {
		res = res.concat(buttonsInspector(card.buttons));
	}

	return res;
};

const receiptItemInspector = (item: ReceiptItem): string[] => {
	let res: string[] = [];

	if (item.title) {
		res = res.concat(PatternRecognizer.extractPatterns(item.title));
	}

	if (item.subtitle) {
		res = res.concat(PatternRecognizer.extractPatterns(item.subtitle));
	}

	if (item.text) {
		res = res.concat(PatternRecognizer.extractPatterns(item.text));
	}

	if (item.tap) {
		res = res.concat(cardActionInspector(item.tap));
	}

	if (item.image && item.image.tap) {
		res = res.concat(cardActionInspector(item.image.tap));
	}

	return res;
};

const receiptCardInspector = (card: ReceiptCard): string[] => {
	let res: string[] = [];

	if (card.title) {
		res = res.concat(PatternRecognizer.extractPatterns(card.title));
	}

	if (card.facts) {
		const factsValues = flatten(
			card.facts.map(fact => PatternRecognizer.extractPatterns(fact.value))
		);

		res = res.concat(factsValues);
	}

	if (card.items) {
		const items = flatten(card.items.map(receiptItemInspector));
		res = res.concat(items);
	}

	if (card.tap) {
		res = res.concat(cardActionInspector(card.tap));
	}

	if (card.buttons) {
		res = res.concat(buttonsInspector(card.buttons));
	}

	return res;
};

const thumbnailCardInspector = (card: ThumbnailCard): string[] => {
	let res: string[] = [];

	if (card.text) {
		res = res.concat(PatternRecognizer.extractPatterns(card.text));
	}

	if (card.title) {
		res = res.concat(PatternRecognizer.extractPatterns(card.title));
	}

	if (card.subtitle) {
		res = res.concat(PatternRecognizer.extractPatterns(card.subtitle));
	}

	if (card.images) {
		const imageActionsText = flatten(
			card.images
				.filter(image => !isNil(image.tap))
				.map(image => cardActionInspector(image.tap))
		);

		res = res.concat(imageActionsText);
	}

	if (card.tap) {
		res = res.concat(cardActionInspector(card.tap));
	}

	if (card.buttons) {
		res = res.concat(buttonsInspector(card.buttons));
	}

	return res;
};

const mediaCardInspector = (card: MediaCard): string[] => {
	let res: string[] = [];

	if (card.text) {
		res = res.concat(PatternRecognizer.extractPatterns(card.text));
	}

	if (card.title) {
		res = res.concat(PatternRecognizer.extractPatterns(card.title));
	}

	if (card.subtitle) {
		res = res.concat(PatternRecognizer.extractPatterns(card.subtitle));
	}

	if (card.buttons) {
		res = res.concat(buttonsInspector(card.buttons));
	}

	return res;
};

const attachmentsInspector: IActivityInspector = (activity: Partial<Activity>): string[] =>
	!isNil(activity.attachments)
		? flatten(
				activity.attachments
					.filter(({ content }) => !isNil(content))
					.map(attachment => {
						switch (attachment.contentType) {
							case CardFactory.contentTypes.adaptiveCard: {
								//TODO
								return [];
							}
							case CardFactory.contentTypes.animationCard: {
								return mediaCardInspector(attachment.content);
							}
							case CardFactory.contentTypes.audioCard: {
								return mediaCardInspector(attachment.content);
							}
							case CardFactory.contentTypes.heroCard: {
								return thumbnailCardInspector(attachment.content);
							}
							case CardFactory.contentTypes.receiptCard: {
								return receiptCardInspector(attachment.content);
							}
							case CardFactory.contentTypes.oauthCard: {
								return oauthOrSigninCardInspector(attachment.content);
							}
							case CardFactory.contentTypes.signinCard: {
								return oauthOrSigninCardInspector(attachment.content);
							}
							case CardFactory.contentTypes.thumbnailCard: {
								return thumbnailCardInspector(attachment.content);
							}
							case CardFactory.contentTypes.videoCard: {
								return mediaCardInspector(attachment.content);
							}
						}
					})
		  )
		: [];

//#endregion

/**
 * @private
 */
export class ActivityInspector {
	private readonly inspectors = [
		textInspector,
		speakInspector,
		suggestedActionsInspector,
		attachmentsInspector,
	];

	constructor(private readonly activity: Partial<Activity>) {}

	/**
	 * Utilizes activity inspectors to extract the template references
	 *
	 * @returns all template references found in the activity
	 */
	public extractTemplateReferences(): string[] {
		const stateNames = this.inspectors
			.map(inspector => inspector(this.activity))
			.reduce((acc, current) => [...acc, ...current], []);

		return [...new Set(stateNames).values()];
	}
}

//#region Activity Injectors
type IActivityInjector = (
	activity: Partial<Activity>,
	templateResolutions: Map<string, string>
) => void;

const textInjector: IActivityInjector = (
	activity: Partial<Activity>,
	templateResolutions: Map<string, string>
): void => {
	const text = activity.text;
	if (text) {
		activity.text = PatternRecognizer.replacePatterns(text, templateResolutions);
	}
};

const speakInjector: IActivityInjector = (
	activity: Partial<Activity>,
	templateResolutions: Map<string, string>
): void => {
	const speak = activity.speak;
	if (speak) {
		activity.speak = PatternRecognizer.replacePatterns(speak, templateResolutions);
	}
};

const suggestedActionsInjector: IActivityInjector = (
	activity: Partial<Activity>,
	templateResolutions: Map<string, string>
): void => {
	if (activity.suggestedActions && activity.suggestedActions.actions) {
		activity.suggestedActions.actions.forEach(action =>
			cardActionInjector(action, templateResolutions)
		);
	}
};

const cardActionInjector = (action: CardAction, templateResolutions: Map<string, string>): void => {
	if (action.text) {
		action.text = PatternRecognizer.replacePatterns(action.text, templateResolutions);
	}

	if (action.displayText) {
		action.displayText = PatternRecognizer.replacePatterns(
			action.displayText,
			templateResolutions
		);
	}

	if (action.title) {
		action.title = PatternRecognizer.replacePatterns(action.title, templateResolutions);
	}

	if (isString(action.value)) {
		action.value = PatternRecognizer.replacePatterns(action.value, templateResolutions);
	}
};

const mediaCardInjector = (card: MediaCard, templateResolutions: Map<string, string>): void => {
	if (card.text) {
		card.text = PatternRecognizer.replacePatterns(card.text, templateResolutions);
	}

	if (card.title) {
		card.title = PatternRecognizer.replacePatterns(card.title, templateResolutions);
	}

	if (card.subtitle) {
		card.subtitle = PatternRecognizer.replacePatterns(card.subtitle, templateResolutions);
	}

	if (card.buttons) {
		card.buttons.forEach(action => cardActionInjector(action, templateResolutions));
	}
};

const oauthOrSigninCardInjector = (
	card: OAuthCard | SigninCard,
	templateResolutions: Map<string, string>
): void => {
	if (card.text) {
		card.text = PatternRecognizer.replacePatterns(card.text, templateResolutions);
	}

	if (card.buttons) {
		card.buttons.forEach(action => cardActionInjector(action, templateResolutions));
	}
};

const receiptItemInjector = (item: ReceiptItem, templateResolutions: Map<string, string>): void => {
	if (item.title) {
		item.title = PatternRecognizer.replacePatterns(item.title, templateResolutions);
	}
	if (item.subtitle) {
		item.subtitle = PatternRecognizer.replacePatterns(item.subtitle, templateResolutions);
	}

	if (item.text) {
		item.text = PatternRecognizer.replacePatterns(item.text, templateResolutions);
	}

	if (item.tap) {
		cardActionInjector(item.tap, templateResolutions);
	}

	if (item.image && item.image.tap) {
		cardActionInjector(item.image.tap, templateResolutions);
	}
};

const receiptCardInjector = (card: ReceiptCard, templateResolutions: Map<string, string>): void => {
	if (card.title) {
		card.title = PatternRecognizer.replacePatterns(card.title, templateResolutions);
	}

	if (card.facts) {
		card.facts.forEach(fact => {
			fact.value = PatternRecognizer.replacePatterns(fact.value, templateResolutions);
		});
	}

	if (card.items) {
		card.items.forEach(item => receiptItemInjector(item, templateResolutions));
	}

	if (card.tap) {
		cardActionInjector(card.tap, templateResolutions);
	}

	if (card.buttons) {
		card.buttons.forEach(action => cardActionInjector(action, templateResolutions));
	}
};

const thumbnailCardInjector = (
	card: ThumbnailCard,
	templateResolutions: Map<string, string>
): void => {
	if (card.title) {
		card.title = PatternRecognizer.replacePatterns(card.title, templateResolutions);
	}

	if (card.text) {
		card.text = PatternRecognizer.replacePatterns(card.text, templateResolutions);
	}

	if (card.subtitle) {
		card.subtitle = PatternRecognizer.replacePatterns(card.subtitle, templateResolutions);
	}

	if (card.images) {
		card.images
			.filter(image => !isNil(image.tap))
			.forEach(image => cardActionInjector(image.tap, templateResolutions));
	}

	if (card.tap) {
		cardActionInjector(card.tap, templateResolutions);
	}

	if (card.buttons) {
		card.buttons.forEach(action => cardActionInjector(action, templateResolutions));
	}
};

const attachmentsInjector = (
	activity: Partial<Activity>,
	templateResolutions: Map<string, string>
): void => {
	if (activity.attachments) {
		activity.attachments
			.filter(({ content }) => !isNil(content))
			.forEach(attachment => {
				switch (attachment.contentType) {
					case CardFactory.contentTypes.adaptiveCard: {
						//TODO
						break;
					}
					case CardFactory.contentTypes.animationCard: {
						mediaCardInjector(attachment.content, templateResolutions);
						break;
					}
					case CardFactory.contentTypes.audioCard: {
						mediaCardInjector(attachment.content, templateResolutions);
						break;
					}
					case CardFactory.contentTypes.heroCard: {
						thumbnailCardInjector(attachment.content, templateResolutions);
						break;
					}
					case CardFactory.contentTypes.receiptCard: {
						receiptCardInjector(attachment.content, templateResolutions);
						break;
					}
					case CardFactory.contentTypes.oauthCard: {
						oauthOrSigninCardInjector(attachment.content, templateResolutions);
						break;
					}
					case CardFactory.contentTypes.signinCard: {
						oauthOrSigninCardInjector(attachment.content, templateResolutions);
						break;
					}
					case CardFactory.contentTypes.thumbnailCard: {
						thumbnailCardInjector(attachment.content, templateResolutions);
						break;
					}
					case CardFactory.contentTypes.videoCard: {
						mediaCardInjector(attachment.content, templateResolutions);
						break;
					}
				}
			});
	}
};
//#endregion

/**
 * @private
 */
export class ActivityInjector {
	private readonly injectors: IActivityInjector[] = [
		textInjector,
		speakInjector,
		suggestedActionsInjector,
		attachmentsInjector,
	];
	constructor(private readonly activity: Partial<Activity>) {}

	/**
	 * Searches for template references inside the activity and replaces them with the actual text coming from the LG backend
	 *
	 * @param templateReferences takes in template references map and injects their resolution in the activity
	 */
	public injectTemplateReferences(templateReferences: Map<string, string>): void {
		this.injectors.forEach(injector => injector(this.activity, templateReferences));
	}
}

//  ----------------------------------------- Utilities -----------------------------------------

/**
 * @private
 */
export class PatternRecognizer {
	public static readonly regex = /[^[\]]+(?=])/g;

	public static extractPatterns(text: string): string[] {
		const templateReferences: string[] = [];
		let regexExecArr: RegExpExecArray;

		while ((regexExecArr = this.regex.exec(text)) !== null) {
			if (regexExecArr.index === this.regex.lastIndex) {
				this.regex.lastIndex++;
			}

			regexExecArr.forEach(match => templateReferences.push(match));
		}

		return templateReferences.filter(text => !text.includes('\\'));
	}

	public static replacePatterns(
		originalText: string,
		templateResolutions: Map<string, string>
	): string {
		let modifiedText = originalText;
		templateResolutions.forEach((stateResolution, templateReference) => {
			modifiedText = replace(modifiedText, `[${templateReference}]`, stateResolution);
		});

		return modifiedText;
	}
}

/**
 * @private
 */
export class SlotsBuilder {
	constructor(
		private readonly activity: Partial<Activity>,
		private readonly entities?: { [key: string]: PrimitiveType }
	) {}

	/**
	 * Uses the given activity and entities to construct a tuple of template references and slots
	 *
	 * @returns A tuple of template references and entity slots
	 * @memberof SlotsBuilder
	 */
	public build(): [string[], Slot[]] {
		const activityInspector = new ActivityInspector(this.activity);

		const templateReferences = activityInspector.extractTemplateReferences();

		const entitiesSlots = !isNil(this.entities)
			? this.convertEntitiesToSlots(this.entities)
			: [];

		return [templateReferences, entitiesSlots];
	}

	private convertEntitiesToSlots(entities: { [key: string]: PrimitiveType }): Slot[] {
		const slots: Slot[] = [];
		Object.keys(entities).forEach(key => slots.push({ key, value: entities[key] }));

		return slots;
	}
}

/**
 * @private
 */
export interface Slot {
	key: string;
	value: PrimitiveType;
}

//  ----------------------------------------- LG API -----------------------------------------
/**
 * @private
 */
export class Utilities {
	public static convertLGValueToString(value: LGValue): string {
		switch (value.ValueType) {
			case 0:
				return value.StringValues[0];
			case 1:
				return value.IntValues[0].toString();
			case 2:
				return value.FloatValues[0].toString();
			case 3:
				return value.BooleanValues[0].toString();
			case 4:
				return value.DateTimeValues[0].toString();
			default:
				return null;
		}
	}

	public static convertSlotToLGValue(slot: Slot): LGValue {
		const value = slot.value;

		if (isString(value)) {
			return {
				StringValues: <string[]>[value],
				ValueType: 0,
			};
		} else if (isNumber(value)) {
			if (isInteger(value)) {
				return {
					IntValues: <number[]>[value],
					ValueType: 1,
				};
			} else {
				return {
					FloatValues: <number[]>[value],
					ValueType: 2,
				};
			}
		} else if (isBoolean(value)) {
			return {
				BooleanValues: <boolean[]>[value],
				ValueType: 3,
			};
		} else if (isDate(value)) {
			return {
				DateTimeValues: [(<any>value).toISOString()],
				ValueType: 4,
			};
		}
	}

	public static extractTemplateReferenceAndResolution(res: LGResponse): [string, string] {
		if (isNil(res.Outputs) || isNil(res.Outputs.DisplayText)) {
			return [null, null];
		}

		const templateReference = res.templateId;
		const templateResolution = res.Outputs.DisplayText;

		const templateResolutionStr = Utilities.convertLGValueToString(templateResolution);

		return [templateReference, templateResolutionStr];
	}

	public static transformLGResponsestoMap(responses: LGResponse[]): Map<string, string> {
		const templateResolutions = new Map<string, string>();

		responses
			.map(Utilities.extractTemplateReferenceAndResolution)
			.filter(
				([templateReference, templateResolution]) =>
					!isNil(templateReference) && !isNil(templateResolution)
			)
			.forEach(([templateReference, templateResolution]) =>
				templateResolutions.set(templateReference, templateResolution)
			);

		return templateResolutions;
	}
}

/**
 * @private
 */
export interface LGValue {
	ValueType: 0 | 1 | 2 | 3 | 4;
	StringValues?: string[]; // valueType -> 0
	IntValues?: number[]; // valueType -> 1
	// @TODO
	FloatValues?: number[]; // valueType -> 2
	BooleanValues?: boolean[]; // valueType -> 3
	DateTimeValues?: string[]; // valueType -> 4
}

/**
 * @private
 */
export interface LGRequest {
	scenario: string;
	locale: string;
	slots: { [key: string]: LGValue };
	templateId: string;
	version: string;
}

/**
 * @private
 */
class LGRequestBuilder {
	private locale: string;
	private scenario: string;
	private slots: Slot[];
	private templateId: string;
	private version: string;

	public setVersion(version: string){
		this.version = version;

		return this;

	}

	public setSlots(slots: Slot[]): LGRequestBuilder {
		this.slots = slots;

		return this;
	}

	public setLocale(locale: string): LGRequestBuilder {
		this.locale = locale;

		return this;
	}

	public setTemplateId(templateId: string): LGRequestBuilder {
		this.templateId = templateId;

		return this;
	}

	public setScenario(scenario: string): LGRequestBuilder {
		this.scenario = scenario;

		return this;
	}

	public build(): LGRequest {
		const slotsJSON: { [key: string]: LGValue } = this.slots.reduce((acc, slot) => {
			const lgValue = Utilities.convertSlotToLGValue(slot);
			acc[slot.key] = lgValue;
			return acc;
		}, {});

		return {
			locale: this.locale,
			scenario: this.scenario,
			slots: slotsJSON,
			templateId: this.templateId,
			version: this.version
		};
	}
}

/**
 * @private
 */
export interface LGResponse {
	Outputs: { DisplayText: LGValue };
	templateId: string;
}

/**
 * @private
 */
export class LGAPI {
	public static readonly constructDefaultTokenGenerationApi = (region: string) =>
		`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;

	public static readonly constructDefaultResolverApi = (region: string) =>
		`https://${region}.cts.speech.microsoft.com/v1/lg`;

	private token: string = null;

	constructor(
		private readonly application: LanguageGenerationApplication,
		private readonly options: LanguageGenerationOptions
	) {
		application.applicationRegion = application.applicationRegion;
	}

	public async authenticate(): Promise<void> {
		const url =
			this.options.tokenGenerationApiEndpoint ||
			LGAPI.constructDefaultTokenGenerationApi(this.application.applicationRegion);

		try {
			this.token = await request({
				url,
				method: 'POST',
				headers: {
					'OCP-APIM-SUBSCRIPTION-KEY': this.application.subscriptionKey,
				},
				json: true,
			});
		} catch (e) {
			throw new Error(e.error.message);
		}
	}

	public fetch = async (lgRequest: LGRequest): Promise<LGResponse> => {
		const url =
			this.options.resolverApiEndpoint ||
			LGAPI.constructDefaultResolverApi(this.application.applicationRegion);
		try {
			const response = await request({
				url,
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(lgRequest),
			});

			return { ...JSON.parse(response), templateId: lgRequest.templateId };
		} catch (e) {
			switch (e.statusCode) {
				case 401:
					throw new Error('Cognitive Authentication Failed');
				default:
					throw new Error('Internal Error');
			}
		}
	};
}