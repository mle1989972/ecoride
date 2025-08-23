\
param(
  [string]$PublicDir = "public"
)
# Apply EcoRide branding to all public HTML files (PowerShell)

if (-not (Test-Path $PublicDir)) {
  Write-Error "Public dir not found: $PublicDir"
  exit 1
}

$injectBlock = @'
  <link rel="icon" type="image/png" sizes="32x32" href="./assets/icons/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="./assets/icons/favicon-16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="./assets/icons/favicon-180.png">
  <meta property="og:title" content="EcoRide">
  <meta property="og:description" content="Covoiturage éco-responsable">
  <meta property="og:image" content="./assets/img/og-image.png">
  <meta property="og:type" content="website">
  <meta name="theme-color" content="#16A34A">
'@

Get-ChildItem -Path $PublicDir -Filter *.html | ForEach-Object {
  $file = $_.FullName
  Write-Host "Patching $file"

  $content = Get-Content -Raw $file

  if ($content -notmatch 'assets/icons/favicon-32.png') {
    $content = $content -replace '(?i)</head>', "$injectBlock`r`n</head>"
  }

  if ($content -match '(?i)<span[^>]*class="logo"[^>]*>.*?</span>') {
    $content = $content -replace '(?i)<span[^>]*class="logo"[^>]*>.*?</span>', '<img src="./assets/img/logo-ecoride.svg" alt="EcoRide" class="logo" style="height:28px">'
  } elseif ($content -match '(?i)<div[^>]*class="brand"[^>]*>') {
    $content = $content -replace '(?i)(<div[^>]*class="brand"[^>]*>)', '$1<img src="./assets/img/logo-ecoride.svg" alt="EcoRide" class="logo" style="height:28px; margin-right:8px">'
  }

  Set-Content -Path $file -Value $content -Encoding UTF8
}

Write-Host "Branding applied ✅"
