/**
 * Factory describes a generic factory function signature. The type is generic over a few parameters:
 *
 * @template Type type the factory produces
 * @template Initial true if the `initialValue` passed to the factory must be defined
 */
export declare type Factory<Type, Initial extends boolean> = (initialValue: Initial extends true ? Type : Type | undefined) => Type;
/**
 * DependencyFactory is a function signature that produces an instance that depends on a set of
 * other services. The type is generic over a few parameters:
 *
 * @template Type type the factory produces
 * @template Dependencies the services this factory function depends on
 * @template Initial true if the `initialValue` passed to the factory must be defined
 */
export declare type DependencyFactory<Type, Dependencies, Initial extends boolean> = (dependencies: Dependencies, initialValue: Initial extends true ? Type : Type | undefined) => Type;
/**
 * ServiceCollection is an interface that describes a set of methods to register services. This, in a lighter way,
 * mimics the .NET dependency injection service collection functionality, except for instances rather than types.
 */
export declare class ServiceCollection {
    private readonly dependencies;
    /**
     * `DepGraph` is a dependency graph data structure. In our case, the services we support are encoded as a
     * dependency graph where nodes are named with a key and store a list of factory methods.
     */
    private readonly graph;
    /**
     * Cache constructed instances for reuse
     */
    private cache;
    /**
     * Construct a Providers instance
     *
     * @template S services interface
     * @param defaultServices default set of services
     */
    constructor(defaultServices?: Record<string, unknown>);
    /**
     * Register an instance by key. This will overwrite existing instances.
     *
     * @param key key of the instance being provided
     * @param instance instance to provide
     * @returns this for chaining
     */
    addInstance<InstanceType>(key: string, instance: InstanceType): this;
    /**
     * Register a factory for a key.
     *
     * @param key key that factory will provide
     * @param factory function that creates an instance to provide
     * @returns this for chaining
     */
    addFactory<InstanceType>(key: string, factory: Factory<InstanceType, false>): this;
    /**
     * Register a factory for a key with a set of dependencies.
     *
     * @param key key that factory will provide
     * @param dependencies set of things this instance depends on. Will be provided to factory function via `services`.
     * @param factory function that creates an instance to provide
     * @returns this for chaining
     */
    addFactory<InstanceType, Dependencies>(key: string, dependencies: string[], factory: DependencyFactory<InstanceType, Dependencies, false>): this;
    /**
     * Register a factory (that expects the initial value that is not undefined) for a key.
     *
     * @param key key of the instance being provided
     * @param instance instance to provide
     * @returns this for chaining
     */
    composeFactory<InstanceType>(key: string, factory: Factory<InstanceType, true>): this;
    /**
     * Register a factory (that expects an initial value that is not undefined) for a key
     * with a set of dependencies.
     *
     * @param key key that factory will provide
     * @param dependencies set of things this instance depends on. Will be provided to factory function via `services`.
     * @param factory function that creates an instance to provide
     * @returns this for chaining
     */
    composeFactory<InstanceType, Dependencies>(key: string, dependencies: string[], factory: DependencyFactory<InstanceType, Dependencies, true>): this;
    private buildNodes;
    /**
     * Build a single service.
     *
     * @param key service to build
     * @param deep reconstruct all dependencies
     * @returns the service instance, or undefined
     */
    makeInstance<InstanceType = unknown>(key: string, deep?: boolean): InstanceType | undefined;
    /**
     * Build a single service and assert that it is not undefined.
     *
     * @param key service to build
     * @param deep reconstruct all dependencies
     * @returns the service instance
     */
    mustMakeInstance<InstanceType = unknown>(key: string, deep?: boolean): InstanceType;
    /**
     * Build the full set of services.
     *
     * @returns all resolved services
     */
    makeInstances<InstancesType>(): InstancesType;
    /**
     * Build the full set of services, asserting that the specified keys are not undefined.
     *
     * @param keys instances that must be not undefined
     * @returns all resolve services
     */
    mustMakeInstances<InstancesType extends Record<string, unknown> = Record<string, unknown>>(...keys: string[]): InstancesType;
}
//# sourceMappingURL=serviceCollection.d.ts.map
