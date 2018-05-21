#
# Pushes files to a new branch in Github. Used in the build Push-to-botbuilder-tools.
#
param
( 
    [string]$sourcePath,            #$(System.ArtifactsDirectory)
    [string]$newBranchName,         #dispatch-tool-$(Build.BuildNumber)
    [string]$repoDestinationPath    #Dispatch/bin/netcoreapp2.0
)

# Set default identity
git config --global user.email "v-brhale@micrsoft.com"
git config --global user.name "BruceHaley"

git checkout master
git pull origin master
git checkout -b $newBranchName master

Write-Host "Deleting the old files from ./$repoDestinationPath"
Remove-Item -Force ("./$repoDestinationPath/*.*")
Write-Host "Copying the new files from $sourcePath/*/** to ./$repoDestinationPath"
Copy-item -Force $sourcePath/*/** -Destination ("./$repoDestinationPath") -Verbose

git add .
git add -u
$result = git status
Write-Host "git status result: [$result]"

if ($result.StartsWith('nothing to commit') -eq $true) {
    Write-Host "##vso[task.logissue type=error;] Quit without publishing: Everything up-to-date. Looks like these bits are already in GitHub."
    throw;
}
git commit -m "Automated commit: new botbuilder tool release"
git push origin $newBranchName

# Display a Results section on the build summary page
Add-Content -Path "$sourcePath\Results" -Value "Dispatch tool published to [https://github.com/Microsoft/botbuilder-tools/tree/$newBranchName/$repoDestinationPath](https://github.com/Microsoft/botbuilder-tools/tree/$newBranchName/$repoDestinationPath)"
Write-Host "##vso[task.uploadsummary] $sourcePath\Results"
