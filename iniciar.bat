@echo off
rem Inicia o AmparaPet completo: MySQL portatil + front-end + API.
rem Use parar.bat para desligar os tres servicos.
title AmparaPet - Sistema (API + Front-end)
pushd "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File scripts\preparar.ps1 || goto erro
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\python.ps1 preparar || goto erro
if not exist ".env" copy ".env.example" ".env" >nul
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\banco.ps1 iniciar || goto erro
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\frontend.ps1 iniciar || goto erro

echo.
echo  Site:             http://localhost:5500/
echo  Painel admin:     http://localhost:5500/admin/login.html
echo  Documentacao API: http://localhost:8000/docs
echo.
rem Abre o front-end novo alguns segundos depois, quando os servicos ja estiverem no ar
if not defined AMPARAPET_SEM_NAVEGADOR start "" /b powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep 5; Start-Process 'http://localhost:5500/'"

cd backend
"..\python\python.exe" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
popd
exit /b

:erro
echo.
echo  Nao foi possivel iniciar. Leia a mensagem acima.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\frontend.ps1 parar >nul 2>&1
pause
popd
exit /b 1
