import { Expression } from "./expression";
import { ExpressionType } from "./expressionType";
import { Constant } from "./constant";

export class Extensions {
    public static References(expression: Expression) : ReadonlyArray<string> {
        let reference = new Set<string>();
        let path = this.ReferenceWalk(expression, reference);
        if(path !== undefined) {
            reference.add(path);
        }

        return Array.from(reference);
    }
    
    public static  ReferenceWalk(expression: Expression, references: Set<string>, 
        extension: (arg0: Expression) => boolean = undefined) : string {
            let path: string = undefined;
            if(extension === undefined || !extension(expression)) {
                let children = expression.Children;
                if(expression.Type === ExpressionType.Accessor) {
                    if(children.length === 2) {
                        path = Extensions.ReferenceWalk(children[1], references, extension);
                    }
                    let prop: string = String((children[0] as Constant).Value);
                    path = path === undefined ? prop : path + "." + prop;
                }
                else if(expression.Type === ExpressionType.Element) {
                    path = Extensions.ReferenceWalk(children[0], references, extension);
                    if(path !== undefined) {
                        if(children[1] instanceof Constant){
                            let cnst = children[1] as Constant;
                            path += `[${cnst.Value}]`;
                        }
                        else {
                            references.add(path);
                        }
                    }
                    let idxPath: string = Extensions.ReferenceWalk(children[1], references, extension);
                    if(idxPath !== undefined) {
                        references.add(idxPath);
                    }
                }
                else {
                    for (const child of expression.Children) {
                        let childPath : string = Extensions.ReferenceWalk(child, references, extension);
                        if(childPath !== undefined) {
                            references.add(childPath);
                        }
                    }
                }
            }
        return path;
    }

    public static AccessProperty(instance: any, property: string, expression: Expression = undefined): {value: any; error: string} {
        let value: any = undefined;
        let error: string = undefined;
        if(instance !== undefined) {
            Map 
            // TODO
            value = instance[property];
        }
        return {value, error};
    }
}