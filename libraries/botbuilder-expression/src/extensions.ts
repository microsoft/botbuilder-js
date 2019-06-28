
/**
 * @module botbuilder-expression
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BuiltInFunctions } from './buildInFunction';
import { Constant } from './constant';
import { Expression } from './expression';
import { ExpressionType } from './expressionType';

/**
 * Some util and extension functions
 */
export class Extensions {

    /**
     * Return the static reference paths to memory.
     * Return all static paths to memory.  If there is a computed element index, then the path is terminated there,
     * but you might get other paths from the computed part as well.
     * @param expression Expression to get references from.
     * @returns Hash set of the static reference paths.
     */
    public static References(expression: Expression): ReadonlyArray<string> {
        let references: Set<string> = new Set<string>();
        const path: string = this.ReferenceWalk(expression, references);
        if (path !== undefined) {
            references = references.add(path);
        }

        const filteredReferences: Set<string> = new Set<string>();
        references.forEach((x: string) => {
            if (!x.startsWith('$local.')) {
                if (x.startsWith('$global.')) {
                    filteredReferences.add(x.substr(8));
                } else {
                    filteredReferences.add(x);
                }
            }
        });

        return Array.from(filteredReferences);
    }

    /**
     * Walking function for identifying static memory references in an expression.
     * @param expression Expression to analyze.
     * @param references Tracking for references found.
     * @param extension If present, called to override lookup for things like template expansion.
     * @returns Accessor path of expression.
     */
    public static ReferenceWalk(expression: Expression, references: Set<string>,
                                extension?: (arg0: Expression) => boolean): string {
        let path: string;
        if (extension === undefined || !extension(expression)) {
            const children: Expression[] = expression.Children;
            if (expression.Type === ExpressionType.Accessor) {
                const prop: string = <string>((<Constant>(children[0])).Value);

                if (children.length === 1) {
                    path = prop;
                }

                if (children.length === 2) {
                    path = Extensions.ReferenceWalk(children[1], references, extension);
                    if (path !== undefined) {
                        path = path.concat('.', prop);
                    }
                     // if path is null we still keep it null, won't append prop
                     // because for example, first(items).x should not return x as refs
                }
            } else if (expression.Type === ExpressionType.Element) {
                path = Extensions.ReferenceWalk(children[0], references, extension);
                if (path !== undefined) {
                    if (children[1] instanceof Constant) {
                        const cnst: Constant = <Constant>children[1];
                        path += `[${cnst.Value}]`;
                    } else {
                        references.add(path);
                    }
                }
                const idxPath: string = Extensions.ReferenceWalk(children[1], references, extension);
                if (idxPath !== undefined) {
                    references.add(idxPath);
                }
            } else if (BuiltInFunctions.PrefixsOfShorthand.has(expression.Type)) {
                // Shorthand
                const shorthandName: string = (children[0] as Constant).Value.toString();
                if (shorthandName !== undefined) {
                    const prefixStr: string = BuiltInFunctions.PrefixsOfShorthand.get(expression.Type);
                    const reference: string = prefixStr + shorthandName;

                    references.add(reference);
                }
            } else {
                for (const child of expression.Children) {
                    const childPath: string = Extensions.ReferenceWalk(child, references, extension);
                    if (childPath !== undefined) {
                        references.add(childPath);
                    }
                }
            }
        }

        return path;
    }

    /**
     * Lookup a property in IDictionary, JObject or through reflection.
     * @param instance Instance with property.
     * @param property Property to lookup.
     * @returns Value and error information if any.
     */
    public static AccessProperty(instance: any, property: string): { value: any; error: string } {
        // NOTE: This returns null rather than an error if property is not present
        if (instance === null || instance === undefined) {
            return { value: undefined, error: undefined };
        }

        let value: any;
        // tslint:disable-next-line: prefer-const
        let error: string;
        // todo, Is there a better way to access value, or any case is not listed below?
        if (instance instanceof Map && <Map<string, any>>instance.get(property) !== undefined) {
            value = <Map<string, any>>instance.get(property);
        } else {
            value = instance[property];
        }

        return { value, error };
    }

    /**
     * Lookup a property in IDictionary, JObject or through reflection.
     * @param instance Instance with property.
     * @param property Property to lookup.
     * @returns Value and error information if any.
     */
    public static AccessIndex(instance: any, index: number): { value: any; error: string } {
        // NOTE: This returns null rather than an error if property is not present
        if (instance === null || instance === undefined) {
            return { value: undefined, error: undefined };
        }

        let value: any;
        let error: string;

        let count: number = -1;
        if (instance instanceof Array) {
            count = (instance).length;
        } else if (instance instanceof Map) {
            count = (<Map<string, any>>instance).size;
        }
        const indexer: string[] = Object.keys(instance);
        if (count !== -1 && indexer.length > 0) {
            if (index >= 0 && count > index) {
                const idyn: any = instance;
                value = idyn[index];
            } else {
                error = `${index} is out of range for ${instance}`;
            }
        } else {
            error = `${instance} is not a collection.`;
        }

        return { value, error };
    }
}
