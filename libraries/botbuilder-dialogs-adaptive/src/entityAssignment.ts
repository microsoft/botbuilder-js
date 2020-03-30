/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { EntityInfo, NormalizedEntityInfos } from './entityInfo';
import { SchemaHelper } from './schemaHelper';

/**
 * Built-in ways to assign entities to properties.
 */
export enum AssignEntityOperations {
    /**
     * Add an entity to a property.
     */
    add = 'add',

    /**
     * Remove an entity from a property.
     */
    remove = 'remove',

    /**
     * Clear a properties value.
     */
    clear = 'clear'
}

export interface EntityAssignment {
    /**
     * Name of property being assigned.
     */
    property: string;

    /**
     * Operation to assign entity to property.
     */
    operation: AssignEntityOperations;

    /**
     * Entity being assigned.
     */
    entity: Partial<EntityInfo>;

    /**
     * Value indicating whether this entity was in `DialogPath.ExpectedProperties`.
     */
    isExpected: boolean;
}

/**
 * Static methods for working with `EntityAssignment` objects.
 */
export class EntityAssignment {
    /**
     * Print an assignment as a string.
     * @param _this Source assignment.
     */
    public static toString(_this: Partial<EntityAssignment>): string {
        return `${ _this.isExpected ? '+' : '' }${ _this.property } = ${ _this.operation }(${ EntityInfo.toString(_this.entity) })`;
    }

    /**
     * @private
     * Generates possible entity to property mappings.
     * @param entities Normalized entities to search over.
     * @param expected Current expected properties.
     * @param dialogSchema Dialog schema.
     */
    public static findCandidates(entities: NormalizedEntityInfos, expected: string[], dialogSchema: SchemaHelper): Partial<EntityAssignment>[] {
        const candidates: Partial<EntityAssignment>[] = [];
        const globalExpectedOnly: string[] = dialogSchema.schema['$expectedOnly'] || [];
        dialogSchema.property.children.forEach((propSchema) => {
            const isExpected = expected.indexOf(propSchema.path) >= 0;
            const expectedOnly = propSchema.expectedOnly;
            propSchema.entities.forEach((entityName) => {
                const matches = entities[entityName];
                if (matches && (isExpected || (expectedOnly ? expectedOnly : globalExpectedOnly).indexOf(entityName) < 0)) {
                    matches.forEach((entity) => {
                        candidates.push({
                            entity: entity,
                            property: propSchema.path,
                            // TODO: Eventually we should be able to pick up an add/remove composite here as an alternative
                            operation: AssignEntityOperations.add,
                            isExpected: isExpected
                        });
                    });
                }
            });
        });

        return candidates;
    }

    /**
     * @private
     * Have each property pick which overlapping entity is the best one
     * @param candidates Candidate assignments to filter.
     * @param dialogSchema Dialog schema.
     */
    public static removeOverlappingPerProperty(candidates: Partial<EntityAssignment>[], dialogSchema: SchemaHelper): Partial<EntityAssignment>[] {
        // Group mappings by property
        const perProperty = candidates.reduce<{ [path: string]: Partial<EntityAssignment>[] }>((accumulator, assignment) => {
            if (accumulator.hasOwnProperty(assignment.property)) {
                accumulator[assignment.property].push(assignment);
            } else {
                accumulator[assignment.property] = [assignment];
            }
            return accumulator;
        }, {});

        const output: Partial<EntityAssignment>[] = [];
        for (const path in perProperty) {
            const schema = dialogSchema.pathToSchema(path);
            let choices = perProperty[path];

            // Assume preference by order listed in mappings
            // Alternatives would be to look at coverage or other metrics
            schema.entities.forEach((entity) => {
                let candidate: Partial<EntityAssignment>;
                do {
                    candidate = undefined;
                    for (let i = 0; i < choices.length; i++) {
                        const mapping = choices[i];
                        if (mapping.entity.name == entity) {
                            candidate = mapping;
                            break;
                        }
                    }

                    if (candidate) {
                        // Remove any overlapping entities
                        choices = choices.filter((choice) => !EntityInfo.overlaps(choice.entity, candidate.entity));
                        output.push(candidate);
                    }

                } while (candidate);
            });
        }

        return output;
    }

}