#!/bin/bash

cwd=$(pwd);
modules=("" "-middleware" "-stylers" "-storage" "-recognizers" "-state" "-templates" "-node" "-services" "-ai" "-azure" "-choices");

for dir in ${modules[*]};
do
    path=$cwd"/libraries/botbuilder"$dir;
    cd $path;
    echo "Running tests for module: $dir";
    npm run test;
done

# END OF LINE
