/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Represents a property found in a JSON schema.
 */
export class PropertySchema {
    private _parent: PropertySchema;
    private readonly _children: PropertySchema[];
    private readonly _entities: string[];
    private readonly _expectedOnly: string[];

    /**
     * Creates a new `PropertySchema` instance.
     *
     * @param path Path to this property.
     * @param schema JSON schema fragment for this property.
     * @param children Optional. Child properties.
     */
    constructor(path: string, schema: object, children?: PropertySchema[]) {
        this.path = path;
        this.schema = schema;
        this._children = children || [];
        children.forEach((child) => (child._parent = this));
        this._entities = schema['$entities'] || [];
        this._expectedOnly = schema['$expectedOnly'] || [];
    }

    /**
     * Path to schema.
     *
     * @remarks
     * Contains `[]` for arrays and `.` for path segments.
     */
    readonly path: string;

    /**
     * JSON Schema object for this property.
     */
    readonly schema: object;

    /**
     * Parent property schema if any.
     *
     * @returns The parent property schema if any.
     */
    get parent(): PropertySchema | undefined {
        return this._parent;
    }

    /**
     * Child properties if there are any.
     *
     * @returns The child properties if there are any.
     */
    get children(): PropertySchema[] {
        return this._children;
    }

    /**
     * List of entity names.
     *
     * @returns A list of entity names.
     */
    get entities(): string[] {
        return this._entities;
    }

    /**
     * List of expected only entity names.
     *
     * @returns A List of expected only entity names.
     */
    get expectedOnly(): string[] {
        return this._expectedOnly;
    }

    /**
     * Name for this property.
     *
     * @remarks
     * Array brackets `[]` will have been removed.
     * @returns The name for this property.
     */
    get name(): string {
        const segments = this.path.split('.');
        return segments[segments.length - 1].replace('[]', '');
    }

    /**
     * JSON Schema type.
     *
     * @returns The JSON Schema type.
     */
    get type(): string {
        return this.schema['type'];
    }

    /**
     * @returns `true` if the property is an array.
     */
    isArray(): boolean {
        return this.path.endsWith('[]');
    }

    /**
     * @returns `true` if the property is an enum.
     */
    isEnum(): boolean {
        return !!this.schema['enum'];
    }
}
