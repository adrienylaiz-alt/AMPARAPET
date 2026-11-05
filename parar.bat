@echo off
rem Desliga o front-end, a API e o MySQL portatil do AmparaPet.
pushd "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\frontend.ps1 parar
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\api.ps1 parar
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\banco.ps1 parar
popd
