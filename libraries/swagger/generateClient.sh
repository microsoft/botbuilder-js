rm -rf generated
autorest README.md --nodejs

../../node_modules/.bin/replace "'../models'" "'botbuilder-schema'" ./generated -r
../../node_modules/.bin/replace "'./models'" "'botbuilder-schema'" ./generated -r

rm -rf ../botbuilder-schema/src/generated/*
rm -rf ../botframework-connector/lib/generated/*
mv generated/models ../botbuilder-schema/src/generated/models
mv generated/* ../botframework-connector/lib/generated