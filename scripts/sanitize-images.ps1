# sanitize-images.ps1
# Rename image files to ASCII-safe filenames to improve matching
$files = Get-ChildItem -Path 'Assets\images' -Recurse -File
foreach ($f in $files) {
    $dir = $f.DirectoryName
    $base = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
    $ext = $f.Extension
    # Replace non-ASCII and punctuation with hyphen, collapse hyphens
    $chars = $base.ToCharArray() | ForEach-Object {
        $c = $_
        if ([int]$c -le 127) { $c } else { '-' }
    }
    $s = -join $chars
    $s = $s -replace "[^A-Za-z0-9 ]", '-'
    $s = $s -replace '\s+', '-'
    $s = $s -replace '-+', '-'
    $s = $s.Trim('-')
    if ($s -eq '') { $s = 'image' }
    $newName = "$s$ext"
    if ($newName -ne $f.Name) {
        $target = Join-Path $dir $newName
        if (-not (Test-Path $target)) {
            Rename-Item -LiteralPath $f.FullName -NewName $newName
            Write-Host "Renamed: $($f.Name) -> $newName"
        } else {
            Write-Host "Skip rename (target exists): $($f.Name) -> $newName"
        }
    }
}
Write-Host "Sanitization complete."