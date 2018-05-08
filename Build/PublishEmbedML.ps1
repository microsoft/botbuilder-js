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

git checkout master
git pull origin master
git checkout -b $newBranchName master

Write-Host 'Deleting the old files'
Remove-Item -Force -Verbose '.\Dispatch\bin\netcoreapp2.0\*.*'
Write-Host 'Copying the new files'
Copy-item -Force -Verbose ($artifactsPath + '\EmbedML*\**') -Destination '.\Dispatch\bin\netcoreapp2.0'

git add .
git add -u
$result = git status
Write-Host "git status result: [$result]"

if ($result.StartsWith('nothing to commit')) {
    throw ("Push aborted: No changes found to push. Were these same files already merged previously?");
}
git commit -m "Push signed EmbedML files."
git push origin $newBranchName
