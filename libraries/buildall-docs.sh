#!/bin/bash

cwd=$(pwd);
# packages containing docs 
packages=("ai" "azure" "choices" "core" "node" "prompts" "services");

for dir in ${packages[*]};
do
    path=$cwd"/libraries/"$dir"/docs/";
    cd $path;
    echo "Compiling docs for package at: $path";
    bash build-docs.sh;
done

# END OF LINE
