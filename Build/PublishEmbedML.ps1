#
# Pushes EmbedML files to a new branch in Github.
#
param
( 
    [string]$artifactsPath = '',
    [string]$newBranchName
)

Write-Host "Copying files from" ($artifactsPath + '\EmbedML*\**')

# Set default identity
git config --global user.email "v-brhale@micrsoft.com"
git config --global user.name "BruceHaley"

Set-PSDebug -Trace 1
git checkout master
git pull origin master
git checkout -b $newBranchName master
git status
Set-PSDebug -Trace 0

Remove-Item -Force -Verbose '.\Dispatch\bin\netcoreapp2.0\*.*'
Copy-item -Force -Verbose ($artifactsPath + '\EmbedML*\**') -Destination '.\Dispatch\bin\netcoreapp2.0'

Set-PSDebug -Trace 1
git add .
git add -u
git status
git commit -m "Push signed EmbedML files."
git push origin $newBranchName
git status
Set-PSDebug -Trace 0
