#!/bin/bash

# clean up any left over folders
echo "Cleaning up temp folders"
rm -rf ./connectorAPI
rm -rf ./tokenApi

# install replace-in-file, used by `node model_fixes.js`
echo "Installing local node modules"
npm i replace-in-file

# generate connector API client
echo "Generating Connector API client"
autorest ConnectorAPI.md --typescript

node model_fixes.js

# move models to botbuilder-schema
echo "Moving models to botbuilder-schema folder"
rm -rf ../botframework-schema/src/index.ts
mv ./connectorAPI/lib/models/index.ts ../botframework-schema/src/index.ts

# move client to botframework-connector
echo "Moving client to botframework-connector folder"
rm -rf ../botframework-connector/src/connectorApi
mv ./connectorApi/lib ../botframework-connector/src/connectorApi

# generate tokenAPI client
echo "Generating Token API client"
autorest TokenAPI.md --typescript

# move tokenAPI to botframework-connector
echo "Moving tokenAPI to botframework-connector folder"
rm -rf ../botframework-connector/src/tokenApi
mv ./tokenApi/lib ../botframework-connector/src/tokenApi

# removing generated folders ("connectorApi/", "tokenApi/")
echo "Removing temp folders ('./connectApi', './tokenApi')"
rm -rf ./connectorApi
rm -rf ./tokenApi

# removing local node_modules folder
echo "Removing local node_modules"
rm -rf ./node_modules

echo "Done generating autorest clients"



