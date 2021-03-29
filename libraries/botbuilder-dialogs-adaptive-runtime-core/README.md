# botbuilder-dialogs-adaptive-runtime-core

The runtime core package is an internal only package. The API surface should not be considered public. The package purely serves to provide a small set of shared types and functionality to power the runtime and runtime plugins.

## ServiceCollection

`ServiceCollection` serves as the glue between components that participate in the runtime. Instances or factory functions can be provided. Factory functions can express dependencies on other service instances that are necessary for construction. The dependency graph is then resolved to build instances of every service with a provided instance of factory function.
