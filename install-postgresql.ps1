# Script para instalar PostgreSQL + PostGIS no Windows
# Execute como Administrador: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

Write-Host "=== INSTALADOR POSTGRESQL + POSTGIS ===" -ForegroundColor Green
Write-Host "Verificando sistema..." -ForegroundColor Yellow

# Verificar se já está instalado
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    Write-Host "✅ PostgreSQL já parece estar instalado!" -ForegroundColor Green
    Write-Host "Serviços encontrados:" -ForegroundColor Yellow
    $pgService | Format-Table Name, Status, DisplayName
    
    Write-Host "`n🔄 Testando conexão..." -ForegroundColor Blue
    try {
        $env:PGPASSWORD = "postgres"
        $result = & psql -U postgres -h localhost -c "SELECT version();" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL está funcionando!" -ForegroundColor Green
            Write-Host $result
        } else {
            Write-Host "❌ PostgreSQL instalado mas não conecta" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Comando psql não encontrado no PATH" -ForegroundColor Red
    }
    
    Write-Host "`n🔄 Verificando PostGIS..." -ForegroundColor Blue
    try {
        $env:PGPASSWORD = "postgres"
        $result = & psql -U postgres -h localhost -d postgres -c "CREATE EXTENSION IF NOT EXISTS postgis;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostGIS está disponível!" -ForegroundColor Green
        } else {
            Write-Host "❌ PostGIS não está instalado" -ForegroundColor Red
            Write-Host "Instale via: https://download.osgeo.org/postgis/windows/" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Erro ao verificar PostGIS" -ForegroundColor Red
    }
    
    exit
}

Write-Host "❌ PostgreSQL não encontrado" -ForegroundColor Red
Write-Host "`n📋 OPÇÕES DE INSTALAÇÃO:" -ForegroundColor Cyan

Write-Host "`n1️⃣  INSTALAÇÃO MANUAL (RECOMENDADA):" -ForegroundColor Yellow
Write-Host "   • Baixe: https://www.postgresql.org/download/windows/"
Write-Host "   • Escolha versão 15 ou 16"
Write-Host "   • Execute como Administrador"
Write-Host "   • Senha sugerida: postgres"
Write-Host "   • Porta: 5432"
Write-Host "   • Marque 'Stack Builder' para PostGIS"

Write-Host "`n2️⃣  VIA CHOCOLATEY (Execute PowerShell como Admin):" -ForegroundColor Yellow
Write-Host "   choco install postgresql --params '/Password:postgres' -y"
Write-Host "   choco install postgis -y"

Write-Host "`n3️⃣  VIA DOCKER (Para desenvolvimento):" -ForegroundColor Yellow
Write-Host "   docker run --name postgres-postgis -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgis/postgis"

Write-Host "`n4️⃣  POSTGRESQL PORTABLE:" -ForegroundColor Yellow
Write-Host "   • Baixe: https://sourceforge.net/projects/postgresqlportable/"
Write-Host "   • Não precisa instalação, roda direto"

Write-Host "`n🔄 Executando verificação automática..." -ForegroundColor Blue

# Tentar baixar automaticamente
$downloadUrl = "https://get.enterprisedb.com/postgresql/postgresql-16.1-1-windows-x64.exe"
$installerPath = "$env:TEMP\postgresql-installer.exe"

Write-Host "📥 Baixando PostgreSQL..." -ForegroundColor Blue
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "✅ Download concluído: $installerPath" -ForegroundColor Green
    
    Write-Host "`n🚀 Para instalar automaticamente:" -ForegroundColor Cyan
    Write-Host "Start-Process -FilePath '$installerPath' -ArgumentList '--mode unattended --superpassword postgres --servicename postgresql --serverport 5432' -Wait" -ForegroundColor White
    
    $response = Read-Host "`nDeseja executar a instalação agora? (s/n)"
    if ($response -eq 's' -or $response -eq 'S') {
        Write-Host "🔄 Instalando PostgreSQL..." -ForegroundColor Blue
        Start-Process -FilePath $installerPath -ArgumentList "--mode unattended --superpassword postgres --servicename postgresql --serverport 5432" -Wait
        Write-Host "✅ Instalação concluída!" -ForegroundColor Green
        
        # Adicionar ao PATH
        $pgPath = "C:\Program Files\PostgreSQL\16\bin"
        if (Test-Path $pgPath) {
            $env:PATH += ";$pgPath"
            [Environment]::SetEnvironmentVariable("PATH", $env:PATH, [EnvironmentVariableTarget]::User)
            Write-Host "✅ PostgreSQL adicionado ao PATH" -ForegroundColor Green
        }
        
        # Testar conexão
        Start-Sleep -Seconds 5
        Write-Host "`n🔄 Testando instalação..." -ForegroundColor Blue
        try {
            $env:PGPASSWORD = "postgres"
            & psql -U postgres -h localhost -c "SELECT version();"
            Write-Host "✅ PostgreSQL instalado com sucesso!" -ForegroundColor Green
            
            # Instalar PostGIS
            Write-Host "`n🔄 Para PostGIS, baixe de:" -ForegroundColor Yellow
            Write-Host "https://download.osgeo.org/postgis/windows/pg16/" -ForegroundColor Cyan
            
        } catch {
            Write-Host "❌ Erro na instalação" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Erro no download: $_" -ForegroundColor Red
    Write-Host "Faça download manual de: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

Write-Host "`n📖 APÓS A INSTALAÇÃO:" -ForegroundColor Cyan
Write-Host "1. Abra pgAdmin ou use psql"
Write-Host "2. Conecte com usuário 'postgres' e senha definida"
Write-Host "3. Crie o banco: CREATE DATABASE pgt_database;"
Write-Host "4. Execute o schema: \i c:/Users/USUARIO/OneDrive/Desktop/PGT/database/schema.sql"
Write-Host "5. Configure o .env do backend com as credenciais"

Write-Host "`n🔗 LINKS ÚTEIS:" -ForegroundColor Cyan
Write-Host "- PostgreSQL: https://www.postgresql.org/download/windows/"
Write-Host "- PostGIS: https://postgis.net/windows_downloads/"
Write-Host "- pgAdmin: https://www.pgadmin.org/download/"