# Fix image paths by matching to actual folder names and files

$jsonPath = 'Assets/Products.json'
$imagesBasePath = 'Assets/images'

# Get actual folder names
$actualFolders = Get-ChildItem $imagesBasePath -Directory | Select-Object -ExpandProperty Name
Write-Host "Actual folders found:"
$actualFolders | ForEach-Object { Write-Host "  - $_" }

# Load JSON
$json = Get-Content $jsonPath -Raw | ConvertFrom-Json

# Create mapping of category to actual folder name
$categoryToFolder = @{}
foreach ($folder in $actualFolders) {
    if ($folder -like "*DERMAL*") { $categoryToFolder["Dermal"] = $folder }
    elseif ($folder -like "*INDUSTRIAL*") { $categoryToFolder["Industrial"] = $folder }
    elseif ($folder -like "*NIPPLE*") { $categoryToFolder["Nipple"] = $folder }
    elseif ($folder -like "*NOSE*") { $categoryToFolder["Nose"] = $folder }
    elseif ($folder -like "*BELLY*") { $categoryToFolder["Belly"] = $folder }
}

$fixed = 0

foreach ($product in $json.products) {
    $category = $product.category
    $actualFolder = $categoryToFolder[$category]
    
    if ($actualFolder) {
        $folderPath = Join-Path $imagesBasePath $actualFolder
        $currentImage = $product.images[0]
        
        # Extract just the filename from the current path
        $filename = Split-Path $currentImage -Leaf
        $expectedPath = "Assets/images/$actualFolder/$filename"
        
        # Check if file exists with this path
        if (Test-Path $expectedPath) {
            if ($product.images[0] -ne $expectedPath) {
                $product.images[0] = $expectedPath
                $fixed++
            }
        } else {
            # Try to find a matching file in the folder
            $categoryFiles = Get-ChildItem $folderPath -File -Filter "*.png"
            
            # Try to match by looking for similar names
            $bestMatch = $null
            $highestSimilarity = 0
            
            foreach ($file in $categoryFiles) {
                # Count matching characters (simple similarity)
                $matchCount = 0
                $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($filename)
                $fileNameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
                
                # Simple check: if key words match
                $nameParts = $nameWithoutExt.Split('-')
                $fileParts = $fileNameWithoutExt.Split('-')
                
                foreach ($part in $nameParts) {
                    if ($fileParts -contains $part) { $matchCount++ }
                }
                
                if ($matchCount -gt $highestSimilarity) {
                    $highestSimilarity = $matchCount
                    $bestMatch = $file.Name
                }
            }
            
            # If we found a reasonable match (at least 2 matching parts), use it
            if ($bestMatch -and $highestSimilarity -ge 2) {
                $product.images[0] = "Assets/images/$actualFolder/$bestMatch"
                $fixed++
                Write-Host "Fixed: $($product.id) -> $bestMatch"
            } elseif ($bestMatch) {
                # Use first file as last resort
                $product.images[0] = "Assets/images/$actualFolder/$bestMatch"
                $fixed++
                Write-Host "Assigned default: $($product.id) -> $bestMatch"
            }
        }
    }
}

# Save updated JSON
$json | ConvertTo-Json -Depth 10 | Out-File $jsonPath -Encoding UTF8

Write-Host ""
Write-Host "Fixed: $fixed products"
Write-Host "Total: $($json.products.Count)"
