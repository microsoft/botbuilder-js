/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { MemoryStorage, UserState, ConversationState } from 'botbuilder-core';
import { DialogManager } from 'botbuilder-dialogs';
import { DialogExpression, LanguageGeneratorExtensions, ResourceExtensions } from 'botbuilder-dialogs-adaptive';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { TestAction } from './testAction';
import { AdaptiveTestAdapter } from './adaptiveTestAdapter';
import { SetTestOptionsMiddleware } from './setTestOptionsMiddleware';

export class TestScript {

    /**
     * A description of the test sequence.
     */
    public description: string;

    /**
     * The dialog to use for the root dialog.
     */
    public dialog: DialogExpression;

    /**
     * The locale (default: en-us).
     */
    public locale: string = 'en-us';

    /**
     * The sequence of test actions to perform to validate the dialog behavior.
     */
    public script: TestAction[] = [];

    /**
     * If true then trace activities will be sent to the test script.
     */
    public enableTrace: boolean = false;

    /**
     * Starts the execution of the test sequence.
     * @param testName Name of the test
     * @param testAdapter (Optional) Test adapter
     */
    public async execute(resourceExplorer: ResourceExplorer, testName?: string, testAdapter?: AdaptiveTestAdapter): Promise<void> {
        if (!testAdapter) {
            testAdapter = new AdaptiveTestAdapter(AdaptiveTestAdapter.createConversation(testName));
        }

        testAdapter.enableTrace = this.enableTrace;
        testAdapter.locale = this.locale;
        testAdapter.use(new SetTestOptionsMiddleware());

        const bot = new DialogManager(this.dialog.value);
        bot.conversationState = new ConversationState(new MemoryStorage());
        bot.userState = new UserState(new MemoryStorage());
        ResourceExtensions.useResourceExplorer(bot, resourceExplorer);
        LanguageGeneratorExtensions.useLanguageGeneration(bot);

        for (let i = 0; i < this.script.length; i++) {
            const testAction = this.script[i];
            await testAction.execute(testAdapter, bot.onTurn.bind(bot));
        }
    }
}