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
        let exportFolder = path.join(path.dirname(__filename),'exportfolder');

        await config.export(exportFolder, {
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

        let recipePath = path.join(exportFolder, 'bot.recipe');
        let json = txtfile.readSync(recipePath);
        
        fs.unlinkSync(recipePath);
        fs.rmdirSync(exportFolder);

        let recipe = bf.BotRecipe.fromJSON(JSON.parse(json));
        assert.equal(config.services.length, recipe.resources.length, "service count not equal");

        let json2 = recipe.toJSON();
        assert.deepEqual(json2, JSON.parse(json), "serialization diffeent");
    });

});

