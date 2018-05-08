#
# Pushes EmbedML files to a new branch in Github.
#
param
( 
    [string]$artifactsPath = ''
)

# Get name of Build Artifacts folder 
$folder = Get-ChildItem $artifactsPath -Directory | Select-Object -ExpandProperty Name
if($folder -is [system.array]) {
    $folder = $folder[0]
}
Write-Host "Copying files from $artifactsPath"

Set-PSDebug -Trace 1
# Set default identity
git config --global user.email "v-brhale@micrsoft.com"
git config --global user.name "BruceHaley"

git checkout master
git pull origin master
git checkout -b embedml-signed-$(Build.BuildNumber) master
git status
# Add-Content '.\testfile.txt' 'The Test Message'
Copy-item -Force -Verbose ($artifactsPath + '\EmbedML*\**') -Destination '..\tree\tiens\Dispatch\bin\netcoreapp2.0'
git add .
git add -u
git status
git commit -m "Push signed EmbedML files."
#git push origin embedml-signed-$(Build.BuildNumber)
git status

Set-PSDebug -Trace 0

