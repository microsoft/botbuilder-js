/**
 * @module botbuilder-dialogs-adaptive-tests
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { Configurable } from 'botbuilder-dialogs';
import { TestAction } from '../testAction';
import { AdaptiveTestAdapter } from '../adaptiveTestAdapter';

export interface UserDelayConfiguration {
    timespan?: number;
}

export class UserDelay extends Configurable implements TestAction {

    public static readonly declarativeType: string = 'Microsoft.Test.UserDelay';

    /**
     * The timespan in milliseconds to delay.
     */
    public timespan: number;

    public configure(config: UserDelayConfiguration): this {
        return super.configure(config);
    }

    public async execute(_testAdapter: AdaptiveTestAdapter, _callback: (context: TurnContext) => Promise<any>): Promise<any> {
        await Promise.resolve(resolve => setTimeout(resolve, this.timespan));
    }
}