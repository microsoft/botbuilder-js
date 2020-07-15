param($AccessToken, $PackageName)

$myGetFeedName = "botbuilder-v4-js-daily";

$url = "https://botbuilder.myget.org/F/$myGetFeedName/auth/$AccessToken/api/v2/feed-state";

Write-Host "Get latest $PackageName version number from MyGet $myGetFeedName";
$result = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json";

$package = $result.packages | Where-Object {$_.id -eq $PackageName};
[string]$latestVersion = $package.versions[-1];

$package.id;
$latestVersion;
$latestVersionKey = "LatestVersion_$PackageName";

"##vso[task.setvariable variable=$latestVersionKey]$latestVersion";
