import { StatePropertyAccessor } from "./botStatePropertyAccessor";

export interface PropertyManager {
    /**
     * Create propertyAccessor for named property
     */
    createProperty<T = any>(name: string): StatePropertyAccessor<T>;
}