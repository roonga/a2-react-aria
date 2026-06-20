#!/usr/bin/env pwsh
# Runs Storybook (:6006) and Astro docs (:4321) concurrently.
# Ctrl+C stops both.

$root        = $PSScriptRoot
$currentPath = $env:PATH

$sbJob = Start-Job -Name 'storybook' -ScriptBlock {
    $env:PATH = $using:currentPath
    Set-Location $using:root
    pnpm storybook 2>&1
}
$docsJob = Start-Job -Name 'docs' -ScriptBlock {
    $env:PATH = $using:currentPath
    Set-Location $using:root
    pnpm --filter '@a2ra/docs' dev 2>&1
}

Write-Host ""
Write-Host "  [sb]   Storybook  ->  http://localhost:6006" -ForegroundColor Magenta
Write-Host "  [docs] Docs       ->  http://localhost:4321" -ForegroundColor Cyan
Write-Host "  Ctrl+C to stop both" -ForegroundColor DarkGray
Write-Host ""

try {
    while ($true) {
        foreach ($job in @($sbJob, $docsJob)) {
            $lines = Receive-Job $job -ErrorAction SilentlyContinue
            if ($lines) {
                $color = if ($job.Name -eq 'storybook') { 'Magenta' } else { 'Cyan' }
                $tag   = if ($job.Name -eq 'storybook') { '[sb]  ' } else { '[docs]' }
                foreach ($line in $lines) {
                    Write-Host "$tag $line" -ForegroundColor $color
                }
            }
        }
        Start-Sleep -Milliseconds 300
    }
} finally {
    Write-Host "`nStopping..." -ForegroundColor Yellow
    Stop-Job  $sbJob, $docsJob -ErrorAction SilentlyContinue
    Remove-Job $sbJob, $docsJob -Force -ErrorAction SilentlyContinue
    Write-Host "Done." -ForegroundColor Yellow
}
