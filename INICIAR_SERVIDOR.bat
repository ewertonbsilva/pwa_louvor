@echo off
echo ========================================
echo   Servidor HTTP Local - Louvor CEVD
echo ========================================
echo.
echo Iniciando servidor na porta 8080...
echo.
echo Acesse no navegador:
echo   - Local: http://localhost:8080
echo.
echo Para descobrir o IP da rede:
ipconfig | findstr /i "IPv4"
echo.
echo Depois acesse de outros dispositivos:
echo   http://SEU_IP:8080
echo.
echo Pressione Ctrl+C para parar o servidor
echo ========================================
echo.

python -m http.server 8080
