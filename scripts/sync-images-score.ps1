# sync-images-score.ps1
# More intelligent matching: score candidate image filenames per product
$proj = Get-Location
Copy-Item -Path "Assets\Products.json" -Destination "Assets\Products.json.bak2" -Force
$p = Get-Content -Raw -Path 'Assets\Products.json' | ConvertFrom-Json
$images = Get-ChildItem -Path 'Assets\images' -Recurse -File
function Normalize([string]$s) { return ($s -replace '[^A-Za-z0-9]',' ' -replace '\s+',' ' ).ToLower().Trim() }
$notfound = @()
foreach ($prod in $p.products) {
    $id = $prod.id.ToLower()
    $nameTerms = (Normalize($prod.name) -split ' ') | Where-Object { $_ -and $_.Length -gt 2 }
    # Prefer images in same category folder if available
    $candidates = $images
    if ($prod.category) {
        $candidates = $images | Where-Object { $_.DirectoryName.ToLower() -match ($prod.category.ToLower()) }
        if ($candidates.Count -eq 0) { $candidates = $images }
    }
    $best = $null; $bestScore = 0
    foreach ($img in $candidates) {
        $n = Normalize($img.Name)
        $score = 0
        if ($n -like "*$id*") { $score += 10 }
        foreach ($t in $nameTerms) { if ($n -like "*$t*") { $score += 1 } }
        if ($score -gt $bestScore) { $bestScore = $score; $best = $img }
    }
    if ($bestScore -gt 0 -and $best -ne $null) {
        $rel = $best.FullName.Substring($proj.Path.Length + 1) -replace '\\','/' 
        $prod.images = @($rel)
    } else {
        $notfound += @{ id = $prod.id; name = $prod.name }
    }
}
$p | ConvertTo-Json -Depth 10 | Set-Content -Path 'Assets\Products.json' -Encoding UTF8
Write-Host "Rewrote Assets/Products.json with scored matches (backup: Assets/Products.json.bak2)"
if ($notfound.Count -gt 0) { Write-Host "WARNING: no suitable images for: " ; $notfound | ForEach-Object { Write-Host " - $($_.id) : $($_.name)" } }
