param(
  [string]$Version = "0.1.0"
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$AuthServerDir = Join-Path $RepoRoot "auth-server"
$TemplateDir = Join-Path $RepoRoot "packaging\apple-notes-bridge-macos"
$OutRoot = Join-Path $RepoRoot "dist"
$StageDir = Join-Path $OutRoot "klyph-apple-notes-bridge-macos"
$ZipPath = Join-Path $OutRoot ("klyph-apple-notes-bridge-macos-v{0}.zip" -f $Version)

if (Test-Path $StageDir) {
  Remove-Item -LiteralPath $StageDir -Recurse -Force
}

if (Test-Path $ZipPath) {
  Remove-Item -LiteralPath $ZipPath -Force
}

New-Item -ItemType Directory -Path $StageDir | Out-Null
New-Item -ItemType Directory -Path (Join-Path $StageDir "auth-server") | Out-Null

Copy-Item -LiteralPath (Join-Path $TemplateDir "install.sh") -Destination (Join-Path $StageDir "install.sh")
Copy-Item -LiteralPath (Join-Path $TemplateDir "uninstall.sh") -Destination (Join-Path $StageDir "uninstall.sh")
Copy-Item -LiteralPath (Join-Path $TemplateDir "README.md") -Destination (Join-Path $StageDir "README.md")

Copy-Item -LiteralPath (Join-Path $AuthServerDir "server.js") -Destination (Join-Path $StageDir "auth-server\server.js")
Copy-Item -LiteralPath (Join-Path $AuthServerDir "package.json") -Destination (Join-Path $StageDir "auth-server\package.json")
Copy-Item -LiteralPath (Join-Path $AuthServerDir "package-lock.json") -Destination (Join-Path $StageDir "auth-server\package-lock.json")
Copy-Item -LiteralPath (Join-Path $AuthServerDir ".env.example") -Destination (Join-Path $StageDir "auth-server\.env.example")
Copy-Item -LiteralPath (Join-Path $AuthServerDir "README.md") -Destination (Join-Path $StageDir "auth-server\README.md")
Copy-Item -LiteralPath (Join-Path $AuthServerDir "apple-notes") -Destination (Join-Path $StageDir "auth-server\apple-notes") -Recurse

Compress-Archive -Path (Join-Path $StageDir "*") -DestinationPath $ZipPath -CompressionLevel Optimal

Write-Output "Created package:"
Write-Output $ZipPath
