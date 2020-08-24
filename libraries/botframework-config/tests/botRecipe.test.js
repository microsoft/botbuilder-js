const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { BotRecipe } = require('../lib');

function assertService(newService, oldService) {
    assert(newService.type === oldService.type,
        `newService.type [${ newService.type }] !== oldService.type [${ oldService.type }]`);
    assert(newService.id === oldService.id,
        `newService.id [${ newService.id }] !== oldService.id [${ oldService.id }]`);
    assert(newService.name === oldService.name,
        `newService.name [${ newService.name }] !== oldService.name [${ oldService.name }]`);
    assert(newService.url === oldService.url,
        `newService.url [${ newService.url }] !== oldService.url [${ oldService.url }]`);
}

describe('BotRecipe', () => {
    const recipe = new BotRecipe();
    it(`should have a default version of '1.0'.`, () => {
        assert(recipe.version === '1.0', `expected version '1.0', instead received ${ recipe.version }`);
    });

    it(`should have default resources be an empty array.`, () => {
        assert(Array.isArray(recipe.resources), `expected resources to be an Array, instead it is type "${ typeof recipe.resources }"`);
        assert(recipe.resources.length === 0, `initial resources should be length 0, not ${ recipe.resources.length }`);
    });

    it('should create a new recipe using .fromJSON().', () => {
        const filePath = path.join(__dirname, './bot.recipe');
        const data = fs.readFileSync(filePath).toString();
        const oldRecipe = JSON.parse(data);
        const newRecipe = BotRecipe.fromJSON(oldRecipe);

        const oldVersion = oldRecipe.version;
        const oldResources = oldRecipe.resources;
        const oldEndpoint = oldRecipe.resources[0];

        assert(newRecipe.version === oldVersion, `expected version ${ oldVersion }, instead received ${ newRecipe.version }`);
        assert(Array.isArray(newRecipe.resources), `expected resources to be an Array, instead it is type "${ typeof newRecipe.resources }"`);
        assert(newRecipe.resources.length === oldResources.length, `initial resources should be length ${ oldResources.length }, not ${ newRecipe.resources.length }`);
        assertService(newRecipe.resources[0], oldEndpoint);
    });

    it(`should create an empty recipe without any args using .fromJSON().`, () => {
        const newRecipe = BotRecipe.fromJSON();
        assert(newRecipe.version === '1.0', `expected version '1.0', instead received ${ newRecipe.version }`);
        assert(newRecipe.resources.length === 0, `resources should be length 0, not ${ newRecipe.resources.length }`);

        const keys = Object.keys(newRecipe).length;
        assert(keys === 2, `expected 2 keys, found ${ keys }`);
    });

    it(`should create a new recipe with .toJSON().`, () => {
        const newRecipe = recipe.toJSON();
        assert(newRecipe.version === '1.0', `expected version '1.0', instead received ${ newRecipe.version }`);
        assert(newRecipe.resources.length === 0, `resources should be length 0, not ${ newRecipe.resources.length }`);
    });
});
