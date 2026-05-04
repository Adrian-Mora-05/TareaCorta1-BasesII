# deploy.ps1
# Script de despliegue completo para Kubernetes con Minikube
# Uso: .\deploy.ps1

param(
    [switch]$Clean  # Usar con -Clean para borrar todo antes de desplegar
)

$NS = "restaurantes"

# ── Limpieza opcional ─────────────────────────────────────────────
if ($Clean) {
    Write-Host "`n[1/2] Limpiando cluster anterior..." -ForegroundColor Yellow
    minikube delete
    Write-Host "Cluster eliminado." -ForegroundColor Green
}

# ── Arrancar minikube ─────────────────────────────────────────────
Write-Host "`n[2/2] Arrancando Minikube..." -ForegroundColor Yellow
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
Write-Host "Aplicando configuración..." -ForegroundColor Yellow
kubectl apply -f k8s/configmap.yaml  -n $NS
kubectl apply -f k8s/secrets.yaml    -n $NS

# ── Realm de Keycloak ─────────────────────────────────────────────
Write-Host "Cargando realm de Keycloak..." -ForegroundColor Yellow
kubectl create configmap keycloak-realm-config `
    --from-file=realm-export.json=./keycloak/realm-export.json `
    -n $NS --dry-run=client -o yaml | kubectl apply -f -

# ── Infraestructura base ──────────────────────────────────────────
Write-Host "`nLevantando infraestructura..." -ForegroundColor Yellow
kubectl apply -f k8s/redis/deployment.yaml           -n $NS
kubectl apply -f k8s/elasticsearch/statefulset.yaml  -n $NS
kubectl apply -f k8s/mongodb/statefulset.yaml        -n $NS
kubectl apply -f k8s/keycloak/keycloak-stack.yaml    -n $NS

# ── Esperar MongoDB ───────────────────────────────────────────────
Write-Host "`nEsperando MongoDB (puede tardar 2 minutos)..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=configsvr --timeout=180s -n $NS
kubectl wait --for=condition=ready pod -l app=shard     --timeout=180s -n $NS
kubectl wait --for=condition=ready pod -l app=mongos    --timeout=90s  -n $NS
kubectl wait --for=condition=complete job/mongo-init    --timeout=120s -n $NS
Write-Host "MongoDB listo." -ForegroundColor Green

# ── Esperar Keycloak PostgreSQL ───────────────────────────────────
Write-Host "`nEsperando PostgreSQL de Keycloak..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=keycloak-postgres --timeout=120s -n $NS
Write-Host "PostgreSQL listo." -ForegroundColor Green

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

# ── Esperar servicios ─────────────────────────────────────────────
Write-Host "`nEsperando API y Search..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=api    --timeout=120s -n $NS
kubectl wait --for=condition=ready pod -l app=search --timeout=120s -n $NS
kubectl wait --for=condition=ready pod -l app=nginx  --timeout=60s  -n $NS
Write-Host "Servicios listos." -ForegroundColor Green

# ── Resumen ───────────────────────────────────────────────────────
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE COMPLETADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
kubectl get pods -n $NS
Write-Host "`nPara acceder a los servicios:" -ForegroundColor Yellow
Write-Host "  1. En otra terminal ejecuta: minikube tunnel"
Write-Host "  2. API + Search via Nginx:   http://localhost"
Write-Host "  3. Keycloak (port-forward):  kubectl port-forward svc/keycloak-service 9999:8080 -n restaurantes"
Write-Host "     Token:  POST http://localhost:9999/realms/restaurant/protocol/openid-connect/token"
Write-Host "`nEndpoints principales:"
Write-Host "  GET  http://localhost/health"
Write-Host "  GET  http://localhost/api/restaurants        (requiere token)"
Write-Host "  GET  http://localhost/search/products?q=pizza"
Write-Host "  POST http://localhost/search/reindex"