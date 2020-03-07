/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
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
     * @returns List of the static reference paths.
     */
    public static references(expression: Expression): string[] {
        const {path, refs} = this.referenceWalk(expression);
        if (path !== undefined) {
            refs.add(path);
        }
        return Array.from(refs);
    }

    /**
     * Patch method
     * TODO: is there any better solution?
     * To judge if an object is implements MemoryInterface. Same with 'is MemoryInterface' in C#
     */
    public static isMemoryInterface(obj: any): boolean {
        if (obj === undefined) {
            return false;
        }

        if (typeof obj !== 'object') {
            return false;
        }
        
        return 'getValue' in obj && 'setValue' in obj && 'version' in obj 
                && typeof obj.getValue === 'function' && typeof obj.setValue === 'function' && typeof obj.version === 'function';
    }

    /**
     * Walking function for identifying static memory references in an expression.
     * @param expression Expression to analyze.
     * @param references Tracking for references found.
     * @param extension If present, called to override lookup for things like template expansion.
     * @returns Accessor path of expression.
     */
    public static referenceWalk(expression: Expression,
        extension?: (arg0: Expression) => boolean): {path: string; refs: Set<string>} {
        let path: string;
        let refs = new Set<string>();
        if (extension === undefined || !extension(expression)) {
            const children: Expression[] = expression.children;
            if (expression.type === ExpressionType.Accessor) {
                const prop: string = (children[0] as Constant).value as string;

                if (children.length === 1) {
                    path = prop;
                }

                if (children.length === 2) {
                    ({path, refs} = Extensions.referenceWalk(children[1], extension));
                    if (path !== undefined) {
                        path = path.concat('.', prop);
                    }
                    // if path is null we still keep it null, won't append prop
                    // because for example, first(items).x should not return x as refs
                }
            } else if (expression.type === ExpressionType.Element) {
                ({path, refs}  = Extensions.referenceWalk(children[0], extension));
                if (path !== undefined) {
                    if (children[1] instanceof Constant) {
                        const cnst: Constant = children[1] as Constant;
                        if (cnst.returnType === ReturnType.String) {
                            path += `.${ cnst.value }`;
                        } else {
                            path += `[${ cnst.value }]`;
                        }
                    } else {
                        refs.add(path);
                    }
                }
                const result = Extensions.referenceWalk(children[1], extension);
                const idxPath = result.path;
                const refs1 = result.refs;
                refs = new Set([...refs, ...refs1]);
                if (idxPath !== undefined) {
                    refs.add(idxPath);
                } 
            } else if (expression.type === ExpressionType.Foreach || 
                    expression.type === ExpressionType.Where ||
                    expression.type === ExpressionType.Select ) {
                let result = Extensions.referenceWalk(children[0], extension);
                const child0Path = result.path;
                const refs0 = result.refs;
                if (child0Path !== undefined) {
                    refs0.add(child0Path);
                }

                result = Extensions.referenceWalk(children[2], extension);
                const child2Path = result.path;
                const refs2 = result.refs;
                if (child2Path !== undefined) {
                    refs2.add(child2Path);
                }

                const iteratorName = (children[1].children[0] as Constant).value as string;
                var nonLocalRefs2 = Array.from(refs2).filter((x): boolean => !(x === iteratorName || x.startsWith(iteratorName + '.') || x.startsWith(iteratorName + '[')));
                refs = new Set([...refs, ...refs0, ...nonLocalRefs2]);

            } else {
                for (const child of expression.children) {
                    const result = Extensions.referenceWalk(child, extension);
                    const childPath = result.path;
                    const refs0 = result.refs;
                    refs = new Set([...refs, ...refs0]);
                    if (childPath !== undefined) {
                        refs.add(childPath);
                    }
                }
            }
        }

        return {path, refs};
    }

    /**
     * Lookup a property in IDictionary, JObject or through reflection.
     * @param instance Instance with property.
     * @param property Property to lookup.
     * @returns Value and error information if any.
     */
    public static accessProperty(instance: any, property: string): { value: any; error: string } {
        // NOTE: This returns null rather than an error if property is not present
        if (!instance) {
            return { value: undefined, error: undefined };
        }

        let value: any;
        let error: string;
        // todo, Is there a better way to access value, or any case is not listed below?
        if (instance instanceof Map && instance as Map<string, any>!== undefined) {
            const instanceMap: Map<string, any> = instance as Map<string, any>;
            value = instanceMap.get(property);
            if (value === undefined) {
                const prop: string = Array.from(instanceMap.keys()).find((k: string): boolean => k.toLowerCase() === property.toLowerCase());
                if (prop !== undefined) {
                    value = instanceMap.get(prop);
                }
            }
        } else {
            const prop: string = Object.keys(instance).find((k: string): boolean => k.toLowerCase() === property.toLowerCase());
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
    public static setProperty(instance: any, property: string, value: any): { value: any; error: string } {
        const result: any = value;
        if (instance instanceof Map) {
            instance.set(property, value);
        } else {
            instance[property] = value;
        }

        return {value: result, error: undefined};
    }

    /**
     * Lookup a property in IDictionary, JObject or through reflection.
     * @param instance Instance with property.
     * @param property Property to lookup.
     * @returns Value and error information if any.
     */
    public static accessIndex(instance: any, index: number): { value: any; error: string } {
        // NOTE: This returns null rather than an error if property is not present
        if (instance === null || instance === undefined) {
            return { value: undefined, error: undefined };
        }

        let value: any;
        let error: string;

        let count = -1;
        if (Array.isArray(instance)) {
            count = instance.length;
        } else if (instance instanceof Map) {
            count = (instance as Map<string, any>).size;
        }
        const indexer: string[] = Object.keys(instance);
        if (count !== -1 && indexer.length > 0) {
            if (index >= 0 && count > index) {
                const idyn: any = instance;
                value = idyn[index];
            } else {
                error = `${ index } is out of range for ${ instance }`;
            }
        } else {
            error = `${ instance } is not a collection.`;
        }

        return { value, error };
    }
}
