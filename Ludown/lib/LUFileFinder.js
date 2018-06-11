#!/usr/bin/env node
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const fs = require('fs');
module.exports = {
    /**
     * Helper function to recursively get all .lu files
     * @param {string} inputfolder input folder name
     * @param {boolean} getSubFolder indicates if we should recursively look in sub-folders as well
     * @returns {Array} Array of .lu files found
     */
    findLUFiles(inputFolder, getSubFolders) {
        var results = [];
        const luExt = '.lu';
        fs.readdirSync(inputFolder).forEach(function(dirContent) {
            dirContent = path.resolve(inputFolder,dirContent);
            if(getSubFolders && fs.statSync(dirContent).isDirectory()) {
                results = results.concat(findLUFiles(dirContent, getSubFolders));
            }
            if(fs.statSync(dirContent).isFile()) {
                if(dirContent.endsWith(luExt)) {
                    results.push(dirContent);
                }
            }
        });
        return results;
    }
};