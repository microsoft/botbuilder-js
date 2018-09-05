/**
 * @module botbuilder-ai
 *
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity } from 'botbuilder';
import {
  isEmpty,
  isNil,
  replace,
  isBoolean,
  isNumber,
  isDate,
  isInteger,
  isString,
} from 'lodash';
import * as request from 'request-promise-native';

//  ######################################### EXPORTED API #########################################

export type PrimitiveType = string | number | boolean | Date;

export interface LanguageGenerationApplication {
  applicationId: string;

  /** (Optional) Azure region */
  azureRegion?: string;

  endpointKey: string;
}

export interface LanguageGenerationOptions {}

export class LanguageGenerationResolver {
  private lgApi: LGAPI;
  constructor(
    private application: LanguageGenerationApplication,
    private options: LanguageGenerationOptions,
  ) {
    this.validateApplicationInputs();
    this.lgApi = new LGAPI(application, options);
  }

  public async resolve(
    activity: Activity,
    entities?: Map<string, PrimitiveType>,
  ): Promise<void> {
    if (isNil(activity)) {
      throw new Error("Activity can't be null or undefined");
    }

    const slotsBuilder = new SlotsBuilder(activity, entities);
    const activityInjector = new ActivityInjector(activity);

    const [templateReferencesSlots, entitiesSlots] = slotsBuilder.build();

    const requestsPromises = templateReferencesSlots
      .map(templateReferenceSlot =>
        new LGRequestBuilder()
          .setScenario(this.application.applicationId)
          .setLocale(activity.locale)
          .setSlots([templateReferenceSlot, ...entitiesSlots])
          .build(),
      )
      .map(this.lgApi.fetch);

    const responses = await Promise.all(requestsPromises);

    const templateResolutions = Utilities.transformLGResponsestoMap(responses);

    this.validateResponses(templateReferencesSlots, templateResolutions);

    activityInjector.injectTemplateReferences(templateResolutions);
  }

  private validateResponses(
    templateReferencesSlots: Slot[],
    templateResolutions: Map<string, string>,
  ): void {
    templateReferencesSlots.forEach(slot => {
      if (!templateResolutions.has(slot.value.toString())) {
        //@TODO
        throw new Error();
      }
    });
  }

  private validateApplicationInputs(): void {
    if (isEmpty(this.application.applicationId)) {
      //@TODO
      throw new Error(``);
    }

    if (isEmpty(this.application.endpointKey)) {
      //@TODO
      throw new Error(``);
    }
  }
}

//  ######################################### INTERNAL API #########################################

//  ----------------------------------------- Activity Inspectors -----------------------------------------
type IActivityInspector = (activity: Activity) => string[];

const textInspector: IActivityInspector = (activity: Activity): string[] => {
  const text = activity.text || '';
  return PatternRecognizer.extractPatterns(text);
};

const speakInspector: IActivityInspector = (activity: Activity): string[] => {
  const text = activity.speak || '';
  return PatternRecognizer.extractPatterns(text);
};

const suggestedActionsInspector: IActivityInspector = (
  activity: Activity,
): string[] => {
  if (activity.suggestedActions && activity.suggestedActions.actions) {
    return activity.suggestedActions.actions.reduce((acc, action) => {
      if (action.text) {
        acc = [
          ...acc,
          ...acc.concat(PatternRecognizer.extractPatterns(action.text)),
        ];
      }

      if (action.displayText) {
        acc = [
          ...acc,
          ...acc.concat(PatternRecognizer.extractPatterns(action.displayText)),
        ];
      }

      return acc;
    }, []);
  }

  return [];
};

/**
 * @private
 */
export class ActivityInspector {
  private readonly inspectors = [
    textInspector,
    speakInspector,
    suggestedActionsInspector,
  ];

  constructor(private readonly activity: Activity) {}

  // Searches for template references inside the activity and constructs slots
  public extractTemplateReferencesSlots(): Slot[] {
    // Utilize activity inspectors to extract the template references
    const stateNames = this.inspectors
      .map(inspector => inspector(this.activity))
      .reduce((acc, current) => [...acc, ...current], []);

    const uniqueStateNames = new Set(stateNames);
    const slots: Slot[] = [];

    uniqueStateNames.forEach(stateName => {
      slots.push(new Slot(Slot.STATE_NAME_KEY, stateName));
    });

    return slots;
  }
}

//  ----------------------------------------- Activity Injectors -----------------------------------------
type IActivityInjector = (
  activity: Activity,
  templateResolutions: Map<string, string>,
) => void;

const textInjector: IActivityInjector = (
  activity: Activity,
  templateResolutions: Map<string, string>,
): void => {
  const text = activity.text;
  if (text) {
    activity.text = PatternRecognizer.replacePatterns(
      text,
      templateResolutions,
    );
  }
};

const speakInjector: IActivityInjector = (
  activity: Activity,
  templateResolutions: Map<string, string>,
): void => {
  const speak = activity.speak;
  if (speak) {
    activity.speak = PatternRecognizer.replacePatterns(
      speak,
      templateResolutions,
    );
  }
};

const suggestedActionsInjector: IActivityInjector = (
  activity: Activity,
  templateResolutions: Map<string, string>,
): void => {
  if (activity.suggestedActions && activity.suggestedActions.actions) {
    activity.suggestedActions.actions.forEach(action => {
      if (action.text) {
        action.text = PatternRecognizer.replacePatterns(
          action.text,
          templateResolutions,
        );
      }

      if (action.displayText) {
        action.displayText = PatternRecognizer.replacePatterns(
          action.displayText,
          templateResolutions,
        );
      }
    });
  }
};

/**
 * @private
 */
export class ActivityInjector {
  private readonly injectors: IActivityInjector[] = [
    textInjector,
    speakInjector,
    suggestedActionsInjector,
  ];
  constructor(private readonly activity: Activity) {}
  // Searches for template references inside the activity and replaces them with the actual text coming from the LG backend
  public injectTemplateReferences(
    templateReferences: Map<string, string>,
  ): void {
    this.injectors.forEach(injector =>
      injector(this.activity, templateReferences),
    );
  }
}

//  ----------------------------------------- Utilities -----------------------------------------

/**
 * @private
 */
export class PatternRecognizer {
  public static readonly regex = /[^[\]]+(?=])/g;

  public static extractPatterns(text: string): string[] {
    const templateReferences = [];
    let regexExecArr: RegExpExecArray;

    while ((regexExecArr = this.regex.exec(text)) !== null) {
      if (regexExecArr.index === this.regex.lastIndex) {
        this.regex.lastIndex++;
      }

      regexExecArr.forEach(match => templateReferences.push(match));
    }

    return templateReferences;
  }

  public static replacePatterns(
    originalText: string,
    templateResolutions: Map<string, string>,
  ): string {
    let modifiedText = originalText;
    templateResolutions.forEach((stateResolution, templateReference) => {
      modifiedText = replace(
        modifiedText,
        PatternRecognizer.constructTemplateReference(templateReference),
        stateResolution,
      );
    });

    return modifiedText;
  }

  private static constructTemplateReference = (text: string) => `[${text}]`;
}

/**
 * @private
 */
export class SlotsBuilder {
  constructor(
    private readonly activity: Activity,
    private readonly entities?: Map<string, PrimitiveType>,
  ) {}

  public build(): [Slot[], Slot[]] {
    const activityInspector = new ActivityInspector(this.activity);

    const templateReferencesSlots = activityInspector.extractTemplateReferencesSlots();

    const entitiesSlots = !isNil(this.entities)
      ? this.convertEntitiesToSlots(this.entities)
      : [];

    return [templateReferencesSlots, entitiesSlots];
  }

  private convertEntitiesToSlots(entities: Map<string, PrimitiveType>): Slot[] {
    const slots: Slot[] = [];
    entities.forEach((value, key) => slots.push(new Slot(key, value)));

    return slots;
  }
}

/**
 * @private
 */
export class Slot {
  public static readonly STATE_NAME_KEY = 'GetStateName';
  constructor(public readonly key: string, public value: PrimitiveType) {}
}

//  ----------------------------------------- LG API -----------------------------------------
/**
 * @private
 */
export class Utilities {
  public static convertLGValueToString(value: LGValue): string {
    switch (value.valueType) {
      case 0:
        return value.stringValues[0];
      // @TODO The return type should be strings only
      case 1:
        return value.intValues[0].toString();
      case 2:
        return value.floatValues[0].toString();
      case 3:
        return value.booleanValues[0].toString();
      case 4:
        return value.dateTimeValues[0].toString();
      default:
        //@TODO
        throw new Error('Internal Error');
    }
  }

  public static convertSlotToLGValue(slot: Slot): LGValue {
    const value = slot.value;

    if (isString(value)) {
      return {
        stringValues: [value],
        valueType: 0,
      };
    } else if (isNumber(value)) {
      if (isInteger(value)) {
        return {
          intValues: [value],
          valueType: 1,
        };
      } else {
        return {
          floatValues: [value],
          valueType: 2,
        };
      }
    } else if (isBoolean(value)) {
      return {
        booleanValues: [value],
        valueType: 3,
      };
    } else if (isDate(value)) {
      return {
        dateTimeValues: [value.toISOString()],
        valueType: 4,
      };
    }
  }

  public static extractTemplateReferenceAndResolution(
    res: LGResponse,
  ): [string, string] {
    if (isNil(res.outputs) || isNil(Object.keys(res.outputs)[0])) {
      return [null, null];
    }

    const templateReference = Object.keys(res.outputs)[0];
    const templateResolution = res.outputs[templateReference];

    const templateResolutionStr = Utilities.convertLGValueToString(
      templateResolution,
    );

    return [templateReference, templateResolutionStr];
  }

  public static transformLGResponsestoMap(
    responses: LGResponse[],
  ): Map<string, string> {
    const templateResolutions = new Map<string, string>();

    responses
      .map(Utilities.extractTemplateReferenceAndResolution)
      .filter(
        ([templateReference, templateResolution]) =>
          !isNil(templateReference) && !isNil(templateResolution),
      )
      .forEach(([templateReference, templateResolution]) =>
        templateResolutions.set(templateReference, templateResolution),
      );

    return templateResolutions;
  }
}

/**
 * @private
 */
export interface LGValue {
  valueType: 0 | 1 | 2 | 3 | 4;
  stringValues?: string[]; // valueType -> 0
  intValues?: number[]; // valueType -> 1
  // @TODO
  floatValues?: number[]; // valueType -> 2
  booleanValues?: boolean[]; // valueType -> 3
  dateTimeValues?: string[]; // valueType -> 4
}

/**
 * @private
 */
export interface LGRequest {
  scenario: string;
  locale: string;
  slots: { [key: string]: LGValue };
}

class LGRequestBuilder {
  private locale: string;
  private scenario: string;
  private slots: Slot[];

  public setSlots(slots: Slot[]): LGRequestBuilder {
    this.slots = slots;

    return this;
  }

  public setLocale(locale: string): LGRequestBuilder {
    this.locale = locale;

    return this;
  }

  public setScenario(scenario: string): LGRequestBuilder {
    this.scenario = scenario;

    return this;
  }

  public build(): LGRequest {
    const slotsJSON: { [key: string]: LGValue } = this.slots.reduce(
      (acc, slot) => {
        const lgValue = Utilities.convertSlotToLGValue(slot);
        acc[slot.key] = lgValue;
        return acc;
      },
      {},
    );

    return {
      locale: this.locale,
      scenario: this.scenario,
      slots: slotsJSON,
    };
  }
}

/**
 * @private
 */
export interface LGResponse {
  outputs: { [key: string]: LGValue };
}

/**
 * @private
 */
export class LGAPI {
  public static readonly BASE_URL =
    'https://lg-cris-dev.westus2.cloudapp.azure.com/';
  public static readonly RESOURCE_URL = 'v1/lg';
  constructor(
    private readonly application: LanguageGenerationApplication,
    private readonly options: LanguageGenerationOptions,
  ) {}

  public fetch = async (lgRequest: LGRequest): Promise<LGResponse> => {
    try {
      return await request({
        url: LGAPI.BASE_URL + LGAPI.RESOURCE_URL,
        method: 'POST',
        //@todo
        headers: { Authorization: this.application.endpointKey },
        body: lgRequest,
        json: true,
      });
    } catch (e) {
      switch (e.statusCode) {
        case 401:
        case 501:
          throw new Error(e.error);
        default:
          //@TODO
          throw new Error('Internal Error');
      }
    }
  };
}
