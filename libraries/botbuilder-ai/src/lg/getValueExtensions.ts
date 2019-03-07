import { GetValueDelegate, PropertyBinder } from "botframework-expression";
import { Evaluator } from "./evaluator";

export class GetValueExtensions {
    private readonly evaluator: Evaluator;

    public constructor(evaluator: Evaluator) {
        this.evaluator = evaluator;
    }

    public GetValueX: GetValueDelegate = (instance: any, property: any) => {
        try {
            const result = PropertyBinder.Auto(instance, property);

            if (result === undefined) {
                throw new Error();
            }

            return result;
        } catch (error) {
            if (typeof (property) === "string") {
                if (this.evaluator.Context.TemplateContexts[property] !== undefined) {
                    return property;
                }
            }
            return instance[property];
        }
    }
}
