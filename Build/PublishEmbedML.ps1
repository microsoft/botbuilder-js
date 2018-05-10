#
# Pushes EmbedML files to a new branch in Github. Used in the build Push-to-botbuilder-tools.
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

git checkout master
git pull origin master
git checkout -b $newBranchName master

Write-Host 'Deleting the old files from .\Dispatch\bin\netcoreapp2.0'
Remove-Item -Force '.\Dispatch\bin\netcoreapp2.0\*.*'
Write-Host 'Copying the new files to .\Dispatch\bin\netcoreapp2.0'
Copy-item -Force ($artifactsPath + '\EmbedML*\**') -Destination '.\Dispatch\bin\netcoreapp2.0'

git add .
git add -u
$result = git status
Write-Host "git status result: [$result]"

Add-Content (".\Result") ("Dispatch tool Published to GitHub at https://github.com/Microsoft/botbuilder-tools/tree/$newBranchName/Dispatch/bin/netcoreapp2.0")
Write-Host "##vso[task.uploadsummary] .\Result"
#Write-Host "##vso[task.logissue type=warning;] 2)Dispatch tool Published to GitHub at https://github.com/Microsoft/botbuilder-tools/tree/$newBranchName/Dispatch/bin/netcoreapp2.0"

if ($result.StartsWith('nothing to commit') -eq $true) {
    Write-Host "##vso[task.logissue type=error;] Quit without publishing: Everything up-to-date. Looks like these bits are already in GitHub."
    #throw ("Push aborted: No changes found to commit. Were these same bits merged previously?");
}
#git commit -m "Automated commit: new release of dispatch tool"
#git push origin $newBranchName

