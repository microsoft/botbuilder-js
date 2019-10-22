
/**
 * @module botbuilder-expression
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BuiltInFunctions } from './builtInFunction';
import { Constant } from './constant';
import { Expression, ReturnType } from './expression';
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
                        if (cnst.ReturnType === ReturnType.String) {
                            path += `.${cnst.Value}`;
                        } else {
                            path += `[${cnst.Value}]`;
                        }
                    } else {
                        references.add(path);
                    }
                }
                const idxPath: string = Extensions.ReferenceWalk(children[1], references, extension);
                if (idxPath !== undefined) {
                    references.add(idxPath);
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
        if (instance instanceof Map && <Map<string, any>>instance !== undefined) {
            const instanceMap: Map<string, any> = <Map<string, any>>instance;
            value = instanceMap.get(property);
            if (value === undefined) {
                const prop: string = Array.from(instanceMap.keys()).find((k: string) => k.toLowerCase() === property.toLowerCase());
                if (prop !== undefined) {
                    value = instanceMap.get(prop);
                }
            }
        } else {
            const prop: string = Object.keys(instance).find((k: string) => k.toLowerCase() === property.toLowerCase());
            if (prop !== undefined) {
                value = instance[prop];
            }
        }

        return { value, error };
    }

    /**
     * Set a property in Map or Object.
     * @param instance Instance to set.
     * @param property Property to set.
     * @param value Value to set.
     * @returns set value.
     */
    public static SetProperty(instance: any, property: string, value: any): any {
        const result: any = value;
        if (instance instanceof Map) {
            instance.set(property, value);
        } else {
            instance[property] = value;
        }

        return result;
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
