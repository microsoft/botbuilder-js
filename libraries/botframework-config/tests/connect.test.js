let assert = require('assert');
let bf = require('../lib');

// do not save over testbot
const testBotPath = require.resolve("./test.bot");

describe("ServiceManipulation", () => {
    it("ConnectAssignsUniqueIds", async () => {
        var config = await bf.BotConfiguration.load(testBotPath);
        var config2 = new bf.BotConfiguration();
        for(let service of config.services) {
            service.id = "1";
            config2.connectService(service);
        }

        let map ={};
        for(let service of config2.services) {
            assert.ok(!map.hasOwnProperty(service.id), "Duplicate Id assigned");
            map[service.id] = service;
        }
    });
    
    it("FindServices", async () => {
        var config = await bf.BotConfiguration.load(testBotPath);
        
        assert.ok(config.findServiceByNameOrId("3"), "should find by id");
        assert.ok(config.findServiceByNameOrId("testInsights"), "should find by name");
        assert.ok(config.findService("3"), "should find by id");
        assert.equal(config.findService("testInsights"), null, "should not find by name");
    });

    it("DisconnectServicesById", async () => {
        var config = await bf.BotConfiguration.load(testBotPath);
        var config2 = new bf.BotConfiguration();
        for(let service of config.services) {
            config2.connectService(service);
        }

        let map ={};
        for(let service of config2.services) {
            map[service.id] = service;
        }

        for(let prop in map) {
            config2.disconnectService(map[prop].id);
        }
        assert.equal(config2.services.length, 0, "didn't remove all services");
    });

    it("DisconnectServicesByNameOrId_UsingId", async () => {
        var config = await bf.BotConfiguration.load(testBotPath);
        var config2 = new bf.BotConfiguration();
        for(let service of config.services) {
            config2.connectService(service);
        }

        let map ={};
        for(let service of config2.services) {
            map[service.id] = service;
        }

        for(let prop in map) {
            config2.disconnectServiceByNameOrId(map[prop].id);
        }
        assert.equal(config2.services.length, 0, "didn't remove all services");
    });

    it("DisconnectByNameOrId_UsingName", async () => {
        var config = await bf.BotConfiguration.load(testBotPath);
        var config2 = new bf.BotConfiguration();
        for(let service of config.services) {
            config2.connectService(service);
        }

        let map ={};
        for(let service of config2.services) {
            map[service.id] = service;
        }

        for(let prop in map) {
            config2.disconnectServiceByNameOrId(map[prop].name);
        }
        assert.equal(config2.services.length, 0, "didn't remove all services");
    });

});

