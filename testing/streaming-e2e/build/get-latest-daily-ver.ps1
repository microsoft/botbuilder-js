param($PackageName, $WorkingDir)

# Get latest version of package
Set-Location -Path "$WorkingDir"

npm install "$PackageName@next"
$PkgJsonSerialized = Get-Content -Raw ./package.json
$latestVersion = ($PkgJsonSerialized | ConvertFrom-Json).dependencies.$PackageName

$latestVersion
Get-Content ./package.json

# Save latest version as pipeline variable.
# Creating variable name without '-' character to make it a legal yaml variable name
if(($PackageName -match 'botframework-') -or ($PackageName -match 'botbuilder-')) {
    $startOfSuffixIndex = $PackageName.indexOf('-') + 1;
    $suffix = $PackageName.Substring($startOfSuffixIndex);
    $yamlFriendlyName = "LatestVersion_$suffix"
    
    "##vso[task.setvariable variable=$yamlFriendlyName;]$latestVersion";
} else {
    "##vso[task.setvariable variable=LatestVersion_$PackageName;]$latestVersion";    
}
