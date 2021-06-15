"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCollection = void 0;
const assert_1 = __importDefault(require("assert"));
const dependency_graph_1 = require("dependency-graph");
const assert_2 = require("assert");
const util_1 = require("./util");
/**
 * ServiceCollection is an interface that describes a set of methods to register services. This, in a lighter way,
 * mimics the .NET dependency injection service collection functionality, except for instances rather than types.
 */
class ServiceCollection {
    /**
     * Construct a Providers instance
     *
     * @template S services interface
     * @param defaultServices default set of services
     */
    constructor(defaultServices = {}) {
        // We store the full set of dependencies as a workaround to the fact that `DepGraph` throws an error if you
        // attempt to register a dependency to a node that does not yet exist.
        this.dependencies = new Map();
        /**
         * `DepGraph` is a dependency graph data structure. In our case, the services we support are encoded as a
         * dependency graph where nodes are named with a key and store a list of factory methods.
         */
        this.graph = new dependency_graph_1.DepGraph();
        /**
         * Cache constructed instances for reuse
         */
        this.cache = {};
        Object.entries(defaultServices).forEach(([key, instance]) => {
            this.addInstance(key, instance);
        });
    }
    /**
     * Register an instance by key. This will overwrite existing instances.
     *
     * @param key key of the instance being provided
     * @param instance instance to provide
     * @returns this for chaining
     */
    addInstance(key, instance) {
        this.graph.addNode(key, [() => instance]);
        return this;
    }
    /**
     * @internal
     */
    addFactory(key, depsOrFactory, maybeFactory) {
        const dependencies = Array.isArray(depsOrFactory) ? depsOrFactory : undefined;
        let factory = maybeFactory;
        if (!factory && typeof depsOrFactory === 'function') {
            factory = (_services, value) => depsOrFactory(value);
        }
        // Asserts factory is not undefined
        assert_2.ok(factory, 'illegal invocation with undefined factory');
        if (dependencies) {
            this.dependencies.set(key, dependencies);
        }
        // If the graph already has this key, fetch its data and remove it (to be replaced)
        let factories = [];
        if (this.graph.hasNode(key)) {
            factories = this.graph.getNodeData(key);
            this.graph.removeNode(key);
        }
        // Note: we have done the type checking above, so disabling no-explicit-any is okay.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.graph.addNode(key, factories.concat(factory));
        return this;
    }
    /**
     * @internal
     */
    composeFactory(key, depsOrFactory, maybeFactory) {
        if (maybeFactory) {
            return this.addFactory(key, Array.isArray(depsOrFactory) ? depsOrFactory : [], (dependencies, value) => {
                assert_2.ok(value, `unable to create ${key}, initial value undefined`);
                return maybeFactory(dependencies, value);
            });
        }
        else {
            assert_2.ok(typeof depsOrFactory === 'function', 'illegal invocation with undefined factory');
            return this.addFactory(key, (value) => {
                assert_2.ok(value, `unable to create ${key}, initial value undefined`);
                return depsOrFactory(value);
            });
        }
    }
    // Register dependencies and then build nodes. Note: `nodes` is a function because ordering may
    // depend on results of dependency registration
    buildNodes(generateNodes, reuseServices = {}) {
        // Consume all dependencies and then reset so updating registrations without re-registering
        // dependencies works
        this.dependencies.forEach((dependencies, node) => dependencies.forEach((dependency) => this.graph.addDependency(node, util_1.stringify(dependency))));
        // Generate nodes after registering dependencies so ordering is correct
        const nodes = generateNodes();
        const services = nodes.reduce((services, service) => {
            // Extra precaution
            if (!this.graph.hasNode(service)) {
                return services;
            }
            // Helper to generate return value
            const assignValue = (value) => (Object.assign(Object.assign({}, services), { [service]: value }));
            // Optionally reuse existing service
            const reusedService = reuseServices[service];
            if (reusedService !== undefined) {
                return assignValue(reusedService);
            }
            // Each node stores a list of factory methods.
            const factories = this.graph.getNodeData(service);
            // Produce the instance by reducing those factories, passing the instance along for composition.
            const instance = factories.reduce((value, factory) => factory(services, value), services[service]);
            return assignValue(instance);
        }, {});
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
    makeInstance(key, deep = false) {
        // If this is not a deep reconstruction, reuse any services that `key` depends on
        let initialServices;
        if (!deep) {
            const _a = this.cache, _b = key, _ = _a[_b], cached = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
            initialServices = cached;
        }
        const services = this.buildNodes(() => this.graph.dependenciesOf(key).concat(key), initialServices);
        return services[key];
    }
    /**
     * Build a single service and assert that it is not undefined.
     *
     * @param key service to build
     * @param deep reconstruct all dependencies
     * @returns the service instance
     */
    mustMakeInstance(key, deep = false) {
        const instance = this.makeInstance(key, deep);
        assert_1.default.ok(instance, `\`${key}\` instance undefined!`);
        return instance;
    }
    /**
     * Build the full set of services.
     *
     * @returns all resolved services
     */
    makeInstances() {
        return this.buildNodes(() => this.graph.overallOrder());
    }
    /**
     * Build the full set of services, asserting that the specified keys are not undefined.
     *
     * @param keys instances that must be not undefined
     * @returns all resolve services
     */
    mustMakeInstances(...keys) {
        const instances = this.makeInstances();
        keys.forEach((key) => {
            assert_1.default.ok(instances[key], `\`${key}\` instance undefined!`);
        });
        return instances;
    }
}
exports.ServiceCollection = ServiceCollection;
//# sourceMappingURL=serviceCollection.js.map