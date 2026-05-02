# OCI One-Click Deploy (PowerShell)
$IP = "144.24.11.149"
$USER = "ubuntu"
$REMOTE_PATH = "~/daily_stock_analysis"

Write-Host "Starting deployment to OCI ($IP)..." -ForegroundColor Cyan
$remoteCmd = "cd $REMOTE_PATH && git pull origin main && docker compose -f ./docker/docker-compose.yml up -d --build"

ssh -i "$HOME\.ssh\new_oci.key" -o ConnectTimeout=10 "${USER}@${IP}" "$remoteCmd"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment Successful! Visit http://stock168.dky.tw:8000" -ForegroundColor Green
} else {
    Write-Host "Deployment Failed. Check your SSH keys or IP address." -ForegroundColor Red
}
