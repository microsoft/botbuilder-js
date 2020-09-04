echo "Adding nonce to inline scripts..."

$indexHtml = "./build/index.html"
(Get-Content -Raw $indexHtml) |
    ForEach-Object { $_ -replace '<script', '<script nonce="a1b2c3d"' } |
        Set-Content -Path $indexHtml

echo "Nonce added."