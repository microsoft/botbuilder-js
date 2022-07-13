const assert = require('assert');
const bf = require('../lib');

// do not save over testbot
const testBotPath = require.resolve('./test.bot');

describe('ServiceManipulation', function () {
    let config;

    before(async function () {
        config = await bf.BotConfiguration.load(testBotPath);
    });

    function mapServices(baseConfig, targetConfig) {
        for (const service of baseConfig.services) {
            targetConfig.connectService(service);
        }

        const map = {};
        for (const service of targetConfig.services) {
            map[service.id] = service;
        }
        return map;
    }

    it('ConnectAssignsUniqueIds', async function () {
        const config = await bf.BotConfiguration.load(testBotPath);
        const config2 = new bf.BotConfiguration();
        for (const service of config.services) {
            service.id = undefined;
            config2.connectService(service);
        }

        const map = {};
        for (const service of config2.services) {
            assert.ok(!Object.prototype.hasOwnProperty.call(map, service.id), 'Duplicate Id assigned');
            map[service.id] = service;
        }
    });

    it('FindServices', async function () {
        assert.ok(config.findServiceByNameOrId('3'), 'should find by id');
        assert.ok(config.findServiceByNameOrId('testInsights'), 'should find by name');
        assert.ok(config.findService('3'), 'should find by id');
        assert.equal(config.findService('testInsights'), null, 'should not find by name');
    });

    it('DisconnectServicesById', async function () {
        const config2 = new bf.BotConfiguration();
        const map = mapServices(config, config2);

        for (const prop in map) {
            config2.disconnectService(map[prop].id);
        }
        assert.equal(config2.services.length, 0, "didn't remove all services");
    });

    it('DisconnectServicesByNameOrId_UsingId', async function () {
        const config2 = new bf.BotConfiguration();
        const map = mapServices(config, config2);

        for (const prop in map) {
            config2.disconnectServiceByNameOrId(map[prop].id);
        }
        assert.equal(config2.services.length, 0, "didn't remove all services");
    });

    it('DisconnectByNameOrId_UsingName', async function () {
        const config2 = new bf.BotConfiguration();
        const map = mapServices(config, config2);

        for (const prop in map) {
            config2.disconnectServiceByNameOrId(map[prop].name);
        }
        assert.equal(config2.services.length, 0, "didn't remove all services");
    });
});
