var fs = require('fs');
var promisify = require('util').promisify
var readFileAsync = promisify(fs.readFile);

/**
 * Loads a list of activities from a transcript file.
 * @param {string} transcriptFilePath Relative or absolute path to transcript file.
 */
function getActivitiesFromTranscript(transcriptFilePath) {
    return readFileAsync(transcriptFilePath, { encoding: 'utf8' })
        .then(transcript => JSON.parse(transcript));
}

module.exports.getActivitiesFromTranscript = getActivitiesFromTranscript;