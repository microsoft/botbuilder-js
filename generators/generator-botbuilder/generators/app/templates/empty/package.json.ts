{
    "name": "<%= botname %>",
    "version": "4.1.6",
    "description": "<%= botDescription %>",
    "author": "Generated using Microsoft Bot Builder Yeoman generator v5",
    "license": "MIT",
    "main": "<%= npmMain %>",
    "scripts": {
        "build": "tsc --build",
        "lint": "tslint -c tslint.json 'src/**/*.ts'",
        "postinstall": "npm run build && node ./deploymentScripts/webConfigPrep.js",
        "start": "tsc --build && node ./lib/index.js",
        "test": "echo \"Error: no test specified\" && exit 1",
        "watch": "nodemon --watch ./src -e ts --exec \"npm run start\""
    },
    "repository": {
        "type": "git",
        "url": "https://github.com"
    },
    "dependencies": {
        "botbuilder": "4.1.6",
        "replace": "~1.2.0",
        "dotenv": "~8.2.0",
        "restify": "~11.1.0"
    },
    "devDependencies": {
        "@types/dotenv": "6.1.1",
        "@types/node": "^18.19.123",
        "@types/restify": "8.4.2",
        "nodemon": "^2.0.4",
        "tslint": "^6.1.2",
        "typescript": "^5.9.0"
    }
}
