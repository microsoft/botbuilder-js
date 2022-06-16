/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Extended information about an entity including $instance data.
 */
export interface EntityInfo {
    /**
     * Name of entity.
     */
    name: string;

    /**
     * Value of entity.
     */
    value: any;

    /**
     * Value of property if any.
     */
    property: string;

    /**
     * Operation to apply to entity.
     */
    operation: string;

    /**
     * Position where entity starts in utterance.
     */
    start: number;

    /**
     * Position where entity ends in utterance.
     */
    end: number;

    /**
     * Score (0-1.0) of entity.
     */
    score: number;

    /**
     * Original text that led to entity.
     */
    text: string;

    /**
     * Root entity where this entity was found.
     */
    rootEntity: string;

    /**
     * Type of entity.
     */
    type: string;

    /**
     * Relative priority of entity compared to other entities with 0 being highest priority.
     */
    priority: number;

    /**
     * How much (0-1.0) of the original utterance is covered by entity.
     */
    coverage: number;

    /**
     * Event counter when entity was recognized.
     */
    whenRecognized: number;
}

/**
 * @private
 */
export interface NormalizedEntityInfos {
    [name: string]: Partial<EntityInfo>[];
}

/**
 * Extended information about an entity including $instance data.
 */
export class EntityInfo {
    /**
     * Print an entity as a string.
     *
     * @param source Source entity.
     * @returns A string that represents the current object.
     */
    static toString(source: Partial<EntityInfo>): string {
        return `${source.name}:${source.value} P${source.priority} ${source.score} ${source.coverage}`;
    }

    /**
     * Returns true if entities share text in utterance.
     *
     * @param source Source entity.
     * @param entity Entity to compare.
     * @returns True if entities share text in utterance, otherwise false.
     */
    static overlaps(source: Partial<EntityInfo>, entity: Partial<EntityInfo>): boolean {
        return source.start <= entity.end && source.end >= entity.start;
    }

    /**
     * Returns true if entities come from exactly the same text in the utterance.
     *
     * @param source Source entity.
     * @param entity Entity to compare.
     * @returns True if entities come from the exactly same text in utterance, otherwise false.
     */
    static alternative(source: Partial<EntityInfo>, entity: Partial<EntityInfo>): boolean {
        return source.start == entity.start && source.end == entity.end;
    }

    /**
     * Returns true entity text completely includes another entity text.
     *
     * @param source Source entity.
     * @param entity Entity to compare.
     * @returns True if the entity text completely includes another entity text, otherwise false.
     */
    static covers(source: Partial<EntityInfo>, entity: Partial<EntityInfo>): boolean {
        return (
            source.start <= entity.start &&
            source.end >= entity.end &&
            source.end - source.start > entity.end - entity.start
        );
    }

    /**
     * Returns true if entities share the same root.
     *
     * @param source Source entity.
     * @param entity Entity to compare.
     * @returns True if entities share the same root, otherwise false.
     */
    static sharesRoot(source: Partial<EntityInfo>, entity: Partial<EntityInfo>): boolean {
        return source.rootEntity === entity.rootEntity;
    }

    /**
     * Returns true if entities are the same.
     *
     * @param source Source entity.
     * @param entity Entity to compare.
     * @returns True if entities are the same, otherwise false.
     */
    static isSameEntity(source: Partial<EntityInfo>, entity: Partial<EntityInfo>): boolean {
        return EntityInfo.sharesRoot(source, entity) && EntityInfo.alternative(source, entity);
    }

    /**
     * @private
     * Remove any entities that overlap a selected entity.
     * @param source Source entity.
     * @param entities Normalized set of entities to modify.
     */
    static removeOverlappingEntities(source: EntityInfo, entities: NormalizedEntityInfos): void {
        for (const name in entities) {
            const infos = entities[name];
            if (Array.isArray(infos)) {
                entities[name] = infos.filter((e) => !EntityInfo.overlaps(e, source));
            }
        }
    }
}
