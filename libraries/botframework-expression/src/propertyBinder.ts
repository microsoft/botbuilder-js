import Dictionary from 'typescript-dotnet-umd/System/Collections/Dictionaries/Dictionary';

/**
 * Get the value of a property of an object
 */
export type GetValueDelegate = (instance: any, key: any) => any;

/**
 * Look up identifier binding from environment scope
 */
export abstract class PropertyBinder {
    public static Dictionary = (instance: any, property: any): GetValueDelegate => instance[ property as string];
    public static Reflection = (instance: any, property: any): GetValueDelegate => instance[property];
    public static Auto: GetValueDelegate = (instance: any, property: any) => {
        if (instance instanceof Dictionary) {
            return PropertyBinder.Dictionary(instance, property);
        } else if (instance instanceof Array) {
            return instance[property as number];
        }

        return PropertyBinder.Reflection(instance, property);
    }
}
