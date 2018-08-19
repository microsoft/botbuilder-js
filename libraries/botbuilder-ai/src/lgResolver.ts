/**
 * @module botbuilder-ai
 *
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity } from 'botbuilder';

/**
 * ## Notes:
 *  1) This code just demonstrates how this module will be built, changes to the internals might occur, however, the public classes will remain as is.   
 *  2) This module still lacks proper comments and doesn't fully adhere to TSLint rules; this will change in the final PR. 
 * 
 * ## Questions:
 *  1) Is there an API that can request multiple slots in the same HTTP call?
 */

//  ######################################### EXPORTED API #########################################

export type PrimitiveArray = string[] | number[] | boolean[] | Date[];

export class LGEndpoint {
  private _endpointKey: string;
  private _lgAppId: string;
  private _endpointUri: string;

  constructor(endpointKey: string, lgAppId: string, endpointUri: string) {
    this.validateInputs(endpointKey, lgAppId, endpointUri);
    this._endpointKey = endpointKey;
    this._lgAppId = lgAppId;
    this._endpointUri = endpointUri;
  }

  private validateInputs(
    endpointKey: string,
    lgAppId: string,
    endpointUri: string,
  ): void {
    throw new Error('Method not implemented.');
  }

  public get endpointKey(): string {
    return this._endpointKey;
  }

  public get lgAppId(): string {
    return this._lgAppId;
  }

  public get endpointUri(): string {
    return this._endpointUri;
  }
}

export class LGOptions {}

export class LGResolver {
  private lgApi: LGAPI;
  constructor(lgEndpoint: LGEndpoint, lgOptions: LGOptions) {
    this.lgApi = new LGAPI(lgEndpoint, lgOptions);
  }

  public async resolve(
    activity: Activity,
    entities: Map<string, PrimitiveArray>,
  ): Promise<void> {
    const slots = SlotBuilder.extractSlots(activity, entities);

    const requestPromises = slots
      .map(slot => new LGRequest(slot))
      .map(this.lgApi.fetch);

    const responses = await Promise.all(requestPromises);

    ActivityModifier.injectResponses(activity, responses);
  }
}

//  ######################################### INTERNAL API #########################################

//  ----------------------------------------- Activity Inspectors -----------------------------------------
type IActivityInspector = (activity: Activity) => string[];

const textInspector: IActivityInspector = (activity: Activity): string[] => {
  const text = activity.text;
  return PatternRecognizer.extractPatterns(text);
};

const speakInspector: IActivityInspector = (activity: Activity): string[] => {
  const text = activity.speak;
  return PatternRecognizer.extractPatterns(text);
};

//  ----------------------------------------- Helpers -----------------------------------------
class SlotBuilder {
  // Searches for template references inside the activity and constructs slots
  public static extractSlots(
    activity: Activity,
    entities: Map<string, PrimitiveArray>,
  ): Slot[] {
    // Utilize activity inspectors to extract the template references
    const inspectors: IActivityInspector[] = [textInspector, speakInspector];
    throw new Error('Not implemented');
  }
}

class PatternRecognizer {
  // Recognizes and returns template references
  public static extractPatterns(text: string): string[] {
    throw new Error('Not Implemented');
  }
}

class ActivityModifier {
  // Searches for template references inside the activity and replaces them with the actual text coming from the LG backend
  public static injectResponses(
    activity: Activity,
    responses: LGResponse[],
  ): void {
    throw new Error('Not implemented');
  }
}

// Not implemented
class Slot {}

//  ----------------------------------------- LG API -----------------------------------------
// Not implemented
class LGRequest {
  constructor(private slot: Slot) {}
}

// Not implemented
class LGResponse {}

// The class that talks to the LG backend
class LGAPI {
  constructor(private lgEndpoint: LGEndpoint, private lgOptions: LGOptions) {}

  public async fetch(request: LGRequest): Promise<LGResponse> {
    return null;
  }
}
