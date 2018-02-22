/**
 * @module botbuilder
 */
/** second comment block */
import { Entity } from 'botframework-schema';
/**
 * A strongly typed entity.
 */
export interface EntityObject<T> extends Entity {
    /** Type of entity */
    type: string;
    /** Value of the entity. */
    value: T;
    /** (Optional) the recognizers confidence that this entity matches the users intent. */
    score?: number;
}
/** Well known entity types. */
export declare const EntityTypes: EntityTypes;
