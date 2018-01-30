/**
 * @module botbuilder-choices
 */
/** second comment block */


export interface ModelResult<T extends Object = {}> {

    text: string;

    start: number;

    end: number;

    typeName: string;

    resolution: T;
}
