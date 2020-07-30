/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { EntityInfo } from './entityInfo';

export interface EntityAssignment {
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
     * Entity being assigned.
     */
    entity: Partial<EntityInfo>;

    /**
     * Alternative assignment.
     */
    alternative: Partial<EntityAssignment>;

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
     * Gets the alternative entity assignments.
     */
    public get alternatives(): Partial<EntityAssignment>[] {
        const alternatives = [];
        let current: Partial<EntityAssignment> = this;
        while (current) {
            alternatives.push(current);
            current = current.alternative;
        }

        return alternatives;
    }

    /**
     * Add alternatives to a single assignment.
     * @param alternatives Alternatives to add.
     */
    public addAlternatives(alternatives: Partial<EntityAssignment>[]): void {
        let current: Partial<EntityAssignment> = this;
        this.alternative = undefined;
        for (let i = 0; i < alternatives.length; i++) {
            const alternative = alternatives[i];
            if (alternative !== this) {
                current.alternative = alternative;
                current = alternative;
            }
        }
    }

    /**
     * Print an assignment as a string.
     * @param _this Source assignment.
     */
    public static toString(_this: Partial<EntityAssignment>): string {
        return `${ _this.isExpected ? '+' : '' }${ _this.property } = ${ _this.operation }(${ EntityInfo.toString(_this.entity) })`;
    }
}