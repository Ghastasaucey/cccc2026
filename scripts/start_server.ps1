$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$port = 8090
$prefix = "http://127.0.0.1:$port/"

$mimeMap = @{
  ".html" = "text/html; charset=utf-8"
  ".js" = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".csv" = "text/csv; charset=utf-8"
  ".txt" = "text/plain; charset=utf-8"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".pdf" = "application/pdf"
  ".docx" = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ".md" = "text/markdown; charset=utf-8"
}

$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "PowerShell static server started at $prefix"
Start-Process "$prefix/index.html"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = $context.Request.Url.AbsolutePath.TrimStart("/")
    if ([string]::IsNullOrWhiteSpace($requestPath)) {
      $requestPath = "index.html"
    }

    $localPath = Join-Path $root ($requestPath -replace "/", "\")
    if (-not (Test-Path $localPath)) {
      $context.Response.StatusCode = 404
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $requestPath")
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $context.Response.Close()
      continue
    }

    $ext = [System.IO.Path]::GetExtension($localPath).ToLowerInvariant()
    $contentType = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { "application/octet-stream" }
    $content = [System.IO.File]::ReadAllBytes($localPath)
    $context.Response.ContentType = $contentType
    $context.Response.ContentLength64 = $content.Length
    $context.Response.OutputStream.Write($content, 0, $content.Length)
    $context.Response.Close()
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
