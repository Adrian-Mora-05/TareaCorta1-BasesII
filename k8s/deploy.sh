#!/bin/bash
# deploy.sh — Despliegue completo en Minikube (Linux/Mac)
#
# Uso:
#   chmod +x deploy.sh
#   ./deploy.sh              → MongoDB (default)
#   ./deploy.sh postgres     → PostgreSQL
#   ./deploy.sh mongodb --clean → Borra cluster y despliega

set -e

ENGINE=${1:-mongodb}
CLEAN=${2:-""}
NS="restaurantes"

# ── Limpieza opcional ─────────────────────────────────────────────
if [ "$CLEAN" = "--clean" ]; then
    echo "Limpiando cluster anterior..."
    minikube delete
fi

# ── Arrancar minikube ─────────────────────────────────────────────
echo "Arrancando Minikube..."
minikube start --memory=7598 --cpus=3

# ── Cargar imágenes ───────────────────────────────────────────────
echo "Cargando imágenes en Minikube..."
minikube image load restaurantes/api:latest
minikube image load restaurantes/search:latest

# ── Namespace ─────────────────────────────────────────────────────
kubectl apply -f k8s/namespace.yaml

# ── ConfigMap y Secrets ───────────────────────────────────────────
echo "Aplicando configuración (motor: $ENGINE)..."
kubectl apply -f k8s/configmap.yaml -n $NS
kubectl apply -f k8s/secrets.yaml   -n $NS
kubectl patch configmap restaurantes-config -n $NS \
    --patch "{\"data\": {\"DB_ENGINE\": \"$ENGINE\"}}"

# ── Realm de Keycloak ─────────────────────────────────────────────
kubectl create configmap keycloak-realm-config \
    --from-file=realm-export.json=./keycloak/realm-export.json \
    -n $NS --dry-run=client -o yaml | kubectl apply -f -

# ── Infraestructura base ──────────────────────────────────────────
echo "Levantando infraestructura base..."
kubectl apply -f k8s/redis/deployment.yaml          -n $NS
kubectl apply -f k8s/elasticsearch/statefulset.yaml -n $NS
kubectl apply -f k8s/keycloak/keycloak-stack.yaml   -n $NS

# ── Base de datos según motor ─────────────────────────────────────
if [ "$ENGINE" = "mongodb" ]; then
    echo "Desplegando MongoDB sharded..."
    kubectl apply -f k8s/mongodb/statefulset.yaml -n $NS

    echo "Esperando config server..."
    kubectl wait --for=condition=ready pod -l app=configsvr --timeout=180s -n $NS
    echo "Esperando shard..."
    kubectl wait --for=condition=ready pod -l app=shard     --timeout=180s -n $NS
    echo "Esperando mongos..."
    kubectl wait --for=condition=ready pod -l app=mongos    --timeout=90s  -n $NS
    echo "Esperando Job de init..."
    kubectl wait --for=condition=complete job/mongo-init    --timeout=120s -n $NS
    echo "MongoDB listo."
else
    echo "Desplegando PostgreSQL..."
    kubectl apply -f k8s/postgres/statefulset.yaml -n $NS
    kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s -n $NS
    echo "PostgreSQL listo."
fi

# ── Esperar Keycloak PostgreSQL y Keycloak ────────────────────────
echo "Esperando PostgreSQL de Keycloak..."
kubectl wait --for=condition=ready pod -l app=keycloak-postgres --timeout=120s -n $NS

echo "Esperando Keycloak (puede tardar 2-3 minutos)..."
kubectl wait --for=condition=ready pod -l app=keycloak --timeout=300s -n $NS
echo "Keycloak listo."

# ── Microservicios ────────────────────────────────────────────────
echo "Levantando microservicios..."
kubectl apply -f k8s/api/deployment.yaml    -n $NS
kubectl apply -f k8s/api/hpa.yaml           -n $NS
kubectl apply -f k8s/search/deployment.yaml -n $NS
kubectl apply -f k8s/nginx/deployment.yaml  -n $NS

kubectl wait --for=condition=ready pod -l app=api    --timeout=120s -n $NS
kubectl wait --for=condition=ready pod -l app=search --timeout=120s -n $NS
kubectl wait --for=condition=ready pod -l app=nginx  --timeout=60s  -n $NS

# ── Resumen ───────────────────────────────────────────────────────
echo ""
echo "========================================"
echo "  DESPLIEGUE COMPLETADO — Motor: $ENGINE"
echo "========================================"
kubectl get pods -n $NS
echo ""
echo "Pasos para acceder:"
echo "  1. En otra terminal: minikube tunnel"
echo "  2. En otra terminal: kubectl port-forward svc/keycloak-service 9999:8080 -n restaurantes"
echo ""
echo "Endpoints:"
echo "  GET  http://localhost/health"
echo "  GET  http://localhost/api/restaurants  (requiere token)"
echo "  GET  http://localhost/search/products?q=pizza"
echo "  POST http://localhost/search/reindex"