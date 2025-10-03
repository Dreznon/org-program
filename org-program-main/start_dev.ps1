$repo = "C:\Users\sagac\Documents\Organization app\org-program-main"

if (-not (Test-Path $repo)) {
  Write-Host "[ERROR] Repo path not found: $repo"
  Pause
  exit 1
}

$fe = Join-Path $repo 'frontend'
if (-not (Test-Path $fe)) {
  Write-Host "[ERROR] Frontend dir not found: $fe"
  Get-ChildItem $repo
  Pause
  exit 1
}

# Backend
Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "cd '$repo'; python -V; python -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8000"
) -WindowStyle Normal -WorkingDirectory $repo

# Frontend
if (-not (Test-Path (Join-Path $fe '.env.development'))) {
  'VITE_API_BASE=http://127.0.0.1:8000' | Out-File -Encoding ascii -NoNewline (Join-Path $fe '.env.development')
}
Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "cd '$fe'; where.exe npm; npm -v; npm run dev"
) -WindowStyle Normal -WorkingDirectory $fe
