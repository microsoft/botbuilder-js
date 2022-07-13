// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Configuration } from './configuration';
import { ComponentDeclarativeTypes, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { ok } from 'assert';

/**
 * Class which gives access to content resources by specifying configuration and declarativeTypes.
 */
export class ConfigurationResourceExporer extends ResourceExplorer {
    /**
     * @param configuration Additional configuration methods.
     * @param declarativeTypes Registered declarative types.
     */
    constructor(configuration: Configuration, declarativeTypes: ComponentDeclarativeTypes[]) {
        super({ declarativeTypes });

        const applicationRoot = configuration.string(['applicationRoot']);
        ok(applicationRoot);

        this.addFolders(
            applicationRoot,
            ['node_modules'], // Composer copies to `dialogs/imported` so `node_modules` will contain dupes
            configuration.string(['NODE_ENV']) === 'dev' // watch in dev only!
        );
    }
}
