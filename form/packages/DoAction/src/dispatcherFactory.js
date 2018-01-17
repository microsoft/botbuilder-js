// Copyright (c) Microsoft Corporation. All rights reserved.

class DispatcherFactory {

    constructor () {
        this.factories = {};
    }

    register(typeName, factory) {
        if (typeName in this.factories) {
            throw new Error(`The type ${typeName} has already been registered with the "DispatcherFactory".`);
        }
        this.factories[typeName] = factory;
    }

    makeDispatcher(metadata) {
        const dispatchTable = [];
        for (let metadataEntry of metadata) {
            if (!metadataEntry.name) {
                throw new Error('Metadata entries require a name.');
            }
            dispatchTable.push({
                condition: {
                    execute: this.make(metadataEntry.if, metadataEntry.name)
                },
                action: {
                    name: metadataEntry.name,
                    execute: this.make(metadataEntry.do, metadataEntry.name)
                }
            });
        }
        return dispatchTable;
    }

    make(obj, name) {
        const typeName = obj.type;
        if (!typeName) {
            throw new Error(`The metadata entry ${name} does not have the required "type" property.`);
        }
        if (typeName in this.factories) {
            return this.factories[typeName](obj, name);
        }
        else {
            throw new Error(`The type ${typeName} has not been registered with the "DispatcherFactory".`);
        }
    }
}

module.exports.DispatcherFactory = DispatcherFactory;
