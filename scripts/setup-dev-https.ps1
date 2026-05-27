param(
  [string]$IpAddress = "192.168.1.203"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$certDir = Join-Path $repoRoot ".cert"
$pfxPath = Join-Path $certDir "hrm-dev.pfx"
$cerPath = Join-Path $certDir "hrm-dev.cer"
$passwordText = "hrm-dev-only"
$password = ConvertTo-SecureString -String $passwordText -Force -AsPlainText
$computerName = $env:COMPUTERNAME

New-Item -ItemType Directory -Path $certDir -Force | Out-Null

$existing = Get-ChildItem Cert:\CurrentUser\My |
  Where-Object { $_.FriendlyName -eq "FluidHR local HTTPS" } |
  Select-Object -First 1

if ($existing) {
  $certificate = $existing
} else {
  $san = "2.5.29.17={text}dns=localhost&dns=$computerName&ipaddress=$IpAddress"
  $certificate = New-SelfSignedCertificate `
    -Subject "CN=$IpAddress" `
    -FriendlyName "FluidHR local HTTPS" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -KeyAlgorithm RSA `
    -KeyLength 2048 `
    -KeyExportPolicy Exportable `
    -NotAfter (Get-Date).AddYears(2) `
    -TextExtension @($san, "2.5.29.37={text}1.3.6.1.5.5.7.3.1")
}

Export-PfxCertificate -Cert $certificate -FilePath $pfxPath -Password $password -Force | Out-Null
Export-Certificate -Cert $certificate -FilePath $cerPath -Force | Out-Null
Import-Certificate -FilePath $cerPath -CertStoreLocation "Cert:\CurrentUser\Root" | Out-Null

Write-Host ""
Write-Host "HTTPS certificate created and trusted on this computer."
Write-Host "Open the app locally at: https://localhost:3000"
Write-Host "Open the app on another device at: https://$IpAddress`:3000"
Write-Host "Before using another device, install this certificate as trusted on that device:"
Write-Host $cerPath
