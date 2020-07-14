param($AccessToken)

$myGetPersonalAccessToken = $AccessToken;
$myGetFeedName = "botbuilder-v4-js-daily";
$packageName = "botbuilder";

$url = "https://botbuilder.myget.org/F/$myGetFeedName/auth/$myGetPersonalAccessToken/api/v2/feed-state";

Write-Host "Get latest $packageName version number from MyGet $myGetFeedName";
$result = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json";

$package = $result.packages | Where-Object {$_.id -eq $packageName};
[string]$latestVersion = $package.versions[-1];

$package.id;
$latestVersion;
"##vso[task.setvariable variable=LatestVersion;]$latestVersion";
