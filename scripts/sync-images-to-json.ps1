# sync-images-to-json.ps1
# Backup Products.json and update product image paths to actual files found under Assets/images
$proj = Get-Location
Copy-Item -Path "Assets\Products.json" -Destination "Assets\Products.json.bak" -Force
$p = Get-Content -Raw -Path 'Assets\Products.json' | ConvertFrom-Json
$images = Get-ChildItem -Path 'Assets\images' -Recurse -File
$notfound = @()
foreach ($prod in $p.products) {
    $id = $prod.id
    $found = $images | Where-Object { $_.Name -imatch [regex]::Escape($id) } | Select-Object -First 1
    if (-not $found) {
        $name = ($prod.name -replace '[^A-Za-z0-9]',' ')
        $terms = $name -split '\s+' | Where-Object { $_ -and $_.Length -gt 3 }
        foreach ($t in $terms) {
            $found = $images | Where-Object { $_.Name -imatch [regex]::Escape($t) } | Select-Object -First 1
            if ($found) { break }
        }
    }
    if ($found) {
        $rel = $found.FullName.Substring($proj.Path.Length + 1) -replace '\\','/'
        $prod.images = @($rel)
    } else {
        $notfound += @{ id = $id; name = $prod.name }
    }
}
$p | ConvertTo-Json -Depth 10 | Set-Content -Path 'Assets\Products.json' -Encoding UTF8
Write-Host "Updated Assets/Products.json (backup: Assets/Products.json.bak)"
if ($notfound.Count -gt 0) {
    Write-Host "WARNING: Could not find images for the following products:"
    $notfound | ForEach-Object { Write-Host " - $($_.id) : $($_.name)" }
}
