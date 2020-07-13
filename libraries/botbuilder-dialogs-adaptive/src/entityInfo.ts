/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnPath, DialogPath } from 'botbuilder-dialogs';
import { ActionContext } from './actionContext';

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
     * Role the entity played in utterance.
     */
    role: string;

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

export class EntityInfo {
    /**
     * Print an entity as a string.
     * @param _this Source entity.
     */
    public static toString(_this: Partial<EntityInfo>): string {
        return `${ _this.name }:${ _this.value } P${ _this.priority } ${ _this.score } ${ _this.coverage }`;
    }

    /**
     * Returns true if entities share text in utterance.
     * @param _this Source entity. 
     * @param entity Entity to compare.
     */
    public static overlaps(_this: Partial<EntityInfo>, entity: Partial<EntityInfo>): boolean {
        return _this.start <= entity.end && _this.end >= entity.start;
    }

    /**
     * Returns true if entities come from exactly the same text in the utterance.
     * @param _this Source entity. 
     * @param entity Entity to compare.
     */
    public static alternative(_this: Partial<EntityInfo>, entity: Partial<EntityInfo>): boolean {
        return _this.start == entity.start && _this.end == entity.end;
    }

    /**
     * Returns true entity text completely includes another entity text.
     * @param _this Source entity. 
     * @param entity Entity to compare.
     */
    public static covers(_this: Partial<EntityInfo>, entity: Partial<EntityInfo>): boolean {
        return _this.start <= entity.start && _this.end >= entity.end && _this.end - _this.start > entity.end - entity.start;
    }

    /**
     * @private
     * Remove any entities that overlap a selected entity.
     * @param _this Source entity. 
     * @param entities Normalized set of entities to modify.
     */
    public static removeOverlappingEntities(_this: EntityInfo, entities: NormalizedEntityInfos): void {
        for (const name in entities) {
            const infos = entities[name];
            if (Array.isArray(infos)) {
                entities[name] = infos.filter((e) => !EntityInfo.overlaps(e, _this));
            }
        }
    }
}
