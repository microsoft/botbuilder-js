const { Serializer } = require('@azure/core-http');
const Mappers = require('../lib/connectorApi/models/mappers');
const serializer = new Serializer({ Activity: Mappers.Activity, Entity: Mappers.Entity });
const assert = require('assert');

describe('serialize', function () {
    const entity = [{ type: 'mention', keyone: 'valueOne', keytwo: { keythree: 'valueThree' } }];
    const activity = { type: 'message', entities: entity };

    it('should retain custom Entity properties', function () {
        const serializedObject = serializer.serialize(Mappers.Activity, activity);
        assert.deepStrictEqual(serializedObject.entities, entity);
    });
});
