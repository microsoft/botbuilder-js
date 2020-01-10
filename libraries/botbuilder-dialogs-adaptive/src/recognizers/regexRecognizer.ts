/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, RecognizerResult, ActivityTypes } from 'botbuilder-core';
import { Configurable } from 'botbuilder-dialogs';
import { Recognizer, createRecognizerResult, IntentMap } from './recognizer';
import { IntentPattern } from './intentPattern';

export interface RegExpRecognizerConfiguration {
    intents?: IntentPattern[];
    multiIntentMode?: boolean;
}

export class RegexRecognizer extends Configurable implements Recognizer {

    public static declarativeType = 'Microsoft.RegexRecognizer';

    public intents: IntentPattern[] = [];

    public multiIntentMode = false;

    public constructor();
    public constructor(multiIntentMode = false) {
        super();
        this.multiIntentMode = multiIntentMode;
    }

    public configure(config: RegExpRecognizerConfiguration): this {
        return super.configure(config);
    }

    public async recognize(context: TurnContext): Promise<RecognizerResult> {
        // Process only messages
        if (context.activity.type !== ActivityTypes.Message) {
            return createRecognizerResult(undefined);
        }

        // Identify matched intents
        let hasMatch = false;
        const utterance = context.activity.text || '';
        const matched: { [name: string]: MatchedIntent } = {};
        for (let i = 0; i < this.intents.length; i++) {
            const match = this.matchIntent(i, utterance);
            if (match) {
                const name = match.intent;
                if (!matched.hasOwnProperty(name) || match.score > matched[name].score) {
                    matched[name] = match;
                    hasMatch = true;
                }
            }
        }

        // Return None intent if no matches
        if (!hasMatch) {
            return createRecognizerResult(utterance);
        }

        // Populate intents and entities matched
        const intents: IntentMap = {};
        const entities: { [name: string]: string[] } = {};
        if (this.multiIntentMode) {
            // Return all intents and entities
            for (const name in matched) {
                const match = matched[name];
                intents[name] = { score: 1.0 };
                this.addEntities(entities, match);
            }
        } else {
            // Return top scoring intent
            let top: MatchedIntent;
            for (const name in matched) {
                if (!top || matched[name].score > top.score) {
                    top = matched[name];
                }
            }
            intents[top.intent] = { score: top.score };
            this.addEntities(entities, top);
        }

        return createRecognizerResult(utterance, intents, entities);
    }

    private addEntities(entities: { [name: string]: string[] }, match: MatchedIntent): void {
        for (const name in match.entities) {
            const value = match.entities[name];
            if (entities.hasOwnProperty(name)) {
                // Append if unique value
                if (entities[name].indexOf(value) < 0) {
                    entities[name].push(value);
                }
            } else {
                entities[name] = [value];
            }
        }
    }

    private matchIntent(index: number, utterance: string): MatchedIntent | undefined {
        const intent = this.intents[index];
        const regex = new RegExp(intent.pattern, 'i');
        const matched = regex.exec(utterance);
        if (matched) {
            // Initialize result
            const result: MatchedIntent = {
                intent: intent.intent,
                score: matched[0].length / utterance.length,
                entities: {}
            };

            // Check for named capture groups
            if (matched.groups) {
                result.entities = matched.groups;
            } else if (matched.length > 1) {
                for (let i = 1; i < matched.length; i++) {
                    result.entities[i.toString()] = matched[i];
                }
            }

            return result;
        } else {
            return undefined;
        }
    }


}

interface MatchedIntent {
    intent: string;
    score: number;
    entities: { [key: string]: string };
}

