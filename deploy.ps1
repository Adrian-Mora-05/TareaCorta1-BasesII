# deploy.ps1
# Script de despliegue completo para Kubernetes con Minikube
#
# Uso:
#   .\deploy.ps1                    → MongoDB (default)
#   .\deploy.ps1 -Engine postgres   → PostgreSQL
#   .\deploy.ps1 -Clean             → Borra cluster antes (MongoDB)
#   .\deploy.ps1 -Engine postgres -Clean → Borra cluster y usa PostgreSQL

param(
    [ValidateSet("mongodb", "postgres")]
    [string]$Engine = "mongodb",
    [switch]$Clean
)

$NS = "restaurantes"

# ── Limpieza opcional ─────────────────────────────────────────────
if ($Clean) {
    Write-Host "`nLimpiando cluster anterior..." -ForegroundColor Yellow
    minikube delete
    Write-Host "Cluster eliminado." -ForegroundColor Green
}

# ── Arrancar minikube ─────────────────────────────────────────────
Write-Host "`nArrancando Minikube..." -ForegroundColor Yellow
minikube start --memory=7598 --cpus=3
if ($LASTEXITCODE -ne 0) { Write-Host "Error arrancando Minikube" -ForegroundColor Red; exit 1 }

# ── Cargar imágenes locales ───────────────────────────────────────
Write-Host "`nCargando imágenes en Minikube..." -ForegroundColor Yellow
minikube image load restaurantes/api:latest
minikube image load restaurantes/search:latest
Write-Host "Imágenes cargadas." -ForegroundColor Green

# ── Namespace ─────────────────────────────────────────────────────
Write-Host "`nCreando namespace..." -ForegroundColor Yellow
kubectl apply -f k8s/namespace.yaml

# ── ConfigMap y Secrets ───────────────────────────────────────────
Write-Host "Aplicando configuración (motor: $Engine)..." -ForegroundColor Yellow
kubectl apply -f k8s/configmap.yaml -n $NS
kubectl apply -f k8s/secrets.yaml   -n $NS
$patch = @{
  data = @{
    DB_ENGINE = $Engine
  }
} | ConvertTo-Json -Compress

kubectl patch configmap restaurantes-config -n $NS --patch $patch

# ── Realm de Keycloak ─────────────────────────────────────────────
Write-Host "Cargando realm de Keycloak..." -ForegroundColor Yellow
kubectl create configmap keycloak-realm-config `
    --from-file=realm-export.json=./keycloak/realm-export.json `
    -n $NS --dry-run=client -o yaml | kubectl apply -f -

# ── Infraestructura base ──────────────────────────────────────────
Write-Host "`nLevantando infraestructura base..." -ForegroundColor Yellow
kubectl apply -f k8s/redis/deployment.yaml          -n $NS
kubectl apply -f k8s/elasticsearch/statefulset.yaml -n $NS
kubectl apply -f k8s/keycloak/keycloak-stack.yaml   -n $NS

# ── Base de datos según motor ─────────────────────────────────────
if ($Engine -eq "mongodb") {
    Write-Host "`nDesplegando MongoDB sharded..." -ForegroundColor Yellow
    kubectl apply -f k8s/mongodb/statefulset.yaml -n $NS

    Write-Host "Esperando config server..." -ForegroundColor Yellow
    kubectl wait --for=condition=ready pod -l app=configsvr --timeout=180s -n $NS
    Write-Host "Esperando shard..." -ForegroundColor Yellow
    kubectl wait --for=condition=ready pod -l app=shard     --timeout=180s -n $NS
    Write-Host "Esperando mongos..." -ForegroundColor Yellow
    kubectl wait --for=condition=ready pod -l app=mongos    --timeout=90s  -n $NS
    Write-Host "Esperando Job de init..." -ForegroundColor Yellow
    kubectl wait --for=condition=complete job/mongo-init    --timeout=120s -n $NS
    Write-Host "MongoDB listo." -ForegroundColor Green

} else {
    Write-Host "`nDesplegando PostgreSQL..." -ForegroundColor Yellow
    kubectl apply -f k8s/postgres/statefulset.yaml -n $NS
    kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s -n $NS
    Write-Host "PostgreSQL listo." -ForegroundColor Green
}

# ── Esperar Keycloak PostgreSQL ───────────────────────────────────
Write-Host "`nEsperando PostgreSQL de Keycloak..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=keycloak-postgres --timeout=120s -n $NS
Write-Host "PostgreSQL de Keycloak listo." -ForegroundColor Green

# ── Esperar Keycloak ──────────────────────────────────────────────
Write-Host "`nEsperando Keycloak (puede tardar 2-3 minutos)..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=keycloak --timeout=300s -n $NS
Write-Host "Keycloak listo." -ForegroundColor Green

# ── Microservicios ────────────────────────────────────────────────
Write-Host "`nLevantando microservicios..." -ForegroundColor Yellow
kubectl apply -f k8s/api/deployment.yaml    -n $NS
kubectl apply -f k8s/api/hpa.yaml           -n $NS
kubectl apply -f k8s/search/deployment.yaml -n $NS
kubectl apply -f k8s/nginx/deployment.yaml  -n $NS

Write-Host "`nEsperando API, Search y Nginx..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=api    --timeout=120s -n $NS
kubectl wait --for=condition=ready pod -l app=search --timeout=120s -n $NS
kubectl wait --for=condition=ready pod -l app=nginx  --timeout=60s  -n $NS
Write-Host "Servicios listos." -ForegroundColor Green

# ── Resumen ───────────────────────────────────────────────────────
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE COMPLETADO - Motor: $Engine" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
kubectl get pods -n $NS
Write-Host "`nPasos para acceder:" -ForegroundColor Yellow
Write-Host "  1. En otra terminal (dejarla abierta): minikube tunnel"
Write-Host "  2. En otra terminal (dejarla abierta): kubectl port-forward svc/keycloak-service 9999:8080 -n restaurantes"
Write-Host "`nEndpoints:"
Write-Host "  GET  http://localhost/health"
Write-Host "  GET  http://localhost/api/restaurants        (requiere token)"
Write-Host "  GET  http://localhost/search/products?q=pizza"
Write-Host "  POST http://localhost/search/reindex"
Write-Host "`nObtener token:"
Write-Host "  POST http://localhost:9999/realms/restaurant/protocol/openid-connect/token"
Write-Host "  Body (x-www-form-urlencoded):"
Write-Host "    grant_type=password  client_id=api-restaurant"
Write-Host "    client_secret=api-restaurant-secret"
Write-Host "    username=admin1  password=admin123"