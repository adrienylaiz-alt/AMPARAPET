# Inicia ou encerra o servidor HTTP do front-end oficial (pasta .\frontend).
# Uso: powershell -ExecutionPolicy Bypass -File scripts\frontend.ps1 iniciar|parar|status
param([ValidateSet("iniciar", "parar", "status")][string]$acao = "status")

$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot
$python = Join-Path $raiz "python\python.exe"
$pastaFrontend = Join-Path $raiz "frontend"
$porta = 5500

function Obter-ProcessosFrontend {
    if (-not (Test-Path $python)) { return @() }
    $pythonReal = (Resolve-Path $python).Path
    return @(Get-CimInstance Win32_Process -Filter "Name = 'python.exe'" |
        Where-Object {
            $_.ExecutablePath -and
            $_.ExecutablePath.Equals($pythonReal, [StringComparison]::OrdinalIgnoreCase) -and
            $_.CommandLine -like "*http.server 5500*" -and
            $_.CommandLine.IndexOf($pastaFrontend, [StringComparison]::OrdinalIgnoreCase) -ge 0
        })
}

function Porta-Respondendo {
    $cliente = New-Object Net.Sockets.TcpClient
    try {
        $tentativa = $cliente.BeginConnect("127.0.0.1", $porta, $null, $null)
        if (-not $tentativa.AsyncWaitHandle.WaitOne(300)) { return $false }
        $cliente.EndConnect($tentativa)
        return $true
    } catch {
        return $false
    } finally {
        $cliente.Close()
    }
}

switch ($acao) {
    "iniciar" {
        if (-not (Test-Path $python)) {
            Write-Host "Python portatil nao encontrado. Execute iniciar.bat novamente." -ForegroundColor Red
            exit 1
        }
        if (-not (Test-Path $pastaFrontend)) {
            Write-Host "A pasta frontend nao foi encontrada: $pastaFrontend" -ForegroundColor Red
            exit 1
        }

        $processos = @(Obter-ProcessosFrontend)
        if ($processos.Count -gt 0 -and (Porta-Respondendo)) {
            Write-Host "Front-end ja esta rodando em http://localhost:$porta/" -ForegroundColor Green
            break
        }
        if (Porta-Respondendo) {
            Write-Host "A porta $porta ja esta sendo usada por outro programa. Feche-o e tente novamente." -ForegroundColor Red
            exit 1
        }

        $argumentos = "-m http.server $porta --bind 127.0.0.1 --directory `"$pastaFrontend`""
        Start-Process -FilePath $python -ArgumentList $argumentos -WorkingDirectory $raiz -WindowStyle Hidden

        $pronto = $false
        for ($i = 0; $i -lt 30; $i++) {
            Start-Sleep -Milliseconds 250
            if (Porta-Respondendo) { $pronto = $true; break }
        }
        if (-not $pronto) {
            Write-Host "Nao foi possivel iniciar o front-end. Verifique se a porta $porta esta livre." -ForegroundColor Red
            exit 1
        }
        Write-Host "Front-end iniciado em http://localhost:$porta/" -ForegroundColor Green
    }
    "parar" {
        $processos = @(Obter-ProcessosFrontend)
        if ($processos.Count -eq 0) {
            Write-Host "Front-end ja esta parado."
            break
        }
        foreach ($processo in $processos) {
            & taskkill.exe /PID $processo.ProcessId /T /F 2>&1 | Out-Null
        }
        Write-Host "Front-end parado."
    }
    "status" {
        if (@(Obter-ProcessosFrontend).Count -gt 0 -and (Porta-Respondendo)) {
            Write-Host "Front-end rodando em http://localhost:$porta/"
        } else {
            Write-Host "Front-end parado."
        }
    }
}
