/**
 * @module botbuilder-ai-orchestrator
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { RecognizerResult, TurnContext } from 'botbuilder-core';
import { Configurable, DialogContext, DialogSet, Recognizer } from 'botbuilder-dialogs';
import { OrchestratorAdaptiveRecognizer } from './orchestratorAdaptiveRecognizer';

/**
 * Class that represents an Orchestrator recognizer.
 */
export class OrchestratorRecognizer extends Configurable {
    /**
     * Full recognition results are available under this property
     */
    public readonly resultProperty: string = 'result';

    /**
     * Recognizers unique ID.
     */
    public id: string;

    /**
     * Path to Orchestrator base model folder.
     */
    public modelPath: string;

    /**
     * Path to the snapshot (.blu file) to load.
     */
    public snapshotPath: string;

    /**
     * The external entity recognizer.
     */
    public externalEntityRecognizer: Recognizer;

    /**
     * Threshold value to use for ambiguous intent detection. Defaults to 0.05.
     * Recognizer returns ChooseIntent (disambiguation) if other intents are classified within this threshold of the top scoring intent.
     */
    public disambiguationScoreThreshold = 0.05;

    /**
     * Enable ambiguous intent detection. Defaults to false.
     */
    public detectAmbiguousIntents = false;

    /**
     * Returns recognition result. Also sends trace activity with recognition result.
     *
     * @param {TurnContext} turnContext Context for the current turn of conversation with the use.
     * @returns {Promise<RecognizerResult>} Recognizer result.
     */
    public async recognize(turnContext: TurnContext): Promise<RecognizerResult> {
        const rec = new OrchestratorAdaptiveRecognizer().configure({
            id: this.id,
            detectAmbiguousIntents: this.detectAmbiguousIntents,
            modelPath: this.modelPath,
            snapshotPath: this.snapshotPath,
            disambiguationScoreThreshold: this.disambiguationScoreThreshold,
            externalEntityRecognizer: this.externalEntityRecognizer,
        });

        const dc = new DialogContext(new DialogSet(), turnContext, { dialogStack: [] });
        return rec.recognize(dc, turnContext.activity);
    }
}
