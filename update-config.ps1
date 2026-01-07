# Script para adicionar config.js a todos os arquivos HTML
$files = @(
    "Escalas.html",
    "Escala Calendario.html",
    "Musicas.html",
    "Repertorio.html",
    "Componentes.html",
    "Cadastro de Musicas.html",
    "Cadastro de Repertorio.html",
    "Imagens.html"
)

foreach ($file in $files) {
    $path = "c:\Users\CBMAC\Desktop\Louvor\$file"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        
        # Adiciona script tag se não existir
        if ($content -notmatch 'config\.js') {
            $content = $content -replace '(<link rel="manifest" href="manifest.json">)', '$1  <script src="config.js"></script>'
        }
        
        # Substitui SCRIPT_URL
        $content = $content -replace 'const SCRIPT_URL = "https://script\.google\.com/macros/s/[^"]+";', 'const SCRIPT_URL = APP_CONFIG.SCRIPT_URL;'
        
        Set-Content $path $content -NoNewline
        Write-Host "Atualizado: $file"
    }
}

Write-Host "Concluído!"
