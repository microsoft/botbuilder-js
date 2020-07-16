param($AccessToken, $PackageName)

$myGetFeedName = "botbuilder-v4-js-daily";

$url = "https://botbuilder.myget.org/F/$myGetFeedName/auth/$AccessToken/api/v2/feed-state";

Write-Host "Get latest $PackageName version number from MyGet $myGetFeedName";
$result = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json";

$package = $result.packages | Where-Object {$_.id -eq $PackageName};
[string]$latestVersion = $package.versions[-1];

$package.id;
$latestVersion;

# Save latest version as build variable.
# Creating variable name without '-' character to make it a legal yaml variable name
if(($PackageName -match 'botframework-') -or ($PackageName -match 'botbuilder-')) {
    $startOfSuffixIndex = $PackageName.indexOf('-') + 1;
    $suffix = $PackageName.Substring($startOfSuffixIndex);
    $yamlFriendlyName = "LatestVersion_$suffix"
    
    "##vso[task.setvariable variable=$yamlFriendlyName;]$latestVersion";
} else {
    "##vso[task.setvariable variable=LatestVersion_$PackageName;]$latestVersion";    
}