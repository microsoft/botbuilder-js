// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const {
    ConfigurationServiceClientCredentialFactory,
    createServiceClientCredentialFactoryFromConfiguration,
} = require('../');

describe('ConfigurationServiceClientCredentialFactory', function () {
    class TestConfiguration {
        static DefaultConfig = {
            MicrosoftAppId: 'appId',
            MicrosoftAppPassword: 'appPassword',
        };

        constructor(config = {}) {
            this.configuration = Object.assign({}, TestConfiguration.DefaultConfig, config);
        }

        get(_path) {
            return this.configuration;
        }

        set(_path, _val) {}
    }

    it('constructor should work', function () {
        const bfAuth = new ConfigurationServiceClientCredentialFactory(TestConfiguration.DefaultConfig);
        assert.strictEqual(bfAuth.appId, TestConfiguration.DefaultConfig.MicrosoftAppId);
        assert.strictEqual(bfAuth.password, TestConfiguration.DefaultConfig.MicrosoftAppPassword);
    });

    it('createServiceClientCredentialFactoryFromConfiguration should work', function () {
        const config = new TestConfiguration();
        const bfAuth = createServiceClientCredentialFactoryFromConfiguration(config);
        assert.strictEqual(bfAuth.appId, TestConfiguration.DefaultConfig.MicrosoftAppId);
        assert.strictEqual(bfAuth.password, TestConfiguration.DefaultConfig.MicrosoftAppPassword);
    });

    it('undefined or null configuration values should result in null values', function () {
        const config = new TestConfiguration({
            MicrosoftAppId: undefined,
            MicrosoftAppPassword: undefined,
        });
        const bfAuth = createServiceClientCredentialFactoryFromConfiguration(config);
        assert.strictEqual(bfAuth.appId, null);
        assert.strictEqual(bfAuth.password, null);
    });

    it('non-string values should fail', function () {
        const config = new TestConfiguration({
            MicrosoftAppId: 1,
            MicrosoftAppPassword: true,
        });
        assert.throws(
            () => createServiceClientCredentialFactoryFromConfiguration(config),
            /(?:MicrosoftAppId).*\s.*(?:MicrosoftAppPassword)/
        );
    });
});
