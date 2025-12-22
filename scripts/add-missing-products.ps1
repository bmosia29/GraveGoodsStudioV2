# Add missing products as placeholders
$jsonPath = 'Assets/Products.json'
$htmlPath = 'Product_page.html'

# Parse HTML and extract all product IDs
$html = Get-Content $htmlPath -Raw
$htmlIds = [System.Collections.ArrayList]@()
foreach ($match in [System.Text.RegularExpressions.Regex]::Matches($html, 'id=([^\s"]+)')) {
    [void]$htmlIds.Add($match.Groups[1].Value)
}
$htmlIds = $htmlIds | Sort-Object -Unique

# Load JSON
$json = Get-Content $jsonPath -Raw | ConvertFrom-Json
$existingIds = @()
foreach ($product in $json.products) {
    $existingIds += $product.id
}

# Find missing IDs
$missingIds = @()
foreach ($id in $htmlIds) {
    if ($existingIds -notcontains $id) {
        $missingIds += $id
    }
}

Write-Host "Found $($missingIds.Count) missing products"

# Add missing products as placeholders
foreach ($id in $missingIds) {
    $newProduct = @{
        "id" = $id
        "name" = $id.Replace('-', ' ').ToUpper()
        "price" = 0
        "images" = @("Assets/images/image.jpeg")
        "category" = "Other"
        "description" = "Product description coming soon."
        "stock" = 0
    }
    $json.products += $newProduct
}

# Save updated JSON
$json | ConvertTo-Json -Depth 10 | Out-File $jsonPath -Encoding UTF8
Write-Host "Added $($missingIds.Count) placeholder products to Products.json"
Write-Host "Total products now: $($json.products.Count)"
