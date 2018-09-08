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
        let services = [];
        let exportFolder = path.join(path.dirname(__filename), 'exportfolder');

        await config.export(exportFolder, {
            download: false, // disable download
            progress: (service, command, index, total) => services.push(service)
        });

        for (let service of config.services) {
            let found = false;
            for (let svc of services) {
                if ((service.id === svc.id) &&
                    (service.type === svc.type) &&
                    (service.name === svc.name)) {
                    found = true;
                    break;
                }
            }
            assert.ok(found, `${service.name} not published through progress`);
        }

        let recipePath = path.join(exportFolder, 'bot.recipe');
        let json = txtfile.readSync(recipePath);

        fs.unlinkSync(recipePath);
        fs.rmdirSync(exportFolder);

        let recipe = bf.BotRecipe.fromJSON(JSON.parse(json));
        // -1 because we don't export 'unknown' service record
        assert.equal(config.services.length - 1, recipe.resources.length, "service count not equal");
        for (let service of config.services) {
            if (service.type != 'unknown') {
                let found = false;
                for (let resource of recipe.resources) {
                    if ((service.id === resource.id) &&
                        (service.type === resource.type) &&
                        (service.name === resource.name)) {
                        found = true;
                        break;
                    }
                }
                assert.ok(found, `${service.name} not exported correctly `);
            }
        }


        let json2 = recipe.toJSON();
        assert.deepEqual(json2, JSON.parse(json), "serialization diffeent");
    });

});

