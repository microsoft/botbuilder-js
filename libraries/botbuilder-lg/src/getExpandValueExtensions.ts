import { GetValueDelegate, PropertyBinder } from 'botframework-expression';
import { Expander } from './expander';

export class GetValueExtensions {
    private readonly expander: Expander;

    public constructor(expander: Expander) {
        this.expander = expander;
    }

    public GetValueX: GetValueDelegate = (instance: any, property: any) => {
        try {
            const result: any = PropertyBinder.Auto(instance, property);

            if (result === undefined) {
                throw new Error();
            }

            return result;
        } catch (error) {
            if (typeof (property) === 'string') {
                if (this.expander.Context.TemplateContexts.has(property)) {
                    return property;
                }
            }

            return instance[property];
        }
    }
}
