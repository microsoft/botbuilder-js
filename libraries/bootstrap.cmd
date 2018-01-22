call npm install --global typescript
call npm install --global mocha
call npm install --global typedoc
call npm install --global typedoc-plugin-external-module-name
call npm install --global typedoc-plugin-markdown

cd botframework-connector
call npm link
cd ..

cd botframework-connector-auth
call npm link
cd ..

cd botframework-luis
call npm link
cd ..

cd botbuilder
call npm install
call npm link
cd ..

cd botbuilder-services
call npm link botbuilder
call npm install
call npm link
cd ..

cd botbuilder-node
call npm link botbuilder
call npm install
call npm link
cd ..

cd botbuilder-ai
call npm link botbuilder
call npm install
call npm link
cd ..

cd botbuilder-azure
call npm link botbuilder
call npm install
call npm link
cd ..

cd botbuilder-choices
call npm link botbuilder
call npm install
call npm link
cd ..

cd botbuilder-legacy
call npm link botbuilder
call npm install
call npm link
cd ..

cd botbuilder-lunr
call npm link botbuilder
call npm install
call npm link
cd ..

cd botbuilder-rivescript
call npm link botbuilder
call npm install
call npm link
cd ..
