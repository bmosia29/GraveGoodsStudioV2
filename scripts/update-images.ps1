# Update Products.json with correct image paths by matching category and finding best image file match

$jsonPath = 'Assets/Products.json'
$imagesBasePath = 'Assets/images'

# Load JSON
$json = Get-Content $jsonPath -Raw | ConvertFrom-Json

# Create mapping of categories to folder names
$categoryFolders = @{
    "Dermal" = "GC - DERMAL JEWELLERY"
    "Industrial" = "GC - INDUSTRIAL JEWELERY"
    "Nipple" = "GC - NIPPLE JEWELLERY"
    "Nose" = "GC - NOSE JEWELLERY"
    "Belly" = "GC JEWELLERY - BELLY"
}

$updated = 0
$stillPlaceholder = 0

foreach ($product in $json.products) {
    $currentImage = $product.images[0]
    
    # If still using placeholder
    if ($currentImage -eq "Assets/images/image.jpeg") {
        $category = $product.category
        $folderName = $categoryFolders[$category]
        
        if ($folderName) {
            $folderPath = Join-Path $imagesBasePath $folderName
            
            if (Test-Path $folderPath) {
                # Get all images in this category
                $categoryImages = @(Get-ChildItem $folderPath -File -Filter "*.png" | Select-Object -ExpandProperty Name)
                
                if ($categoryImages.Count -gt 0) {
                    # Use first available image as placeholder match
                    $firstImage = $categoryImages[0]
                    $newPath = "Assets/images/$folderName/$firstImage"
                    
                    $product.images = @($newPath)
                    $updated++
                    Write-Host "Updated: $($product.id) -> $firstImage"
                } else {
                    $stillPlaceholder++
                    Write-Host "No images in folder: $folderName"
                }
            } else {
                $stillPlaceholder++
                Write-Host "Folder not found: $folderName"
            }
        } else {
            $stillPlaceholder++
            Write-Host "Unknown category: $category for $($product.id)"
        }
    }
}

# Save updated JSON
$json | ConvertTo-Json -Depth 10 | Out-File $jsonPath -Encoding UTF8

Write-Host ""
Write-Host "Summary:"
Write-Host "  Updated: $updated products"
Write-Host "  Still placeholder: $stillPlaceholder"
Write-Host "  Total products: $($json.products.Count)"
