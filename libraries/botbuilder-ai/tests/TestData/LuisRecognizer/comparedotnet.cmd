@echo off
rem Compare local oracles to dotnet ones.
rem Some differences in numbers and order is expected.
setlocal EnableDelayedExpansion
if "%DIFF%" == "" (
    where odd.exe /q
    if %errorlevel% equ 0 ( 
        set DIFF=odd.exe
    ) else (
        set DIFF=windiff.exe
    )
)
echo using %DIFF%
set root=..\..\..\..\..\..\botbuilder-dotnet\tests\Microsoft.Bot.Builder.AI.LUIS.Tests\TestData\
echo Comparing to 
if "%~1" neq "" (
    set other=%root%%~nx1
    echo Comparing %~1
    if exist !other! ( 
        %DIFF% "%~1" "%other%"
    ) else (
        echo does not exist
    )
) else (
    echo Comparing all files in directory
    for %%f in (*.json) do (
        set other=%root%%%~nxf
        echo Comparing %%~nxf
        if exist !other! ( 
            %DIFF% "%%~f" "!other!"
        ) else (
            echo does not exist
        )
    )
)
:done
endlocal
