#!/bin/bash
# k8s/deploy.sh
#
# Despliega el stack completo en minikube con imágenes locales.
#
# Uso:
#   chmod +x k8s/deploy.sh
#   ./k8s/deploy.sh mongodb    (default)
#   ./k8s/deploy.sh postgres

set -e
ENGINE=${1:-mongodb}

# ── Prerequisitos ─────────────────────────────────────────────────
echo "Verificando minikube..."
minikube status | grep -q "Running" || {
  echo "ERROR: minikube no está corriendo."
  echo "Ejecuta: minikube start --memory=10240 --cpus=6"
  exit 1
}

echo "Apuntando Docker al daemon de minikube..."
eval $(minikube docker-env)

# ── Construir imágenes ────────────────────────────────────────────
echo "Construyendo imagen API..."
docker build -t restaurantes/api:latest ./api

echo "Construyendo imagen Search..."
docker build -t restaurantes/search:latest ./search_service

# ── Namespace ─────────────────────────────────────────────────────
kubectl apply -f k8s/namespace.yaml

# ── Secrets desde .env ───────────────────────────────────────────
if [ -f .env ]; then
  source .env
  kubectl create secret generic restaurantes-secrets \
    --from-literal=DB_USER="${POSTGRES_USER:-postgres}" \
    --from-literal=DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}" \
    --from-literal=KEYCLOAK_ADMIN="${KEYCLOAK_ADMIN:-admin}" \
    --from-literal=KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin}" \
    --from-literal=KEYCLOAK_CLIENT_ID="${KEYCLOAK_CLIENT_ID:-api-restaurant}" \
    --from-literal=KEYCLOAK_CLIENT_SECRET="${KEYCLOAK_CLIENT_SECRET:-api-restaurant-secret}" \
    -n restaurantes --dry-run=client -o yaml | kubectl apply -f -
else
  kubectl apply -f k8s/secrets.yaml -n restaurantes
fi

# ── ConfigMap ─────────────────────────────────────────────────────
kubectl apply -f k8s/configmap.yaml -n restaurantes
kubectl patch configmap restaurantes-config -n restaurantes \
  --patch "{\"data\": {\"DB_ENGINE\": \"$ENGINE\"}}"

# ── Realm Keycloak ────────────────────────────────────────────────
kubectl create configmap keycloak-realm-config \
  --from-file=realm-export.json=./keycloak/realm-export.json \
  -n restaurantes --dry-run=client -o yaml | kubectl apply -f -

# ── Infraestructura ───────────────────────────────────────────────
kubectl apply -f k8s/redis/deployment.yaml          -n restaurantes
kubectl apply -f k8s/elasticsearch/statefulset.yaml  -n restaurantes
kubectl apply -f k8s/keycloak/deployment.yaml        -n restaurantes

if [ "$ENGINE" = "mongodb" ]; then
  echo "Desplegando MongoDB sharded (configsvr + shard + mongos + init Job)..."
  kubectl apply -f k8s/mongodb/statefulset.yaml -n restaurantes

  echo "Esperando config servers..."
  kubectl wait --for=condition=ready pod -l app=configsvr \
    --timeout=120s -n restaurantes

  echo "Esperando shard nodes..."
  kubectl wait --for=condition=ready pod -l app=shard \
    --timeout=120s -n restaurantes

  echo "Esperando mongos..."
  kubectl wait --for=condition=ready pod -l app=mongos \
    --timeout=60s -n restaurantes

  echo "Esperando Job mongo-init..."
  kubectl wait --for=condition=complete job/mongo-init \
    --timeout=120s -n restaurantes
else
  kubectl apply -f k8s/postgres/statefulset.yaml -n restaurantes
  kubectl wait --for=condition=ready pod -l app=postgres \
    --timeout=120s -n restaurantes
fi

echo "Esperando Redis..."
kubectl wait --for=condition=ready pod -l app=redis \
  --timeout=60s -n restaurantes

echo "Esperando ElasticSearch..."
kubectl wait --for=condition=ready pod -l app=elasticsearch \
  --timeout=180s -n restaurantes

echo "Esperando Keycloak..."
kubectl wait --for=condition=ready pod -l app=keycloak \
  --timeout=180s -n restaurantes

# ── Microservicios ────────────────────────────────────────────────
kubectl apply -f k8s/api/deployment.yaml    -n restaurantes
kubectl apply -f k8s/api/hpa.yaml           -n restaurantes
kubectl apply -f k8s/search/deployment.yaml -n restaurantes
kubectl apply -f k8s/nginx/deployment.yaml  -n restaurantes

echo ""
echo "========================================"
echo " Stack completo desplegado"
echo "========================================"
kubectl get pods     -n restaurantes
echo ""
kubectl get services -n restaurantes
echo ""
echo "Verificar sharding:"
echo "  kubectl exec -it \$(kubectl get pod -l app=mongos -n restaurantes -o name | head -1) -n restaurantes -- mongosh --eval 'sh.status()'"
echo ""
echo "Escalar API:"
echo "  kubectl scale deployment api --replicas=5 -n restaurantes"
echo ""
echo "Ver HPA:"
echo "  kubectl get hpa -n restaurantes -w"