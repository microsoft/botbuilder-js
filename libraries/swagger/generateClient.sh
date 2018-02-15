rm -rf generated

npm i replace-in-file
autorest README.md --typescript

node model_fixes.js

#  Move models to botbuilder-schema
rm ../botbuilder-schema/src/index.ts
mv generated/models/index.ts ../botbuilder-schema/src/index.ts

#  Move client to botframework-connector
rm -rf ../botframework-connector/src/generated
mv generated ../botframework-connector/src/