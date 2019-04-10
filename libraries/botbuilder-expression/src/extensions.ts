
/**
 * @module botbuilder-expression
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
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
        let reference: Set<string> = new Set<string>();
        const path: string = this.ReferenceWalk(expression, reference);
        if (path !== undefined) {
            reference = reference.add(path);
        }

        return Array.from(reference);
    }

    /**
     * Do a deep equality between expressions.
     * @param expr Base expression.
     * @param other Other expression.
     * @returns True if expressions are the same.
     */
    public static DeepEquals(expr: Expression, other: Expression): boolean {
        let eq: boolean = true;
        if (expr !== undefined && other !== undefined) {
            eq = expr.Type === other.Type;
            if (eq) {
                if (expr.Type === ExpressionType.Constant) {
                    const val: any = (<Constant>expr).Value;
                    const otherVal: any = (<Constant>other).Value;
                    eq = val === otherVal || (val !== undefined && val === otherVal);
                } else {
                    eq = expr.Children.length === other.Children.length;
                    for (let i: number = 0; i < expr.Children.length; ++i) {
                        eq = Extensions.DeepEquals(expr.Children[i], other.Children[i]);
                    }
                }
            }
        }

        return eq;
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
                if (children.length === 2) {
                    path = Extensions.ReferenceWalk(children[1], references, extension);
                }
                const prop: string = String((<Constant>children[0]).Value);
                path = path === undefined ? prop : path.concat('.', prop);
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
     * @param expression Expression that generated instance.
     * @returns Value and error information if any.
     */
    public static AccessProperty(instance: any, property: string, expression?: Expression): { value: any; error: string } {
        let value: any;
        // tslint:disable-next-line: prefer-const
        let error: string;
        if (instance !== undefined) {
            // todo, Is there a better way to access value, or any case is not listed below?
            if (instance instanceof Map && <Map<string, any>>instance.get(property) !== undefined) {
                value = <Map<string, any>>instance.get(property);
            } else {
                value = instance[property];
            }
        }

        return { value, error };
    }
}
