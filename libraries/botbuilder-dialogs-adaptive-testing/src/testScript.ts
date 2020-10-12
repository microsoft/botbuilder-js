/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ConversationState, MemoryStorage, UserState, TestAdapter } from 'botbuilder-core';
import { Configurable, Converter, ConverterFactory, Dialog, DialogManager } from 'botbuilder-dialogs';
import { LanguageGeneratorExtensions, ResourceExtensions } from 'botbuilder-dialogs-adaptive';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { NonFunctionKeys } from 'utility-types';
import { TestAction } from './testAction';
import { UserTokenMock, UserTokenMocksConverter } from './userTokenMocks';

class DialogConverter implements Converter<string, Dialog> {
    public constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    public convert(value: string | Dialog): Dialog {
        if (value instanceof Dialog) {
            return value;
        }

        let resource = this._resourceExplorer.getResource(value);
        if (!resource) {
            resource = this._resourceExplorer.getResource(`${value}.dialog`);
        }

        if (resource) {
            return this._resourceExplorer.loadType<Dialog>(resource);
        }

        return undefined;
    }
}

/**
 * A mock Test Script that can be used for unit testing bot's logic.
 */
export class TestScript extends Configurable {
    public static $kind = 'Microsoft.Test.Script';

    /**
     * A description of the test sequence.
     */
    public description: string;

    /**
     * The dialog to use for the root dialog.
     */
    public dialog: Dialog;

    /**
     * The locale (default: en-us).
     */
    public locale = 'en-us';

    /**
     * The mock data for Microsoft.OAuthInput.
     */
    public userTokenMocks: UserTokenMock[] = [];

    /**
     * The sequence of test actions to perform to validate the dialog behavior.
     */
    public script: TestAction[] = [];

    /**
     * If true then trace activities will be sent to the test script.
     */
    public enableTrace = false;

    public getConverter(property: NonFunctionKeys<TestScript>): Converter | ConverterFactory {
        switch (property) {
            case 'dialog':
                return DialogConverter;
            case 'userTokenMocks':
                return UserTokenMocksConverter;
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Starts the execution of the test sequence.
     * @param testName Name of the test
     * @param testAdapter (Optional) Test adapter
     */
    public async execute(
        resourceExplorer: ResourceExplorer,
        testName?: string,
        testAdapter?: TestAdapter
    ): Promise<void> {
        if (!testAdapter) {
            testAdapter = new TestAdapter(TestAdapter.createConversation(testName));
        }

        testAdapter.enableTrace = this.enableTrace;
        testAdapter.locale = this.locale;

        const bot = new DialogManager(this.dialog);
        bot.conversationState = new ConversationState(new MemoryStorage());
        bot.userState = new UserState(new MemoryStorage());
        ResourceExtensions.useResourceExplorer(bot, resourceExplorer);
        LanguageGeneratorExtensions.useLanguageGeneration(bot);

        this.userTokenMocks.forEach((userTokenMock) => {
            userTokenMock.setup(testAdapter);
        });

        for (let i = 0; i < this.script.length; i++) {
            const testAction = this.script[i];
            await testAction.execute(testAdapter, bot.onTurn.bind(bot));
        }
    }
}
