param([switch]$E2E)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$pgBin = Join-Path $root '.tools/pgsql/bin'
if (-not (Test-Path -LiteralPath (Join-Path $pgBin 'initdb.exe'))) { throw 'Install the portable PostgreSQL binaries in .tools/pgsql first. See docs/deployment.md.' }
$cluster = Join-Path $root ('.tools/pg-test-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $cluster | Out-Null
$passwordFile = Join-Path $cluster 'password.txt'
$password = [Guid]::NewGuid().ToString('N')
[IO.File]::WriteAllText($passwordFile, $password, (New-Object Text.UTF8Encoding($false)))
$data = Join-Path $cluster 'data'
$names = @('POSTGRES_DB','POSTGRES_USER','POSTGRES_PASSWORD','POSTGRES_HOST','POSTGRES_PORT','PGPASSWORD')
$previous = @{}
foreach ($name in $names) { $previous[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }
$started = $false
try {
    & (Join-Path $pgBin 'initdb.exe') -D $data -U portfolio --auth=scram-sha-256 --pwfile=$passwordFile --encoding=UTF8 --locale=C
    if ($LASTEXITCODE -ne 0) { throw 'initdb failed' }
    Remove-Item -LiteralPath $passwordFile
    & (Join-Path $pgBin 'pg_ctl.exe') -D $data -o '-h 127.0.0.1 -p 55432' -l (Join-Path $cluster 'postgres.log') -w start
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL startup failed' }
    $started = $true
    $env:PGPASSWORD = $password
    & (Join-Path $pgBin 'createdb.exe') -h 127.0.0.1 -p 55432 -U portfolio test_portfolio
    if ($LASTEXITCODE -ne 0) { throw 'Test database creation failed' }
    $env:POSTGRES_DB = 'test_portfolio'
    $env:POSTGRES_USER = 'portfolio'
    $env:POSTGRES_PASSWORD = $password
    $env:POSTGRES_HOST = '127.0.0.1'
    $env:POSTGRES_PORT = '55432'
    Push-Location (Join-Path $root 'backend')
    try {
        & (Join-Path $root 'backend/venv/Scripts/python.exe') -m pytest --junitxml=reports/postgres.xml --cov=games --cov-report=xml:reports/postgres-coverage.xml
        if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL tests failed' }
    } finally { Pop-Location }
    if ($E2E) {
        Push-Location (Join-Path $root 'frontend')
        try {
            npm.cmd run test:e2e
            if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL E2E tests failed' }
        } finally { Pop-Location }
    }
} finally {
    if ($started) { & (Join-Path $pgBin 'pg_ctl.exe') -D $data -m fast -w stop }
    foreach ($name in $names) { [Environment]::SetEnvironmentVariable($name, $previous[$name], 'Process') }
}
