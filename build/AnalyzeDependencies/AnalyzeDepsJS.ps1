Param(
  [Parameter(Mandatory = $true)][string]$PackagesPath,
  [Parameter(Mandatory = $false)][string]$LockfilePath,
  [Parameter(Mandatory = $false)][string]$OutPath,
  [Parameter(Mandatory = $false)][string]$DumpPath
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

Function Get-PackageJson($NupkgPath) {
  try {
    # Expand tar file to tempdir folder
    Remove-Item -Path ./tempdir -Recurse -Force -ErrorAction SilentlyContinue
    New-Item -Path ./tempdir -ItemType directory -Force | Out-Null;

    #Expand-Tar $NupkgPath tempdir
    pushd ./tempdir
    tar -xvzf $NupkgPath >$null 2>&1;
    $ZipFile = (Get-ChildItem package.json -Path . -Recurse ).FullName;
    popd

    Get-Content -Raw $ZipFile | ConvertFrom-Json;
  }
  catch {
  }
}

#Function Expand-Tar($tarFile, $dest) {
#
#    if (-not (Get-Command Expand-7Zip -ErrorAction Ignore)) {
#        Install-Package -Scope CurrentUser -Force 7Zip4PowerShell > $null
#    }
#
#    Expand-7Zip $tarFile $dest
#}

Function Save-Dep($Deps, $TargetFramework, $DepName, $DepVersion, $DependentPackage) {
  if (-Not $Deps[$DepName]) {
    $Deps[$DepName] = @{ }
  }
  if (-Not $Deps[$DepName][$TargetFramework]) {
    $Deps[$DepName][$TargetFramework] = @{ }
  }
  if (-Not $Deps[$DepName][$TargetFramework][$DepVersion]) {
    $Deps[$DepName][$TargetFramework][$DepVersion] = New-Object System.Collections.ArrayList
  }
  if (-Not $Deps[$DepName][$TargetFramework][$DepVersion].Contains($DependentPackage)) {
    $Deps[$DepName][$TargetFramework][$DepVersion].Add($DependentPackage) | Out-Null
  }
}

Function Save-PkgDep($PkgDeps, $TargetFramework, $DepName, $DepVersion) {
  if (-Not $PkgDeps[$DepName]) {
    $PkgDeps[$DepName] = @{ }
  }
  if (-Not $PkgDeps[$DepName][$DepVersion]) {
    $PkgDeps[$DepName][$DepVersion] = New-Object System.Collections.ArrayList
  }
  if (-Not $PkgDeps[$DepName][$DepVersion].Contains($TargetFramework)) {
    $PkgDeps[$DepName][$DepVersion].Add($TargetFramework) | Out-Null
  }
}

#Function Save-Locked($Locked, $DepName, $DepVersion, $Condition) {
#  if (-Not $Locked[$DepName]) {
#    $Locked[$DepName] = @{ }
#  }
#  if (-Not $Locked[$DepName][$DepVersion]) {
#    $Locked[$DepName][$DepVersion] = New-Object System.Collections.ArrayList
#  }
#  if (-Not $Locked[$DepName][$DepVersion].Contains($Condition)) {
#    $Locked[$DepName][$DepVersion].Add($Condition.Trim()) | Out-Null
#  }
#}

Function Get-PackageExport($Pkgs, $Internal) {
  $DumpData = @{ }
  foreach ($PkgName in $Pkgs.Keys) {
    $PkgInfo = $Pkgs[$PkgName]
    $Id = $PkgName + ":" + $PkgInfo.Ver
    $InternalDeps = [System.Collections.ArrayList]@()
    foreach ($Dep in $PkgInfo.Deps)
    {
      if ($Internal.Contains($Dep.name)) {
        $InternalDeps.Add($Dep) > $Null
      }
    }
    $DumpData[$Id] = @{
      name    = $PkgName;
      version = $PkgInfo.Ver;
      type    = "internal";
      deps    = $InternalDeps
    }
  }

  $PkgIds = $DumpData.Keys | ForEach-Object ToString
  foreach ($PkgId in $PkgIds) {
    foreach ($Dep in $DumpData[$PkgId].deps) {
      $DepId = $Dep.name + ":" + $Dep.version
      if (-Not $DumpData.ContainsKey($DepId)) {
        $DumpData[$DepId] = @{
          name    = $Dep.name;
          version = $Dep.version;
          type    = "internalbinary";
          deps    = @()
        }
      }
    }
  }

  return $DumpData
}

# Analyze package dependencies
Write-Host "Debug 1"
$Pkgs = @{ }
$Deps = @{ }
Write-Host "Debug 2"
Resolve-Path $PackagesPath
Write-Host "Debug 3"

foreach ($PkgFile in Resolve-Path $PackagesPath) {
  Write-Host "Debug 4 $PkgFile"
  $PackageJson = Get-PackageJson $PkgFile
  Write-Host "Debug 5 $PackageJson"
  $LibraryName = $PackageJson.name
  $LibraryVer = $PackageJson.version

  Write-Host "Debug 6"
  Write-Host $LibraryName

  $Pkgs[$LibraryName] = @{ Ver = $LibraryVer; Src = $PkgFile; Deps = New-Object System.Collections.ArrayList }
  $PkgDeps = @{ }
  
  Write-Host "Debug 7"
  $Dependencies = (&{If($PackageJson.dependencies) {($PackageJson.dependencies | Get-Member -MemberType NoteProperty | Select Definition)} Else {$null}})
  Write-Host "Debug 8"
  
  foreach ($Dep in $Dependencies) {
    $Depid = $Dep.Definition.Split(' =')[1];
    $Depversion = $Dep.Definition.Split(' =')[2];
    Save-PkgDep $PkgDeps "" $Depid $Depversion
    if ($Deps.Count) {
      $DepsKeys = ($Deps.Keys).Clone();
      foreach ($TargetFramework in $DepsKeys) {
        Save-Dep $Deps $TargetFramework $Depid $Depversion $LibraryName
      }
      Save-Dep $Deps "(others)" $Depid $Depversion $LibraryName
    } else {
      Save-Dep $Deps "(any)" $Depid $Depversion $LibraryName
    }
  }
  
  foreach ($DepName in $PkgDeps.Keys) {
    $DepVersions = $PkgDeps[$DepName]
    if ($DepVersions.Count -gt 1) {
      foreach ($DepVersion in $DepVersions.Keys) {
        $TargetFrameworks = $DepVersions[$DepVersion]
        $Pkgs[$LibraryName]["Deps"].Add(@{name = $DepName; version = $DepVersion; label = ($TargetFrameworks -Join ", ") }) | Out-Null
      }
    } else {
      $Pkgs[$LibraryName]["Deps"].Add(@{name = $DepName; version = ($DepVersions.Keys | Select-Object -first 1) }) | Out-Null
    }
  }
}

Write-Host "Analyzing $($Pkgs.Count) packages..."

## Analyze lockfile
$Locked = @{ }
#if ($LockfilePath) {
#  [xml]$PackageProps = Get-Content $LockfilePath
#  foreach ($ItemGroup in $PackageProps.Project.ItemGroup) {
#    if ($ItemGroup.Condition) {
#      $Condition = $ItemGroup.Condition
#    } else {
#      $Condition = ""
#    }
#    foreach ($Entry in $ItemGroup.PackageReference) {
#      if ($Entry.Update) {
#        Save-Locked $Locked $Entry.Update $Entry.Version $Condition
#      }
#    }
#  }
#  Write-Host "Discovered $($Locked.Count) versions pinned in the lockfile."
#} else {
#  Write-Warning "No lockfile was provided, or the lockfile was empty. Declared dependency versions were not able to be validated against the lockfile."
#}

# Precompute some derived data for the template
$External = $Deps.Keys | Where-Object { -not ($Pkgs.ContainsKey($_)) }
$Inconsistent = @{ }
$MismatchedVersions = @{ }
$Unlocked = New-Object System.Collections.ArrayList
foreach ($DepName in $Deps.Keys) {
  $InconsistentFrameworks = $Deps[$DepName].Keys | Where-Object { $Deps[$DepName][$_].Count -gt 1 }
  if ($InconsistentFrameworks) {
    $Inconsistent[$DepName] = $InconsistentFrameworks
  }

  if ($Locked.ContainsKey($DepName)) {
    foreach ($TargetFramework in $Deps[$DepName].Keys) {
      foreach ($DepVer in $Deps[$DepName][$TargetFramework].Keys) {
        if (-Not $Locked[$DepName].ContainsKey($DepVer)) {
          if (-Not $MismatchedVersions[$DepName]) {
            $MismatchedVersions[$DepName] = @{ }
          }
          $MismatchedVersions[$DepName][$DepVer] = $Deps[$DepName][$TargetFramework][$DepVer]
        }
      }
    }
  } else {
    $Unlocked.Add($DepName) | Out-Null
  }
}

$ExitCode = 0
if ($Inconsistent) {
  Write-Warning "$($Inconsistent.Count) inconsistent dependency versions were discovered."
  # Don't fail the build when inconsistent dependencies are present
  # TODO: Remove this ASAP
  #$ExitCode = 1
} else {
  Write-Host "All dependencies verified, no inconsistent dependency versions were discovered.')"
}

#if ($MismatchedVersions -or $Unlocked) {
#  if ($MismatchedVersions) {
#    Write-Warning "$($MismatchedVersions.Count) dependency version overrides are present, causing dependency versions to differ from the version in the lockfile."
#  }
#  if ($Unlocked) {
#    Write-Warning "$($Unlocked.Count) dependencies are missing from the lockfile."
#  }
#} else {
#  Write-Host "All declared dependency versions match those specified in the lockfile."
#}

if ($OutPath) {
  Write-Host "Generating HTML report..."
  $__template__ = Get-Content "$PSScriptRoot/deps.html.tpl" -Raw
  Invoke-Expression "@`"`r`n$__template__`r`n`"@" | Out-File -FilePath $OutPath
}

if ($DumpPath) {
  Write-Host "Generating JSONP data export..."
  $Internal = $Pkgs.Keys | ForEach-Object ToString
  $DumpData = Get-PackageExport $Pkgs $Internal
  "const data = " + (ConvertTo-Json -InputObject $DumpData -Compress -Depth 10) + ";" | Out-File -FilePath $DumpPath
}

exit $ExitCode
