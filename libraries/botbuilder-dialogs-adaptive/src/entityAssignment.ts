/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import isEqual from 'lodash/isEqual';
import { EntityInfo } from './entityInfo';

export interface EntityAssignmentConfiguration {
    /**
     * Event name to surface
     */
    event: string;

    /**
     * Name of property being assigned.
     */
    property: string;

    /**
     * Operation to apply to property and value.
     */
    operation: string;

    /**
     * Recognized entity value.
     */
    value: Partial<EntityInfo>;

    /**
     * Alternative assignment.
     */
    alternative: EntityAssignment;

    /**
     * Value indicating whether this entity was in `DialogPath.ExpectedProperties`.
     */
    isExpected: boolean;

    /**
     * The number of times event has been raised.
     */
    raisedCount: number;

    /**
     * The expected properties when assignment was made.
     */
    expectedProperties: string[];
}

/**
 * Static methods for working with `EntityAssignment` objects.
 */
export class EntityAssignment implements EntityAssignmentConfiguration {
    /**
     * Event name to surface
     */
    event: string;

    /**
     * Name of property being assigned.
     */
    property: string;

    /**
     * Operation to assign entity to property.
     */
    operation: string;

    /**
     * Recognized entity value.
     */
    value: Partial<EntityInfo>;

    /**
     * Alternative assignment.
     */
    alternative: EntityAssignment;

    /**
     * Value indicating whether this entity was in `DialogPath.ExpectedProperties`.
     */
    isExpected: boolean;

    /**
     * The number of times event has been raised.
     */
    raisedCount: number;

    /**
     * The expected properties when assignment was made.
     */
    expectedProperties: string[];

    /**
     * Initializes a new instance of the [EntityAssignment](xref:botbuilder-dialogs-adaptive.EntityAssignment) class.
     *
     * @param assignment The entity assignment properties to set for this instance.
     */
    constructor(assignment: Partial<EntityAssignmentConfiguration>) {
        // Some properties are defined by `<prop> ?? undefined` in order to pass object equality checks.
        // Specifically, lodash's isEqual() will treat `{ a: undefined }` as not equal to `{ }`, so we explicitly add
        // the properties as `undefined` in order to pass equality checks when the instances are semantically equal.
        const newEntity: Partial<EntityAssignmentConfiguration> = {
            alternative: assignment.alternative ?? undefined,
            event: assignment.event ?? undefined,
            expectedProperties: assignment.expectedProperties ?? [],
            isExpected: assignment.isExpected ?? undefined,
            operation: assignment.operation ?? undefined,
            property: assignment.property ?? undefined,
            raisedCount: assignment.raisedCount ?? undefined,
            value: assignment.value ?? undefined,
        };
        Object.assign(this, newEntity);
    }

    /**
     * Gets the alternative entity assignments.
     *
     * @returns The alternative entity assigment.
     */
    get alternatives(): EntityAssignment[] {
        const alternatives = [];
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current: EntityAssignment = this;
        while (current) {
            alternatives.push(current);
            current = current.alternative;
        }

        return alternatives;
    }

    /**
     * Add alternatives to a single assignment.
     *
     * @param alternatives Alternatives to add.
     */
    addAlternatives(alternatives: EntityAssignment[]): void {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current: EntityAssignment = this;
        this.alternative = undefined;
        alternatives.forEach((alternative) => {
            if (!isEqual(this, alternative)) {
                current.alternative = alternative;
                current = alternative;
            }
        });
    }

    /**
     * Print an assignment as a string.
     *
     * @returns A string that represents the current object.
     */
    toString(): string {
        return `${this.isExpected ? '+' : ''}${this.event}: ${this.property} = ${this.operation}(${EntityInfo.toString(
            this.value
        )})`;
    }
}
