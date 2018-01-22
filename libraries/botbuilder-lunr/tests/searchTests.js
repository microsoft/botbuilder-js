const assert = require('assert');
const lunr = require('../');
const builder = require('botbuilder');
//const builderNode = require('botbuilder-node');
//const azure = require("botbuilder-azure");
const elasticLunr = require("elasticlunr");

// disable elasticlunr warnings
elasticLunr.utils.warn = (function (global) {
    return function (message) {    };
  })(this);
  
testSearch = function (type, storage) {
    let engine = new lunr.LunrSearchEngine(storage);
    it(type + "-catalogs", function () {
        let cat = null;
        return engine.deleteCatalog('test')
            .then(() => engine.deleteCatalog('test2'))
            .then(() => engine.createCatalog('test', 'id', ['text']))
            .then(catalog => {
                cat = catalog;
                assert(catalog != null, "no catalog");
                return catalog;
            })
            .then(() => cat.add({ id: 'test', 'text': "this is a test" }))
            .then(() => cat.add({ id: 'dog', 'text': "dogs running wild" }))
            .then(() => cat.add({ id: 'cat', 'text': "cats are better then rest.  Cats rule, dogs drool" }))
            .then(() => cat.flush())
            .then(() => cat.search('cat'))
            .then(results => {
                assert(results.length > 0);
                return cat.get(results[0].docId);
            })
            .then(doc => {
                assert(doc != null);
                assert(doc.id == "cat");
                assert(doc.text.indexOf('dogs') > 0);
            })
            .then(() => engine.createCatalog('test2', 'id', ['text']))
            .then(catalog => {
                cat = catalog;
                assert(catalog != null, "no catalog");
            })
            .then(() => cat.add({ id: 'test2', 'text': "this 2 is a test" }))
            .then(() => cat.add({ id: 'dog2', 'text': "dogs 2 running wild" }))
            .then(() => cat.add({ id: 'cat2', 'text': "cats 2 are better then rest.  Cats rule, dogs 2 drool" }))
            .then(() => cat.flush())
            .then(() => cat.search('cat'))
            .then(results => {
                assert(results.length > 0);
                return cat.get(results[0].docId);
            })
            .then(doc => {
                assert(doc != null);
                assert(doc.id == "cat2");
                assert(doc.text.indexOf('dogs 2') > 0);
            })
            .then(() => { });
    });

    it(type + "-listCatalogs", function () {
        return engine.listCatalogs()
            .then(catalogs => {
                assert(catalogs.indexOf('test') >= 0);
                assert(catalogs.indexOf('test2') >= 0);
                assert(catalogs.length == 2);
            });
    });
    it(type + "-listCatalogs engine2", function () {
        let engine2 = new lunr.LunrSearchEngine(storage);
        return engine2.listCatalogs()
            .then(catalogs => {
                assert(catalogs.indexOf('test') >= 0);
                assert(catalogs.indexOf('test2') >= 0);
                assert(catalogs.length == 2);
            });
    });

    it(type + "-search Engine2", function () {
        let engine2 = new lunr.LunrSearchEngine(storage);
        return engine2.getCatalog('test')
            .then((catalog) => cat = catalog)
            .then(() => cat.search('cat'))
            .then(results => {
                assert(results.length > 0);
                return cat.get(results[0].docId);
            })
            .then(doc => {
                assert(doc != null);
                assert(doc.id == "cat");
                assert(doc.text.indexOf('dogs') > 0);
            });
    })

    it(type + "-deleteCatalogsTest", function () {
        let engine2 = new lunr.LunrSearchEngine(storage);
        return engine2.deleteCatalog("test")
            .then(() => engine2.listCatalogs())
            .then((catalogs) => {
                assert(catalogs.indexOf('test') < 0);
                assert(catalogs.indexOf('test2') >= 0);
                assert(catalogs.length == 1);
            });
    });

    // clean up catalogs
    it(type + "-delete all catalogs", function () {
        let engine2 = new lunr.LunrSearchEngine(storage);
        return engine2.deleteCatalog('test')
            .then(() => engine2.deleteCatalog('test2'));
    });
}

describe('LunrSearch', function () {
    // disable this test
    // before(function () {
    //     this.skip();
    // });

    this.timeout(20000);
    testSearch("memory", new builder.MemoryStorage());
    //testSearch("file", new builderNode.FileStorage());
    //testSearch("azure", new azure.TableStorage({ tableName: 'unknown', storageAccountOrConnectionString: 'UseDevelopmentStorage=true' }));
});

