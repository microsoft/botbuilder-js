@echo off
setlocal

set keys="\\fusebox\private\sdk\UnitTestKeys.cmd"
if exist %keys% (
  echo Setting internal microsoft keys--ensure tests can run without them
  endlocal
  call %keys%
  setlocal
) 

set storage="%ProgramFiles(x86)%\Microsoft SDKs\Azure\Storage Emulator\azurestorageemulator.exe"
if exist %storage% (
  echo Starting storage emulator 
  %storage% start
) else (
  echo You don't have Azure Storage Emulator installed
  echo go to https://go.microsoft.com/fwlink/?LinkId=717179 to download and install 
)

set cosmos="%ProgramFiles%\Azure Cosmos DB Emulator\CosmosDB.Emulator.exe"
if exist %cosmos% (
  echo Starting cosmos db emulator
  %cosmos% /NoUI /NoExplorer
) else (
  echo You don't have Azure Cosmos DB Emulator installed
  echo go to https://aka.ms/cosmosdb-emulator to download and install
)
endlocal



