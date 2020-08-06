const assert = require('assert');
const { SchemaHelper } = require('../lib');
const fs = require('fs');

const schemaDirPath = `${ __dirname }/schema/`;
const schemaFilePath = `${ schemaDirPath }test.schema`;

describe('schemaHelper tests', function() {
    const schemaInJson = JSON.parse(fs.readFileSync(schemaFilePath));
    const schemaRoot = new SchemaHelper(schemaInJson);

    it('parse child schema', function() {
        const schemaChildrens = schemaRoot.property.children;
        const child = schemaRoot.pathToSchema('propertyChildren.subProperty1');
        assert.equal(child.path, 'propertyChildren.subProperty1');
        assert.equal(child, schemaChildrens[2].children[0]);
        assert.equal(child.parent.parent, schemaRoot.property);
        const errChild = schemaRoot.pathToSchema('propertyChildren.subProperty1.errorPath');
        assert.equal(errChild, undefined);
    });

    it('common property', function(){
        assert.equal(schemaRoot.property.expectedOnly, schemaInJson['$expectedOnly']);
        assert.equal(schemaRoot.required, schemaInJson['required']);
        const stringChild = schemaRoot.pathToSchema('propertyString');
        assert.equal(stringChild.type, schemaInJson['properties']['propertyString']['type']);
    });

    it('enum type schema', async function() {
        const enumChild = schemaRoot.pathToSchema('propertyEnum');
        assert.equal(enumChild.isEnum(), true);
        assert.equal(enumChild.entities, schemaInJson['properties']['propertyEnum']['$entities']);
    });

    it('array type schema', async function() {
        const arrayChild = schemaRoot.pathToSchema('propertyArray');
        assert.equal(arrayChild.isArray(), true);
    });

    it('error type test', async function() {
        const errorSchemaType1InJson = JSON.parse(fs.readFileSync(`${ schemaDirPath }test_errorType1.schema`));
        assert.throws(() => new SchemaHelper(errorSchemaType1InJson), Error);
        const errorSchemaType2InJson = JSON.parse(fs.readFileSync(`${ schemaDirPath }test_errorType2.schema`));
        assert.throws(() => new SchemaHelper(errorSchemaType2InJson), Error);
    });
});
