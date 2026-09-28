param(
  [switch]$FullGradleCache,
  [switch]$BuildAfterRepair
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $projectRoot 'android'
$gradleUserHome = Join-Path $env:USERPROFILE '.gradle'

Write-Host 'QuanLyChiTieu - Android build repair' -ForegroundColor Cyan
Write-Host "Project: $projectRoot"

if (-not (Test-Path (Join-Path $projectRoot 'package.json'))) {
  throw "Khong tim thay package.json. Hay dat script trong thu muc goc project."
}

if (-not $env:JAVA_HOME) {
  Write-Warning 'JAVA_HOME chua duoc dat trong cua so PowerShell nay.'
} else {
  Write-Host "JAVA_HOME: $env:JAVA_HOME"
}

# java -version writes to stderr on purpose; invoke through cmd so
# PowerShell's ErrorActionPreference=Stop does not abort the repair script.
$javaVersion = (& cmd.exe /c 'java -version 2>&1' | Select-Object -First 1)
Write-Host "Java: $javaVersion"

if (Test-Path (Join-Path $androidDir 'gradlew.bat')) {
  Push-Location $androidDir
  try { & .\gradlew.bat --stop | Out-Host } finally { Pop-Location }
}

Get-Process java,javaw,gradle -ErrorAction SilentlyContinue |
  Stop-Process -Force -ErrorAction SilentlyContinue

$transformCache = Join-Path $gradleUserHome 'caches\8.14.3\transforms'
$allGradleCache = Join-Path $gradleUserHome 'caches'
$projectGradleCache = Join-Path $androidDir '.gradle'

if ($FullGradleCache) {
  Write-Host "Xoa toan bo Gradle cache: $allGradleCache" -ForegroundColor Yellow
  Remove-Item -Recurse -Force $allGradleCache -ErrorAction SilentlyContinue
} else {
  Write-Host "Xoa transforms cache: $transformCache" -ForegroundColor Yellow
  Remove-Item -Recurse -Force $transformCache -ErrorAction SilentlyContinue
}

Write-Host "Xoa cache native cua project: $projectGradleCache" -ForegroundColor Yellow
Remove-Item -Recurse -Force $projectGradleCache -ErrorAction SilentlyContinue

$adb = Get-Command adb -ErrorAction SilentlyContinue
if ($null -ne $adb) {
  Write-Host 'Thiet bi Android:' -ForegroundColor Cyan
  & adb devices
} else {
  Write-Warning 'Khong tim thay adb trong PATH.'
}

Write-Host ''
Write-Host 'Da sua cache Gradle. Hay build lai bang:' -ForegroundColor Green
Write-Host "cd `"$projectRoot`""
Write-Host 'npx expo run:android'

if ($BuildAfterRepair) {
  Set-Location $projectRoot
  & npx expo run:android
}
