#!/bin/bash

cwd=$(pwd);
modules=("ai" "azure" "choices" "core" "lunr" "node" "prompts" "rivescript" "services");

for dir in ${modules[*]};
do
    path=$cwd"/libraries/"$dir;
    cd $path;
    echo "tsc compiling: $path";
    tsc;
done

# END OF LINE
