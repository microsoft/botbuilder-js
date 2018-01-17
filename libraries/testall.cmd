call \\fusebox\private\sdk\UnitTestKeys.cmd
@if exist "%ProgramFiles(x86)%\Microsoft SDKs\Azure\Storage Emulator\azurestorageemulator.exe" (
  "%ProgramFiles(x86)%\Microsoft SDKs\Azure\Storage Emulator\azurestorageemulator.exe" start
) else (
  @echo You don't have Azure Storage Emulator installed
  @echo go to https://go.microsoft.com/fwlink/?LinkId=717179 to download and install 
  @goto end
)
cd ai 
call npm run test
cd ..\azure 
call npm run test
cd ..\choices
call npm run test
cd ..\prompts
call npm run test
cd ..\core
call npm run test
cd ..\lunr
call npm run test
cd ..\node
call npm run test
cd ..\prompts
call npm run test
cd ..\rivescript
call npm run test
cd ..

:end