#!/bin/bash

cwd=$(pwd);
modules=("" "-node" "-services" "-ai" "-azure" "-choices" "-legacy" "-lunr" "-rivescript");

for dir in ${modules[*]};
do
    path=$cwd"/libraries/botbuilder"$dir;
    cd $path;
    echo "tsc compiling: botbuilder$path";
    tsc;
done

# END OF LINE
