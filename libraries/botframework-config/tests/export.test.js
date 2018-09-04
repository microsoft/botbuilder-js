let assert = require('assert');
let bf = require('../lib');
let fs = require('fs');
let path = require('path');
let txtfile = require('read-text-file');

// do not save over testbot
const testBotPath = require.resolve("./test.bot");
const legacyBotPath = require.resolve("./legacy.bot");
const saveBotPath = testBotPath.replace("test.bot", "save.bot");

describe("ExportTests", () => {
    it("ExportBot", async () => {
        var config = await bf.BotConfiguration.load(testBotPath);
        let messages = [];
        await config.export('exporttest', {
            download: false, // disable download
            progress: (service, command, index, total) => messages.push(service.name)
        });

        for (let service of config.services) {
            let found = false;
            for (let message of messages) {
                if (message === service.name) {
                    found = true;
                    break;
                }
            }
            assert.ok(found, `${service.name} not sent as status`);
        }
        let botPath = require.resolve(`../exporttest/bot.recipe`);
        let exportFolder  = path.dirname(botPath);
        let json = txtfile.readSync(botPath);

        fs.unlinkSync(botPath);
        fs.rmdirSync(exportFolder);

        let recipe = JSON.parse(json);
        assert.equal(config.services.length, recipe.resources.length, "service count not equal");

    });

});

