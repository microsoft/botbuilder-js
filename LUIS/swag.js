/**
 * Script for parsing the swagger.json and
 * generating the services, data models commands
 * the manifest.
 *
 * Command pattern is: <api group> <action> <target> <subtarget> --<args>
 */

const swagger = require('./swagger');
const fs = require('fs-extra');
const cc = require('camelcase');
const {OperationCommandMap} = require('./lib/enums/operationCommandMap');

/**
 * Services template extends ServiceBase
 */
const classTpl = (cfg) => {
    return `const {ServiceBase} = require('../serviceBase');
class ${cfg.className} extends ServiceBase {
    constructor() {
        super('${cfg.url}');
    }
${operationTpl(cfg.operations)}
}
module.exports = ${cfg.className};
`;
};

/**
 * Operation method template. Used to populate the
 * operations array used in the classTpl
 */
const operationTpl = (operations) => {
    let tpl = '';
    operations.forEach(operation => {
        tpl += `
    /**
    * ${operation.description}
    */
    async ${operation.name}(params${operation.entityName ? ` , ${operation.entityName}` : ''}${(operation.entityType ? `/* ${operation.entityType} */` : '')}) {
        return this.createRequest('${operation.pathFragment}', params, '${operation.method}'${operation.entityName ? ', ' + operation.entityName : ''});
    }`;
    });
    return tpl;
};

/**
 * Data model template. All data models
 *
 * have 2 ways to hydrate data:
 * 1. pass an object into the constructor
 * 2. use the static fromJSON() method
 *
 * Either way, only the properties that are
 * passed to the body of the request are extracted
 */
const modelTpl = (modelCfg) => `
${modelCfg.imports.toString().replace(/[,]/g, '')}
class ${modelCfg.className} {
    ${modelCfg.docBlocks.toString().replace(/[,]/g, '')}
    
    constructor({${modelCfg.props}} = {}) {
        Object.assign(this, {${modelCfg.props}});
    }
}
${modelCfg.className}.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(${modelCfg.className}.fromJSON);
    }
    ${modelCfg.assignments.toString().replace(/[,]/g, '')}
    const {${modelCfg.props}} = source;
    return new ${modelCfg.className}({${modelCfg.props}});
};

module.exports = ${modelCfg.className};
`;

/**
 * Doc block template used to populate the
 * docBlocks array used in the modelTpl
 */
const propertyDocBlockTpl = (type, name) => `
    /**
    * @property {${type}} ${name}
    */
`;

/**
 * Template used for typed property assignments
 * from source data inside the fromJSON() static
 * method.
 *
 * @param {string} rawType The data model class name containing a fromJSON static
 * @param {string} name The property name on the source object containing the object to type
 *
 * @returns {string} The hydrated template string
 */
const assignmentTpl = (rawType, name) => `
    source.${name} = ${rawType}.fromJSON(source.${name}) || undefined;
`;

/**
 * Finds the entity (if present) that should be passed
 * as the body of the request. PUT, POST and PATCH only.
 *
 * @param {*} swaggerOperation The swagger operation containing an array of params to search
 * @returns {*} The operation containing the info about the body of the request
 */
function findEntity(swaggerOperation) {
    return (swaggerOperation.parameters || []).find(param => param.in === 'body');
}

/**
 * Get the alias used for a particular action. These become
 * the <action> within a command.
 *
 * @param {*} swaggerOperation  The swagger operation containing an array of params to search
 * @param {string} method The method used in the actual request. e.g. get, post, put, delete, patch
 * @returns {string} The method alias to use as the <action> within the command
 */
function getMethodAlias(swaggerOperation, method) {
    const {parameters = []} = swaggerOperation;
    if (method !== 'get') {
        return OperationCommandMap[method];
    }
    const hasSkipOrTake = !!parameters.find(param => /(skip|take)/.test(param.name));
    return hasSkipOrTake ? 'list' : method;
}

/**
 * Finds the root and node from a url path.
 * if {versionId} or {appId} exist withing the
 * path, these become the root and the first
 * bracket pair after are the node.
 *
 * @param {string} path The endpoint path to parse
 * @returns {{root:string, node:string}} The object containing the root and node
 */
function findRootAndNodeFromPath(path) {
    const parts = path.split('/');
    let i = parts.length;
    const info = {};

    while (i--) {
        if (parts[i] && !/({[\w]+})/.test(parts[i])) {
            info.node = parts[i];
            break;
        }
    }

    while (i--) {
        if (parts[i] && /({versionId}|{appId})/i.test(parts[i]) && parts[i + 1]) {
            info.root = parts[i + 1];
            break;
        }
    }
    return info;
}

// Generates the data models from the swagger.json
const modelTypesByName = {};
Object.keys(swagger.definitions).forEach(key => {
    const def = swagger.definitions[key];
    const {properties, items} = def;
    if (items) {
        console.log(def);
    }
    if (properties) {
        const importsMap = {};
        const model = {className: key, imports: [], props: [], assignments: [], docBlocks: []};
        Object.keys(properties).forEach(propName => {
            const propDetails = properties[propName];
            const name = cc(propName);
            let type;
            // This is a complex data type containing a property
            // which is itself another typed object.
            // import the dependency and hold for use
            // in the fromJSON() static
            if (propDetails.type === 'object') {
                type = propDetails.$ref.split('/').pop();
                model.imports.push(`const ${type} = require('./${name}');`);
                model.assignments.push(assignmentTpl(type, name));
            } else if (propDetails.type === 'array') {
                const $ref = (propDetails.items.$ref || '').split('/').pop() || propDetails.items.type;
                type = `${$ref}[]`;
                if (!/^(string|integer|number|boolean)$/.test($ref) && !importsMap[$ref]) {
                    model.imports.push(`const ${$ref} = require('./${cc($ref)}');\n`);
                    model.assignments.push(assignmentTpl($ref, name));
                    importsMap[$ref] = true;
                }
            } else {
                type = propDetails.type;
            }
            model.docBlocks.push(propertyDocBlockTpl(type, name));
            model.props.push(`${name} /* ${type} */`);
        });
        modelTypesByName[`#/definitions/${key}`] = model;
    }
});

// Builds the Service classes and manifest.json
const configsMap = {};
Object.keys(swagger.paths).sort().forEach(pathName => {
    const {root, node} = findRootAndNodeFromPath(pathName);
    const fileName = root || node;
    const pathFragment = pathName.substr(pathName.indexOf(fileName) + fileName.length);
    const {[pathName]: path} = swagger.paths;
    const keys = Object.keys(path);

    let i = keys.length;
    while (i--) {
        const method = keys[i];
        const {[method]: swaggerOperation} = path;
        // bail, we're deprecated - uncomment to include deprecated APIs
        if (swaggerOperation.description.toLowerCase().includes('deprecated')) {
            continue;
        }
        // Get the category from the operationId.
        // e.g. pull out "apps" from "apps - Get applications list"
        const category = swaggerOperation.operationId.replace(/(')/g, '').split('-')[0].trim();
        const className = fileName.replace(/[\w]/, match => match.toUpperCase());
        // The category becomes the map key for
        // all APIs that match.
        if (!configsMap[category]) {
            configsMap[category] = {};
        }
        const cfg = configsMap[category][fileName] || {className, category, url: pathName, operations: []};
        const methodAlias = getMethodAlias(swaggerOperation, method);
        // Params that are contained in the .luisrc are excluded
        // unless the category is "apps" pr "versions" since these
        // will require the user to specify --appId or --versionId respectively.
        const params = (swaggerOperation.parameters || []).filter(param => (!/(body)/.test(param.in)));
        const entityToConsume = findEntity(swaggerOperation) || {name: '', schema: {$ref: ''}};

        // Build the command example for the help output: luis <api group> <action> <target> <subtarget> --<args>
        let command = `luis ${category} ${methodAlias}`;
        if (fileName !== category) {
            command += ` ${fileName}`;
        }
        if (root && root !== node) {
            command += ` ${node} `;
        }
        command += entityToConsume.name ? ` --in ${entityToConsume.name}.json ` : '';
        command += params.reduce((agg, param) => (agg += ` --${param.name} <${param.type}>`), '');

        // Build the operation entry for the manifest
        const operation = {
            method,
            methodAlias,
            command,
            pathFragment,
            params,
            description: swaggerOperation.description.replace(/[\r]/g, ''),
        };

        if (!operation.params.length) {
            delete operation.params;
        }

        if (root && root !== node) {
            operation.subTarget = node;
        }

        // TODO - handle the case where an body is specified but no schema is supplied
        if (!entityToConsume.schema.$ref && entityToConsume.schema.example) {
            const entity = JSON.parse(entityToConsume.schema.example);
            // console.log('no entity for: ', entity, pathName);
        }
        // Pull out the operation name - this is used in the operationTpl
        // as the name for the method
        // e.g. transforms "apps - Get applications list" to "getApplicationsList"
        operation.name = swaggerOperation.operationId
            .replace(/(')/g, '') // single quotes exist somewhere in the manifest
            .split('-')
            .pop()
            .replace(/( \w)/g, (...args) => args[2] ? args[0]
                .trim()
                .toUpperCase() : args[0]
                .trim()
                .toLowerCase());

        // If a body is expected in the request, keep
        // information about this in the manifest.json
        if (entityToConsume.name) {
            operation.entityName = entityToConsume.name;
            operation.entityType = (entityToConsume.schema.$ref || '').split('/').pop();
        }
        cfg.operations.push(operation);
        configsMap[category][fileName] = cfg;
    }
});

// Hydrates the service class templates
// and writes them to disk.
let classNames = {};
Object.keys(configsMap).forEach(category => {
    const cfg = configsMap[category];
    Object.keys(cfg).forEach(fileName => {
        const clazz = classTpl(cfg[fileName]);
        const path = `${category}/${fileName}`;
        fs.outputFileSync(`generated/${path}.js`, clazz);
        (classNames[cfg.category] || (classNames[cfg.category] = [])).push({path, name: cfg[fileName].className});
    });
});

// Writes the index.js files for each
// directory of service classes.
let apiIndexJs = '';
Object.keys(classNames).forEach(category => {
    const names = classNames[category];
    const serviceIndexJS = names.map(info => `module.exports.${info.name} = require('./${info.name.toLowerCase()}');`).join('\n');
    apiIndexJs += `module.exports.${category} = require('./${category}');\n`;
    fs.outputFileSync(`generated/${category}/index.js`, serviceIndexJS);
});
fs.outputFileSync('generated/index.js', apiIndexJs);

// Hydrates the data model templates an
// writes them to disk
let modelNames = [];
Object.keys(modelTypesByName).forEach(key => {
    const modelCfg = modelTypesByName[key];
    const model = modelTpl(modelCfg);
    fs.outputFileSync(`generated/dataModels/${cc(modelCfg.className)}.js`, model);
    modelNames.push(modelCfg.className);
});
// Creates and writes the index.js for the data models
const modelIndexJS = modelNames.sort().map(clazz => `module.exports.${clazz} = require('./${cc(clazz)}');`).join('\n');

fs.outputFileSync('generated/dataModels/index.js', modelIndexJS);
// Write the manifest.json
fs.writeJsonSync('generated/manifest.json', configsMap);