for /d %%s in (*) do pushd %%s\docs & build-docs.cmd  & popd
cd ..\docs




