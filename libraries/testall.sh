#!/bin/bash

cwd=$(pwd);
modules=("core");

for dir in ${modules[*]};
do
    path=$cwd"/libraries/"$dir;
    cd $path;
    echo "Running tests for module: $dir";
    npm run test;
done

# END OF LINE
