"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationResourceExporer = void 0;
const botbuilder_dialogs_declarative_1 = require("botbuilder-dialogs-declarative");
const assert_1 = require("assert");
class ConfigurationResourceExporer extends botbuilder_dialogs_declarative_1.ResourceExplorer {
    constructor(configuration, declarativeTypes) {
        super({ declarativeTypes });
        const applicationRoot = configuration.string(['applicationRoot']);
        assert_1.ok(applicationRoot);
        this.addFolders(applicationRoot, ['node_modules'], // Composer copies to `dialogs/imported` so `node_modules` will contain dupes
        configuration.string(['NODE_ENV']) === 'dev' // watch in dev only!
        );
    }
}
exports.ConfigurationResourceExporer = ConfigurationResourceExporer;
//# sourceMappingURL=configurationResourceExplorer.js.map