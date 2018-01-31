@echo off
echo setting test keys
call \\fusebox\private\sdk\UnitTestKeys.cmd
echo starting storage emulator
@if exist "%ProgramFiles(x86)%\Microsoft SDKs\Azure\Storage Emulator\azurestorageemulator.exe" (
  "%ProgramFiles(x86)%\Microsoft SDKs\Azure\Storage Emulator\azurestorageemulator.exe" start
) else (
  @echo You don't have Azure Storage Emulator installed
  @echo go to https://go.microsoft.com/fwlink/?LinkId=717179 to download and install 
)

