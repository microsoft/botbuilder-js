# botbuilder-runtime-core

The runtime core package is an internal only package. The API surface should not be considered public. The package purely serves to provide a small set of shared types and functionality to power the runtime and runtime plugins.

## IServices

`IServices` is the interface that describes the full set of things necessary for a runtime. Those things include an adapter, a bot, a storage instance, among many others.

## IConfiguration

`IConfiguration` is a simple interface with a single method, `get`. Runtime code depends on just this interface for configuration in order to be flexible and extensible. An implementation is provided by the `botbuilder-runtime` package.

## ServiceCollection

`ServiceCollection` serves as the glue between components that participate in the runtime. Instances or factory functions can be provided for every key defined in `Services`. Factory functions can express dependencies on other service instances that are necessary for construction. The dependency graph is then resolved to build instances of every service with a provided instance of factory function.

## Plugins

The `Plugin` type defines the API for plugins defined in packages. A plugin package must export a default function that accepts a `ServiceCollection` instance, along with a `Configuration` instance.
