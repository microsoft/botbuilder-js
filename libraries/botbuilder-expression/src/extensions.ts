import { Constant } from './constant';
import { Expression } from './expression';
import { ExpressionType } from './expressionType';

export class Extensions {

    /**
     * Return the static reference paths to memory.
     * Return all static paths to memory.  If there is a computed element index, then the path is terminated there, 
     * but you might get other paths from the computed part as well.
     * @param expression Expression to get references from.
     * @returns Hash set of the static reference paths.
     */
    public static References(expression: Expression): ReadonlyArray<string> {
        let reference = new Set<string>();
        let path = this.ReferenceWalk(expression, reference);
        if (path !== undefined) {
            reference.add(path);
        }

        return Array.from(reference);
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
        let error: string;
        if (instance !== undefined) {
            //TODO
            if(instance instanceof Map && <Map<string, any>>instance.get(property) !== undefined) {
                value = <Map<string, any>>instance.get(property);
            } else {
                value = instance[property];
            }
        }

        return { value, error };
    }
}
