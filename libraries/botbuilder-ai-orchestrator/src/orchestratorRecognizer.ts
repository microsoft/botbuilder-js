/**
 * @module botbuilder-ai-orchestrator
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BoolExpression, NumberExpression, StringExpression } from 'adaptive-expressions';
import { RecognizerResult, TurnContext } from 'botbuilder-core';
import { Configurable, DialogContext, DialogSet } from 'botbuilder-dialogs';
import { EntityRecognizer } from 'botbuilder-dialogs-adaptive';

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
    public modelPath: string = null;

    /**
     * Path to the snapshot (.blu file) to load.
     */
    public snapshotPath: string = null;

    /**
     * The entity recognizers.
     */
    public entityRecognizers: EntityRecognizer[] = [];

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
     * @param context Context for the current turn of conversation with the use.
     */
    public async recognize(context: TurnContext): Promise<RecognizerResult> {
        const rec = new OrchestratorAdaptiveRecognizer();
        rec.id = this.id;
        rec.modelPath = new StringExpression(this.modelPath);
        rec.snapshotPath = new StringExpression(this.snapshotPath);
        rec.entityRecognizers = this.entityRecognizers;
        rec.disambiguationScoreThreshold = new NumberExpression(this.disambiguationScoreThreshold);
        rec.detectAmbiguousIntents = new BoolExpression(this.detectAmbiguousIntents);

        const dc = new DialogContext(new DialogSet(), context, { dialogStack: [] });
        return await rec.recognize(dc, context.activity);
    }
}
