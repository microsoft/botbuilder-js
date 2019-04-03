import { Constant } from './constant';
import { Expression } from './expression';
import { ExpressionType } from './expressionType';

export class Extensions {
    public static References(expression: Expression) : ReadonlyArray<string> {
        let reference = new Set<string>();
        let path = this.ReferenceWalk(expression, reference);
        if (path !== undefined) {
            reference.add(path);
        }

        return Array.from(reference);
    }

    public static  ReferenceWalk(expression: Expression, references: Set<string>,
                                 extension?: (arg0: Expression) => boolean) : string {
            let path: string;
            if (extension === undefined || !extension(expression)) {
                const children: Expression[] = expression.Children;
                if (expression.Type === ExpressionType.Accessor) {
                    if (children.length === 2) {
                        path = Extensions.ReferenceWalk(children[1], references, extension);
                    }
                    const prop: string = String((<Constant>children[0]).Value);
                    path = path === undefined ? prop : path.concat('.' , prop);
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
                        const childPath : string = Extensions.ReferenceWalk(child, references, extension);
                        if (childPath !== undefined) {
                            references.add(childPath);
                        }
                    }
                }
            }

            return path;
    }

    public static AccessProperty(instance: any, property: string, expression?: Expression): {value: any; error: string} {
        let value: any;
        let error: string;
        if (instance !== undefined) {
            // TODO
            value = instance[property];
        }

        return {value, error};
    }
}
