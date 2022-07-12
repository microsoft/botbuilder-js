/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PropertySchema } from './propertySchema';

/**
 * Helper class for dialog schema.
 */
export class SchemaHelper {
    /**
     * Creates a new `SchemaHelper` instance.
     *
     * @param schema JSON schema to parse.
     */
    constructor(schema: object) {
        this.schema = schema;
        this.property = this.createProperty(schema);
    }

    /**
     * JSON schema object.
     */
    readonly schema: object;

    /**
     * Root object property for the schema.
     */
    readonly property: PropertySchema;

    /**
     * List of required property names.
     *
     * @returns The list of required property names.
     */
    get required(): string[] {
        return this.schema['required'] || [];
    }

    /**
     * Returns the schema object for a given property path.
     *
     * @param path Path of the properties schema to return.
     * @returns the schema object for a given property path.
     */
    pathToSchema(path: string): PropertySchema | undefined {
        let property: PropertySchema = undefined;
        const segments = path.replace('[]', '').split('.');
        if (segments.length > 0) {
            property = this.property;
            for (let i = 0; i < segments.length; i++) {
                property = property.children.find((c) => c.name == segments[i]);
                if (!property) {
                    break;
                }
            }
        }

        return property;
    }

    /**
     * @private
     */
    private createProperty(schema: object, path = ''): PropertySchema {
        // Simplify array handling by collapsing to arrays sub-type
        let type: string = schema['type'];
        if (type == 'array') {
            const items: any = schema['items'] || schema['contains'];
            if (Array.isArray(items)) {
                throw new Error(`${path} has an items array which is not supported`);
            } else if (typeof items == 'object') {
                // Copy parent $ properties like $entities
                for (const name in schema) {
                    if (Object.prototype.hasOwnProperty.call(schema, name) && name.startsWith('$')) {
                        items[name] = schema[name];
                    }
                }
                schema = items;
                type = schema['type'];
                path += '[]';
            } else {
                throw new Error(`${path} has an items array which is not supported`);
            }
        }

        // Create child properties
        const children: PropertySchema[] = [];
        if (type == 'object') {
            const properties = schema['properties'] || {};
            for (const name in properties) {
                if (Object.prototype.hasOwnProperty.call(properties, name) && !name.startsWith('$')) {
                    const newPath = path == '' ? name : `${path}.${name}`;
                    children.push(this.createProperty(properties[name], newPath));
                }
            }
        }

        return new PropertySchema(path, schema, children);
    }
}
