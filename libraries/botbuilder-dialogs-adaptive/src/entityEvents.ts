/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { EntityAssignment, AssignEntityOperations } from './entityAssignment';
import { DialogContext, DialogPath } from 'botbuilder-dialogs';
import { AdaptiveEvents } from './adaptiveEvents';
import { NormalizedEntityInfos, EntityInfo } from './entityInfo';
import { SchemaHelper } from './schemaHelper';

const EVENT_QUEUES: string = 'this.events';

export interface EntityEvents {
    /**
     * List of mappings where a property is ready to be set to a specific entity.
     */
    assignEntities: Partial<EntityAssignment>[];

    /**
     * List of ambiguous entities and the property they should be assigned to.
     */
    chooseEntities: Partial<EntityAssignment>[];

    /**
     * List of entities that can be consumed by more than one property.
     */
    chooseProperties: Partial<EntityAssignment>[][];

    /**
     * List of properties to clear.
     */
    clearProperties: string[];
}

export class EntityEvents {
    /**
     * Creates a new `EntityEvents` instance.
     */
    public static create(): EntityEvents {
        return {
            assignEntities: [],
            chooseEntities: [],
            chooseProperties: [],
            clearProperties: []
        }
    }

    /**
     * Read event queues from memory. 
     * @param dc Context for current turn of conversation.
     */
    public static read(dc: DialogContext): EntityEvents {
        let events = dc.state.getValue(EVENT_QUEUES);
        if (!events) {
            events = EntityEvents.create();
        }

        return events;
    }

    /**
     * Save event queues to memory.
     * @param dc Context for current turn of conversation.
     * @param events Event queues to save.
     */
    public static write(dc: DialogContext, events: EntityEvents): void {
        dc.state.setValue(EVENT_QUEUES, events);
    }

    /**
     * Remove an event result from queues.
     * @param _this Source event queues. 
     * @param eventName Event to remove.
     * @returns True if the specified event was found.
     */
    public static dequeueEvent(_this: EntityEvents, eventName: string): boolean {
        if (!Array.isArray(_this[eventName])) {
            return false;
        }

        // Remove first item from queue
        const queue: EntityAssignment[] = _this[eventName];
        queue.shift();

        return true;
    }

    /**
     * @private
     * Assigns a mapping to the appropriate queue.
     * @param _this Source event queues. 
     * @param mapping Mapping to queue.
     */
    public static addMappingToQueue(_this: EntityEvents, mapping: Partial<EntityAssignment>): void {
        // TODO: Should this normalization be moved to normalizeEntities() ?
        if (Array.isArray(mapping.entity.value)) {
            if (mapping.entity.value.length > 1) {
                _this.chooseEntities.push(mapping);
            } else {
                mapping.entity.value = mapping.entity.value[0];
                _this.assignEntities.push(mapping);
            }
        } else {
            _this.assignEntities.push(mapping);
        }
    }

    /**
     * @private
     * Assigns entities to their appropriate queues.
     * @param _this Source event queues. 
     * @param dc Current dialog context.
     * @param entities Set of normalized entities to assign.
     * @param expected List of expected properties.
     * @param lastEvent The last event that was processed.
     * @param dialogSchema Dialog schema.
     */
    public static addToQueues(_this: EntityEvents, dc: DialogContext, entities: NormalizedEntityInfos, expected: string[], lastEvent: string, dialogSchema: SchemaHelper): Partial<EntityInfo>[] {
        // Find a filtered and sorted list of candidates
        // - All candidates with isExpected == true will be first.
        let candidates = EntityAssignment.findCandidates(entities, expected, dialogSchema);
        candidates = EntityAssignment.removeOverlappingPerProperty(candidates, dialogSchema);
        candidates = candidates.sort((a, b) => (a.isExpected === b.isExpected) ? 0 : (a.isExpected ? -1 : 1));

        const usedEntities: Map<string, Partial<EntityInfo>> = new Map();
        while (candidates.length > 0) {
            const candidate = candidates[0];

            // Find alternatives for current entity and remove from candidates pool.
            let alternatives: Partial<EntityAssignment>[] = [];
            const remaining: Partial<EntityAssignment>[] = [];
            candidates.forEach((alt) => {
                if (EntityInfo.overlaps(candidate.entity, alt.entity)) {
                    alternatives.push(alt);
                } else {
                    remaining.push(alt);
                }
            });
            candidates = remaining;

            // If expected binds entity, drop alternatives
            if (candidate.isExpected && candidate.entity.name != "utterance") {
                alternatives = alternatives.filter(a => a.isExpected);
            }

            // Process any disambiguation task.
            let mapped = false;
            if (lastEvent == AdaptiveEvents.chooseEntity && candidate.property == _this.chooseEntities[0].property) {
                // Property has resolution so remove entity ambiguity
                _this.chooseEntities.shift();
                lastEvent = undefined;
            } else if (lastEvent == AdaptiveEvents.chooseProperty && candidate.entity.name == "PROPERTYName") {
                // NOTE: This assumes the existence of an entity named PROPERTYName for resolving this ambiguity
                // See if one of the choices corresponds to an alternative
                const choices = _this.chooseProperties[0];
                const entity = Array.isArray(candidate.entity.value) ? candidate.entity.value[0] : candidate.entity.value.toString();
                const choice = choices.find(p => p.property == entity);
                if (choice) {
                    // Resolve choice and add to queues
                    _this.chooseProperties.shift();
                    dc.state.setValue(DialogPath.expectedProperties, [choice.property]);
                    choice.isExpected = true;
                    EntityEvents.addMappingToQueue(_this, choice);
                    mapped = true;
                }
            }

            // Update set of used entities
            let entity = candidate.entity;
            if (!usedEntities.has(entity.name)) { usedEntities.set(entity.name, entity) }
            alternatives.forEach((alt) => {
                entity = alt.entity;
                if (!usedEntities.has(entity.name)) { usedEntities.set(entity.name, entity) }
            });

            // Add to appropriate queue
            if (!mapped) {
                if (alternatives.length == 1) {
                    EntityEvents.addMappingToQueue(_this, candidate);
                } else {
                    // Needs disambiguation
                    _this.chooseProperties.push(alternatives);
                }
            }
        }

        // Sort returned entities by start position
        return Array.from(usedEntities.values()).sort((a, b) => a.start - b.start);
    }

    /**
     * @private
     * Create a set of queues for each property.
     * @param _this Source event queues. 
     */
    public static createPerPropertyQueues(_this: EntityEvents): { [path: string]: EntityEvents } {
        const propertyToQueues: { [path: string]: EntityEvents } = {};

        function propertyQueues(path: string): EntityEvents {
            if (!propertyToQueues.hasOwnProperty(path)) {
                propertyToQueues[path] = EntityEvents.create();
            }

            return propertyToQueues[path];
        }

        _this.assignEntities.forEach((entry) => {
            propertyQueues(entry.property).assignEntities.push(entry);
        });

        _this.chooseEntities.forEach((entry) => {
            propertyQueues(entry.property).chooseEntities.push(entry);
        });

        _this.clearProperties.forEach((entry) => {
            propertyQueues(entry).clearProperties.push(entry);
        });

        _this.chooseProperties.forEach((entry) => {
            entry.forEach((choice) => {
                propertyQueues(choice.property).chooseProperties.push(entry);
            });
        });

        return propertyToQueues;
    }

    /**
     * @private
     * @param _this Source event queues. 
     * @param dialogSchema Dialog schema.
     */
    public static combineNewEntityProperties(_this: EntityEvents, dialogSchema: SchemaHelper): void {
        const propertyToQueues = EntityEvents.createPerPropertyQueues(_this);
        for (const path in propertyToQueues) {
            const property = dialogSchema.pathToSchema(path);
            const propertyQueues = propertyToQueues[path];
            if (!property.isArray && propertyQueues.assignEntities.length + propertyQueues.chooseEntities.length > 1) {
                // Combine queues
                const union: Map<string, Partial<EntityAssignment>> = new Map();
                propertyQueues.assignEntities.forEach((entry) => {
                    if (!union.has(entry.property)) { union.set(entry.property, entry) }
                });
                propertyQueues.chooseEntities.forEach((entry) => {
                    if (!union.has(entry.property)) { union.set(entry.property, entry) }
                });

                // Filter out remove operations
                const mappings = Array.from(union.values()).filter((entry) => entry.operation != AssignEntityOperations.remove);
                switch (mappings.length) {
                    case 0:
                        _this.clearProperties.push(property.path);
                        break;
                    case 1:
                        EntityEvents.addMappingToQueue(_this, mappings[0]);
                        break;
                    default:
                        // TODO: Map to multiple entity to property
                        /* queues.ChooseProperties.Add(new EntitiesToProperty
                        {
                            Entities = (from mapping in mappings select mapping.Entity).ToList(),
                            Property = mappings.First().Change
                        }); */
                        break;
                }
            }
        }

        // TODO: There is a lot more we can do here
    }

    /**
     * @private
     * @param _this Source event queues. 
     * @param eventCounter Current turn number.
     * @param dialogSchema Dialog schema.
     */
    public static combineOldEntityToProperties(_this: EntityEvents, eventCounter: number, dialogSchema: SchemaHelper): void {
        const propertyToQueues = EntityEvents.createPerPropertyQueues(_this);
        for (const path in propertyToQueues) {
            const property = dialogSchema.pathToSchema(path);
            const propertyQueues = propertyToQueues[path];
            const assignEntities = propertyQueues.assignEntities.filter(e => e.entity.whenRecognized == eventCounter);
            const chooseEntities = propertyQueues.chooseEntities.filter(e => e.entity.whenRecognized == eventCounter);
            const chooseProperties = propertyQueues.chooseProperties.filter(e => e[0].entity.whenRecognized == eventCounter);
            if (!property.isArray &&
                (assignEntities.length > 0
                    || chooseEntities.length > 0
                    || chooseProperties.length > 0)) {
                // Remove all old operations on property because there is a new one
                propertyQueues.assignEntities = assignEntities;
                propertyQueues.chooseEntities = chooseEntities;
                propertyQueues.chooseProperties = chooseProperties;

            }
        }
    }

    /**
     * @private
     * Assign entities to queues
     * @param _this Source event queues. 
     * @param dc Current dialog context.
     * @param entities Set of normalized entities to assign.
     * @param expected List of expected properties.
     * @param lastEvent The last event that was processed.
     * @param dialogSchema Dialog schema.
     */
    public static assignEntities(_this: EntityEvents, dc: DialogContext, entities: NormalizedEntityInfos, expected: string[], lastEvent: string, dialogSchema: SchemaHelper): Partial<EntityInfo>[] {
        const recognized = EntityEvents.addToQueues(_this, dc, entities, expected, lastEvent, dialogSchema);
        EntityEvents.combineNewEntityProperties(_this, dialogSchema);

        return recognized;
    }
}