/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import buffer from 'bitwise/buffer';
import * as fs from 'fs';
import * as murmurhash from 'murmurhash-js';
import * as path from 'path';
import {
    DynamicList,
    ExternalEntity,
    ListElement,
    LuisAdaptiveRecognizer,
    LuisRecognizerOptionsV3,
} from 'botbuilder-ai';
import { DialogContext, Recognizer } from 'botbuilder-dialogs';
import { Activity, RecognizerResult } from 'botbuilder-core';
import {
    HttpRequestMessage,
    MockHttpRequestMiddleware,
    MockHttpRequestMiddlewareKey,
} from './mockHttpRequestMiddleware';
import { HttpResponseMessage } from '../httpRequestMocks/httpResponseMock';

/**
 * Wrap murmurhash v3.
 *
 * @param {string} source Source string to compute hash.
 * @returns {number} Computed hash result.
 */
const stableHash = (source: string): number => murmurhash.murmur3(source);

/**
 * Compute result of x XOR y.
 *
 * @param {number} x First parameter.
 * @param {number} y Second parameter.
 * @returns {number} Computed XOR result.
 */
function xor(x: number, y: number): number {
    const bufferX = new ArrayBuffer(4);
    new DataView(bufferX).setUint32(0, x);
    const bufferY = new ArrayBuffer(4);
    new DataView(bufferY).setUint32(0, y);
    const result = buffer.xor(Buffer.from(bufferX), Buffer.from(bufferY));
    return parseInt(result.toString('hex'), 16);
}

/**
 * Test class for creating cached LUIS responses for testing.
 */
export class MockLuisRecognizer extends Recognizer {
    private _responseDir: string;
    private _recognizer: LuisAdaptiveRecognizer;

    /**
     * Initializes a new instance of the MockLuisRecognizer class.
     *
     * @param {LuisAdaptiveRecognizer} recognizer LUIS recognizer definition.
     * @param {string} resourceDir Where the settings file generated by lubuild is found.
     * @param {string} name Name of the LUIS model
     */
    public constructor(recognizer: LuisAdaptiveRecognizer, resourceDir: string, name: string) {
        super();
        this._recognizer = recognizer;
        this._responseDir = path.join(resourceDir, 'cachedResponses', name);
        if (!fs.existsSync(this._responseDir)) {
            fs.mkdirSync(this._responseDir);
        }
    }

    public async recognize(
        dialogContext: DialogContext,
        activity: Activity,
        telemetryProperties?: Record<string, string>,
        telemetryMetrics?: Record<string, number>
    ): Promise<RecognizerResult> {
        const options = this._recognizer.recognizerOptions(dialogContext);
        options.includeAPIResults = true;
        const middleware: MockHttpRequestMiddleware = dialogContext.context.turnState.get(MockHttpRequestMiddlewareKey);
        middleware?.setFallback((request: HttpRequestMessage) => this._fallback(request, activity.text, options));
        const result = await this._recognizer.recognize(dialogContext, activity, telemetryProperties, telemetryMetrics);
        middleware?.setFallback(undefined);
        return result;
    }

    // Computes response json file path from utterance and options.
    // The utterance and all the option properties will be hashed with murmurhash v3 and XORed to compute a unique file name.
    // Check out: https://github.com/microsoft/botbuilder-dotnet/blob/main/libraries/Microsoft.Bot.Builder.Dialogs.Adaptive.Testing/Mocks/MockLuisRecognizer.cs
    private _responsePath(utterance: string, options: LuisRecognizerOptionsV3): string {
        let hash: number = stableHash(utterance);

        if (options.externalEntityRecognizer) {
            hash = xor(hash, stableHash('external'));
        }

        if (options.includeAPIResults) {
            hash = xor(hash, stableHash('api'));
        }

        if (options.logPersonalInformation) {
            hash = xor(hash, stableHash('personal'));
        }

        if (options.dynamicLists) {
            options.dynamicLists.forEach((dynamicList: DynamicList) => {
                hash = xor(hash, stableHash(dynamicList.listEntityName));
                dynamicList.requestLists?.forEach((choices: ListElement) => {
                    hash = xor(hash, stableHash(choices.canonicalForm));
                    choices.synonyms?.forEach((synonym) => {
                        hash = xor(hash, stableHash(synonym));
                    });
                });
            });
        }

        if (options.externalEntities) {
            options.externalEntities.forEach((external: ExternalEntity) => {
                hash = xor(hash, stableHash(external.entityName));
                hash = xor(hash, stableHash(`${external.startIndex}`));
                hash = xor(hash, stableHash(`${external.entityLength}`));
            });
        }

        if (options.includeAllIntents) {
            hash = xor(hash, stableHash('all'));
        }

        if (options.includeInstanceData) {
            hash = xor(hash, stableHash('instance'));
        }

        if (options.log ?? false) {
            hash = xor(hash, stableHash('log'));
        }

        if (options.preferExternalEntities) {
            hash = xor(hash, stableHash('prefer'));
        }

        if (options.slot) {
            hash = xor(hash, stableHash(options.slot));
        }

        if (options.version) {
            hash = xor(hash, stableHash(options.version));
        }

        return path.join(this._responseDir, `${hash}.json`);
    }

    private async _fallback(
        _request: HttpRequestMessage,
        utterance: string,
        options: LuisRecognizerOptionsV3
    ): Promise<HttpResponseMessage> {
        const responsePath: string = this._responsePath(utterance, options);
        if (fs.existsSync(responsePath)) {
            const luisResult = fs.readFileSync(responsePath, 'utf-8');
            return {
                statusCode: 200,
                content: luisResult,
            };
        }

        return { statusCode: 404, content: '' };
    }
}
