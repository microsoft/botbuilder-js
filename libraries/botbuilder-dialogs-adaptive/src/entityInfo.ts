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
     * Normalizes the entities returned from a recognizer.
     * @remarks
     * We have four kinds of ambiguity to deal with:
     * - Entity: Ambiguous interpretation of entity value: (peppers -> [green peppers, red peppers]  Tell this by entity value is array.  Doesn't matter if property singleton or not. Ask.
     * - Text: Ambiguous interpretation of text: (3 -> age or number) Identify by overlapping entities. Resolve by greater coverage, expected entity, ask.
     * - Singleton: two different entities which could fill property singleton.  Could be same type or different types.  Resolve by rule priority.
     * - Property: Which property should an entity go to?  Resolve by expected, then ask.
     * @param recognized Recognizer results to normalize.
     * @param eventCounter Watermark for the current turn.
     */
    public static normalizeEntities(actionContext: ActionContext): NormalizedEntityInfos {
        const entityToInfo: NormalizedEntityInfos = {};
        const recognized = actionContext.state.getValue(TurnPath.recognized);
        const text = recognized.text;
        const entities: { [name: string]: any[] } = recognized.entities || {};
        const turn = actionContext.state.getValue(DialogPath.eventCounter);
        const metaData = entities['$instance'] as object;
        for (const name in entities) {
            const values = entities[name];
            if (!name.startsWith('$') && Array.isArray(values)) {
                const instances: any[] = metaData ? metaData[name] : undefined;
                for (var i = 0; i < values.length; ++i) {
                    const val = values[i];
                    const instance: any = instances ? instances[i] : {};

                    // Create info(s) array on first access
                    if (!entityToInfo.hasOwnProperty(name)) {
                        entityToInfo[name] = [];
                    }

                    // Initialize info object
                    const info: Partial<EntityInfo> = {
                        whenRecognized: turn,
                        name: name,
                        value: val,
                        start: instance['startIndex'] || 0,
                        end: instance['endIndex'] || 0,
                        text: instance['text'] || '',
                        type: instance['type'],
                        role: instance['role'],
                        score: instance['score'] || 0.0,
                    };

                    // Set priority and calculate coverage
                    info.priority = info.role == undefined ? 1 : 0;
                    info.coverage = (info.end - info.start) / text.length;

                    // Save to map
                    entityToInfo[name].push(info);
                }
            }
        }

        // When there are multiple possible resolutions for the same entity that overlap, pick the 
        // one that covers the most of the utterance.
        for (const name in entityToInfo) {
            const infos = entityToInfo[name];
            infos.sort((entity1, entity2) => {
                let val = 0;
                if (entity1.start == entity2.start) {
                    if (entity1.end > entity2.end) {
                        val = -1;
                    } else if (entity1.end < entity2.end) {
                        val = +1;
                    }
                } else if (entity1.start < entity2.start) {
                    val = -1;
                } else {
                    val = +1;
                }

                return val;
            });
            for (let i = 0; i < infos.length; ++i) {
                const current = infos[i];
                for (let j = i + 1; j < infos.length;) {
                    const alt = infos[j];
                    if (EntityInfo.covers(current, alt)) {
                        infos.splice(j, 1);
                    } else {
                        ++j;
                    }
                }
            }
        }

        return entityToInfo;
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
