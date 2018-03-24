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
const pascalCase = require('pascal-case');
const md5 = require('md5');

/**
 * Services template extends ServiceBase
 */
const classTpl = (cfg) => {
    return `const {ServiceBase} = require('./serviceBase');
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
    Object.keys(operations).forEach(key => {
        const operation = operations[key];
        tpl += `
    /**
    * ${operation.description}
    */
    ${operation.name}(params${operation.entityName ? ` , ${operation.entityName}` : ''}${(operation.entityType ? `/* ${operation.entityType} */` : '')}) {
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
 * Finds the root and node from a url path.
 * if {knowledgeBaseID} exist withing the
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
        if (parts[i] && /({knowledgeBaseID})/i.test(parts[i]) && parts[i + 1]) {
            info.root = parts[i + 1];
            break;
        }
    }
    return info;
}

const definitionsMap = {};

function addDefinitionFromExample(json, className) {
    className = pascalCase(className);
    const type = typeof json;
    const isArray = Array.isArray(json);
    const definition = {type: isArray ? 'array' : type};

    if (!isArray && type === 'object') {
        const keys = Object.keys(json);
        const signature = md5(keys.toString());
        const $ref = `#/definitions/${className}`;
        if (!definitionsMap[signature]) {
            const definitionEntry = Object.assign({}, definition);
            definitionEntry.properties = {};
            keys.forEach(key => {
                definitionEntry.properties[key] = addDefinitionFromExample(json[key], key);
            });
            if (definitionsMap[$ref]) {
                console.warn($ref + ' already exists');
            }
            (swagger.definitions || (swagger.definitions = {}))[className] = definitionEntry;
            definitionsMap[signature] = definitionEntry;
        }
        definition.$ref = $ref;
    } else if (isArray) {
        className = className.substr(0, className.length - 1);
        definition.items = addDefinitionFromExample(json[0], className);
    }
    return definition;
}

// Builds the Service classes and luis.json
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
        const className = fileName.replace(/[\w]/, match => match.toUpperCase());
        const cfg = configsMap[fileName] || {className, url: pathName, operations: {}};
        const params = (swaggerOperation.parameters || []).filter(param => (!/(body)/.test(param.in)));
        // Pull out the operation name - this is used in the operationTpl
        // as the name for the method
        // e.g. transforms "apps - Get applications list" to "getApplicationsList"
        const operationName = swaggerOperation.operationId
            .replace(/(')/g, '') // single quotes exist somewhere in the manifest
            .split('-')
            .pop()
            .toLowerCase()
            .replace(/( \w)/g, (...args) => args[2] ? args[0]
                .trim()
                .toUpperCase() : args[0]
                .trim()
                .toLowerCase());

        // Find the entity to send in the request. If a schema does not exist,
        // attempt to create one using the example.
        const entityToConsume = findEntity(swaggerOperation) || {name: '', schema: {$ref: ''}};
        if (!entityToConsume.schema.$ref && entityToConsume.schema.example) {
            const entity = JSON.parse(entityToConsume.schema.example);
            entityToConsume.name = operationName;
            entityToConsume.schema = addDefinitionFromExample(entity, operationName);
        }

        // Build the command example for the help output: luis <api group> <action> <target> <subtarget> --<args>
        let command = `qnamaker ${operationName}`;
        if (root && root !== node) {
            command += ` ${node} `;
        }
        command += entityToConsume.name ? ` --in ${entityToConsume.name}.json` : '';
        command += params
            .slice()
            .reduce((agg, param) => (agg += ` --${param.name} <${param.type}>`), '');
        // Build the operation entry for the manifest
        const operation = {
            name: operationName,
            method,
            command: command.trim(),
            pathFragment: pathName.includes(pathFragment) ? '' : pathFragment,
            params,
            description: swaggerOperation.description.replace(/[\r]/g, ''),
        };

        if (!operation.params.length) {
            delete operation.params;
        }

        // If a body is expected in the request, keep
        // information about this in the luis.json
        if (entityToConsume.name) {
            operation.entityName = entityToConsume.name;
            operation.entityType = (entityToConsume.schema.$ref || '').split('/').pop();
        }
        cfg.operations[operationName] = operation;
        configsMap[fileName] = cfg;
    }
});

// Generates the data models from the swagger.json
const modelTypesByName = {};
Object.keys((swagger.definitions || {})).forEach(key => {
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

// Hydrates the service class templates
// and writes them to disk.
let classNames = {};
Object.keys(configsMap).forEach(fileName => {
    const cfg = configsMap[fileName];
    const clazz = classTpl(cfg);
    const path = `${fileName}`;
    fs.outputFileSync(`generated/${path}.js`, clazz);
    (classNames[fileName] || (classNames[fileName] = [])).push({path, name: cfg.className});
});

// Writes the index.js files for each
// directory of service classes.
let apiIndexJs = '';
Object.keys(classNames).forEach(fileName => {
    apiIndexJs += `module.exports.${fileName} = require('./${fileName}');\n`;
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
// Write the qnamaker.json
fs.writeJsonSync('generated/qnamaker.json', configsMap);
