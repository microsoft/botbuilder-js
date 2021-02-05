/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as fs from 'fs';
import * as mmh3 from 'murmurhash3';
import * as path from 'path';
import { LuisAdaptiveRecognizer, LuisRecognizerOptionsV3 } from 'botbuilder-ai';
import { DialogContext, Recognizer } from 'botbuilder-dialogs';
import { Activity, RecognizerResult } from 'botbuilder-core';
import {
    HttpRequestMessage,
    MockHttpRequestMiddleware,
    MockHttpRequestMiddlewareKey,
} from './mockHttpRequestMiddleware';
import { HttpResponseMessage } from '../httpRequestMocks/httpResponseMock';
import { DynamicList } from 'botbuilder-ai/lib/dynamicList';
import { ListElement } from 'botbuilder-ai/lib/listElement';
import { ExternalEntity } from 'botbuilder-ai/lib/externalEntity';

const stableHash = (source: string): number => mmh3.murmur32Sync(source);

export class MockLuisRecognizer extends Recognizer {
    private _responseDir: string;
    private _recognizer: LuisAdaptiveRecognizer;

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

    private _responsePath(utterance: string, options: LuisRecognizerOptionsV3): string {
        let hash: number = mmh3.murmur32Sync(utterance);

        if (options.externalEntityRecognizer) {
            hash ^= stableHash('external');
        }

        if (options.includeAPIResults) {
            hash ^= stableHash('api');
        }

        if (options.logPersonalInformation) {
            hash ^= stableHash('personal');
        }

        if (options.dynamicLists) {
            options.dynamicLists.forEach((dynamicList: DynamicList) => {
                hash ^= stableHash(dynamicList.listEntityName);
                dynamicList.requestLists?.forEach((choices: ListElement) => {
                    hash ^= stableHash(choices.canonicalForm);
                    choices.synonyms?.forEach((synonym) => {
                        hash ^= stableHash(synonym);
                    });
                });
            });
        }

        if (options.externalEntities) {
            options.externalEntities.forEach((external: ExternalEntity) => {
                hash ^= stableHash(external.entityName);
                hash ^= stableHash(`${external.startIndex}`);
                hash ^= stableHash(`${external.entityLength}`);
            });
        }

        if (options.includeAllIntents) {
            hash ^= stableHash('all');
        }

        if (options.includeInstanceData) {
            hash ^= stableHash('instance');
        }

        if (options.log ?? false) {
            hash ^= stableHash('log');
        }

        if (options.preferExternalEntities) {
            hash ^= stableHash('prefer');
        }

        if (options.slot) {
            hash ^= stableHash(options.slot);
        }

        if (options.version) {
            hash ^= stableHash(options.version);
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
