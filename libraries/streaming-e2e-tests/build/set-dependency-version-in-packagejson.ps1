param($Package, $LatestVersion, $PathToPJson)

$find = "$Package`": `"\S*`"";
$replace = "$Package`": `"$LatestVersion`"";

Get-ChildItem -Path "$PathToPJson" | % {
    $_.FullName; 
    $content = Get-Content -Raw $_.FullName;

    $content -Replace "$find", "$replace" | Set-Content $_.FullName;
    '-------------'; get-content $_.FullName; '==================='
}
