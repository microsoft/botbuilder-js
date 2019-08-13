// Update specified dependencies to the given version in package.json files.
//
// Usage:
// node tools\util\updateDependenciesInPackageJsons.js root-path-for-package.json-files new-version dependency-name1 dependency-name2...
// node tools\util\updateDependenciesInPackageJsons.js libraries 4.0.1-preview1.3456 botbuilder botbuilder-core botframework-connector botframework-luis botframework-schema
console.log('Started ' + (new Date()));
var myArgs = process.argv.slice(2);
var rootPath = myArgs[0];
var newVersion = myArgs[1];
var dependencies = myArgs.slice(2);
console.log('newVersion =', newVersion);
console.log('dependencies =');
console.log(dependencies);

// Update versions for specified dependencies in package.json file
function updateDependencies(filePath) {
    var fs = require('fs')
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }

        var result = '';
        dependencies.forEach(function (dependency) {
            var findString = new RegExp('("dependencies":)(.+?)("' + dependency + '":\\s*")([^\/"]+)', "gms")
            var replaceString = '$1$2$3' + newVersion;
            result = data.replace(findString, replaceString);
            data = result;
        });

        fs.writeFile(filePath, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}

// List all package.json files in the rootPath tree recursively, excluding node_modules folders.
function getPackageJsonFiles(rootPath) {
    var filelist = [];
    // var rootPath = rootPath;
    var walkSync = function (rootPath, filelist) {
        var path = path || require('path');
        var fs = fs || require('fs'),
            files = fs.readdirSync(rootPath);
        filelist = filelist || [];
        files.forEach(function (file) {
            if (fs.statSync(path.join(rootPath, file)).isDirectory()) {
                if (!file.includes('node_modules')) {
                    filelist = walkSync(path.join(rootPath, file), filelist);
                }
            }
            else {
                filelist.push(path.join(rootPath, file));
            }
        });
        return filelist;
    };
    var result0 = walkSync(rootPath, filelist);
    var result = result0.filter(path => path.includes('package.json'));
    return result;
}

var files = getPackageJsonFiles(rootPath);
console.log('files = ');
console.log(files);

files.forEach(function (file) {
    console.log('updating ' + file);
    updateDependencies(file);
});
console.log('Ended ' + (new Date()));
