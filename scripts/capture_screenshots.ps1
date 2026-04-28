$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$serverScript = Join-Path $PSScriptRoot "start_server.ps1"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outDir = Join-Path $root "screenshots"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$job = Start-Job -ScriptBlock {
  param($scriptPath)
  powershell -ExecutionPolicy Bypass -File $scriptPath
} -ArgumentList $serverScript

Start-Sleep -Seconds 4

$targets = @(
  @{ Url = "http://127.0.0.1:8090/index.html?page=home"; File = "home-dashboard.png" },
  @{ Url = "http://127.0.0.1:8090/index.html?page=data"; File = "history-analysis.png" },
  @{ Url = "http://127.0.0.1:8090/index.html?page=predict&autostart=1"; File = "forecast-analysis.png" },
  @{ Url = "http://127.0.0.1:8090/index.html?page=decision&autostart=1&scene=industrial"; File = "decision-recommendation.png" },
  @{ Url = "http://127.0.0.1:8090/index.html?page=compare"; File = "model-comparison.png" }
)

foreach ($target in $targets) {
  $shotPath = Join-Path $outDir $target.File
  & $chrome "--headless=new" "--disable-gpu" "--window-size=1920,1080" "--virtual-time-budget=9000" "--screenshot=$shotPath" $target.Url | Out-Null
}

Stop-Job $job -ErrorAction SilentlyContinue | Out-Null
Remove-Job $job -Force -ErrorAction SilentlyContinue | Out-Null
Get-ChildItem -LiteralPath $outDir | Select-Object Name, Length, LastWriteTime
