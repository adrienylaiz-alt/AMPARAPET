@echo off
rem Serve o front-end do AmparaPet (pasta frontend\) em http://localhost:5500
rem A API precisa estar ligada (iniciar.bat ou AmparaPet.exe). O endereco da API fica em frontend\js\config.js.
title AmparaPet - Front-end (feche esta janela para desligar)
pushd "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\python.ps1 preparar || goto erro
echo.
echo  Site:        http://localhost:5500/
echo  Painel admin: http://localhost:5500/admin/login.html
echo.
if not defined AMPARAPET_SEM_NAVEGADOR start "" /b powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep 2; Start-Process 'http://localhost:5500/'"
"python\python.exe" -m http.server 5500 --bind 127.0.0.1 --directory frontend
popd
exit /b

:erro
echo.
echo  Nao foi possivel iniciar. Leia a mensagem acima.
pause
popd
exit /b 1
