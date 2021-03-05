// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import assert from 'assert';
import preduce from 'p-reduce';
import { DepGraph } from 'dependency-graph';
import { ok } from 'assert';
import { stringify } from './util';

/**
 * Factory describes a generic factory function signature. The type is generic over a few parameters:
 *
 * @template Services an interface describing a set of services
 * @template Service the service this factory produces
 * @template Must true if the `initialValue` passed to the factory must not be undefined
 */
export type Factory<Services, Service extends keyof Services, Must extends boolean> = (
    initialValue: Must extends true ? Services[Service] : Services[Service] | undefined
) => Services[Service] | Promise<Services[Service]>;

/**
 * DependencyFactory is a function signature that produces an instance that depends on a set of
 * other services. The type is generic over a few parameters:
 *
 * @template Services an interface describing a set of services
 * @template Service the service this factory produces
 * @template Dependencies the services this factory function depends on
 * @template Must true if the `initialValue` passed to the factory must not be undefined
 */
export type DependencyFactory<
    Services,
    Service extends keyof Services,
    Dependencies extends keyof Omit<Services, Service>,
    Must extends boolean
> = (
    dependencies: { [dependency in Dependencies]: Services[dependency] },
    initialValue: Must extends true ? Services[Service] : Services[Service] | undefined
) => Services[Service] | Promise<Services[Service]>;

/**
 * ServiceCollection is an interface that describes a set of methods to register services. This, in a lighter way,
 * mimics the .NET dependency injection service collection functionality, except for instances rather than types.
 */
export class ServiceCollection<S> {
    // We store the full set of dependencies as a workaround to the fact that `DepGraph` throws an error if you
    // attempt to register a dependency to a node that does not yet exist.
    private readonly dependencies = new Map<string, Array<keyof S>>();

    /**
     * `DepGraph` is a dependency graph data structure. In our case, the services we support are encoded as a
     * dependency graph where nodes are named with a key and store a list of factory methods.
     */
    private readonly graph = new DepGraph<
        Array<(dependencies: Partial<S>, initialValue: unknown) => unknown | Promise<unknown>>
    >();

    /**
     * Cache constructed instances for reuse
     */
    private cache: Partial<S> = {};

    /**
     * Construct a Providers instance
     *
     * @template S services interface
     * @param defaultServices default set of services
     */
    constructor(defaultServices: Partial<S> = {}) {
        Object.entries(defaultServices).forEach(([key, value]) => {
            // tsc doesn't infer these properly
            this.addInstance(key as keyof S, value as S[keyof S]);
        });
    }

    /**
     * Register an instance by key. This will overwrite existing instances.
     *
     * @param key key of the instance being provided
     * @param instance instance to provide
     * @returns this for chaining
     */
    addInstance<K extends keyof S>(key: K, instance: S[K]): this {
        this.graph.addNode(stringify(key), [() => instance]);
        return this;
    }

    /**
     * Register a factory for a key.
     *
     * @param key key that factory will provide
     * @param factory function that creates an instance to provide
     * @returns this for chaining
     */
    addFactory<K extends keyof S>(key: K, factory: Factory<S, K, false>): this;

    /**
     * Register a factory for a key with a set of dependencies.
     *
     * @param key key that factory will provide
     * @param dependencies set of things this instance depends on. Will be provided to factory function via `services`.
     * @param factory function that creates an instance to provide
     * @returns this for chaining
     */
    addFactory<K extends keyof S, D extends keyof Omit<S, K>>(
        key: K,
        dependencies: D[],
        factory: DependencyFactory<S, K, D, false>
    ): this;

    /**
     * @internal
     */
    addFactory<K extends keyof S, D extends keyof Omit<S, K>>(
        key: K,
        depsOrFactory: D[] | Factory<S, K, false>,
        maybeFactory?: DependencyFactory<S, K, D, false>
    ): this {
        const node = stringify(key);

        const dependencies = Array.isArray(depsOrFactory) ? depsOrFactory : undefined;

        let factory = maybeFactory;

        // Coerce factory form of (S[K]?) => S[K] into internal form of ({[d in D]: S[d]}, S[K]?) => S[K]
        // for consistent application in `buildServices`.
        if (!factory && typeof depsOrFactory === 'function') {
            factory = (_services, value) => depsOrFactory(value);
        }

        // Asserts factory is not undefined
        ok(factory, 'illegal invocation with undefined factory');

        if (dependencies) {
            this.dependencies.set(node, dependencies);
        }

        // If the graph already has this node, fetch its data and remove it (to be replaced)
        let factories: unknown[] = [];
        if (this.graph.hasNode(node)) {
            factories = this.graph.getNodeData(node);
            this.graph.removeNode(node);
        }

        // Note: we have done the type checking above, so disabling no-explicit-any is okay.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.graph.addNode(node, factories.concat(factory) as any);

        return this;
    }

    /**
     * Register a factory (that expects the initial value that is not undefined) for a key.
     *
     * @param key key of the instance being provided
     * @param instance instance to provide
     * @returns this for chaining
     */
    composeFactory<K extends keyof S>(key: K, factory: Factory<S, K, true>): this;

    /**
     * Register a factory (that expects an initial value that is not undefined) for a key
     * with a set of dependencies.
     *
     * @param key key that factory will provide
     * @param dependencies set of things this instance depends on. Will be provided to factory function via `services`.
     * @param factory function that creates an instance to provide
     * @returns this for chaining
     */
    composeFactory<K extends keyof S, D extends keyof Omit<S, K>>(
        key: K,
        dependencies: D[],
        factory: DependencyFactory<S, K, D, true>
    ): this;

    /**
     * @internal
     */
    composeFactory<K extends keyof S, D extends keyof Omit<S, K>>(
        key: K,
        depsOrFactory: D[] | Factory<S, K, true>,
        maybeFactory?: DependencyFactory<S, K, D, true>
    ): this {
        if (maybeFactory) {
            return this.addFactory<K, D>(
                key,
                Array.isArray(depsOrFactory) ? depsOrFactory : [],
                (dependencies, value) => {
                    ok(value, `unable to create ${key}, initial value undefined`);

                    return maybeFactory(dependencies, value);
                }
            );
        } else {
            ok(typeof depsOrFactory === 'function', 'illegal invocation with undefined factory');

            return this.addFactory<K>(key, (value) => {
                ok(value, `unable to create ${key}, initial value undefined`);

                return depsOrFactory(value);
            });
        }
    }

    // Register dependencies and then build nodes. Note: `nodes` is a function because ordering may
    // depend on results of dependency registration
    private async buildNodes(generateNodes: () => string[], reuseServices: Partial<S> = {}): Promise<Partial<S>> {
        // Consume all dependencies and then reset so updating registrations without re-registering
        // dependencies works
        this.dependencies.forEach((dependencies, node) =>
            dependencies.forEach((dependency) => this.graph.addDependency(node, stringify(dependency)))
        );

        // Generate nodes after registering dependencies so ordering is correct
        const nodes = generateNodes();

        const services = await preduce(
            nodes,
            async (services, node) => {
                // Extra precaution
                if (!this.graph.hasNode(node)) {
                    return services;
                }

                // Note: safe because of `hasNode` check above
                const service = node as keyof S;

                // Helper to generate return value
                const assignNodeValue = (value: unknown) => {
                    return {
                        ...services,
                        [service]: value,
                    };
                };

                // Optionally reuse existing service
                const reusedService = reuseServices[service];
                if (reusedService !== undefined) {
                    return assignNodeValue(reusedService);
                }

                // Each node stores a list of factory methods.
                const factories = this.graph.getNodeData(node);

                // Produce the instance by reducing those factories, passing the instance along for composition.
                const instance = await preduce(
                    factories,
                    (value, factory) => factory(services, value),
                    <unknown>services[service]
                );

                return assignNodeValue(instance);
            },
            <Partial<S>>{}
        );

        // Cache results for subsequent invocations that may desire pre-constructed instances
        Object.assign(this.cache, services);

        return services;
    }

    /**
     * Build a single service.
     *
     * @param key service to build
     * @param deep reconstruct all dependencies
     * @returns the service instance, or undefined
     */
    async makeInstance<K extends keyof S>(key: K, deep = false): Promise<S[K] | undefined> {
        const node = stringify(key);

        // If this is not a deep reconstruction, reuse any services that `key` depends on
        let initialServices: Partial<S> | undefined;
        if (!deep) {
            const { [key]: _, ...cached } = this.cache;
            initialServices = cached as Partial<S>; // tsc thinks Omit<Partial<S>, K> !== Partial<S> - silly!
        }

        const services = await this.buildNodes(() => this.graph.dependenciesOf(node).concat(node), initialServices);
        return services[key];
    }

    /**
     * Build a single service and assert that it is not undefined.
     *
     * @param key service to build
     * @param deep reconstruct all dependencies
     * @returns the service instance
     */
    async mustMakeInstance<K extends keyof S>(key: K, deep = false): Promise<S[K]> {
        const instance = await this.makeInstance(key, deep);
        assert.ok(instance, `\`${key}\` instance undefined!`);

        return instance;
    }

    /**
     * Build the full set of services.
     *
     * @returns all resolved services
     */
    makeInstances(): Promise<Partial<S>> {
        return this.buildNodes(() => this.graph.overallOrder());
    }

    /**
     * Build the full set of services, asserting that the specified keys are not undefined.
     *
     * @param keys instances that must be not undefined
     * @returns all resolve services
     */
    async mustMakeInstances<K extends keyof S>(...keys: K[]): Promise<{ [k in K]: S[k] } & Partial<Omit<S, K>>> {
        const instances = await this.makeInstances();

        keys.forEach((key) => {
            assert.ok(instances[key], `\`${key}\` instance undefined!`);
        });

        return instances as { [k in K]: S[k] } & Partial<Omit<S, K>>;
    }
}
