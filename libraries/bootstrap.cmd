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
