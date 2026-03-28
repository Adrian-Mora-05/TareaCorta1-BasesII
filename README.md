# TareaCorta1-BasesII
Tarea corta #1 de Bases de Datos 2

# 🍽️ API de Gestión de Restaurantes

![Node.js](https://img.shields.io/badge/Node.js-20-green)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Keycloak](https://img.shields.io/badge/Auth-Keycloak-orange)
![Status](https://img.shields.io/badge/status-active-success)

Este proyecto es un API REST para la gestión de restaurantes, menús, reservas y pedidos, con autenticación y autorización mediante Keycloak.

---

## 📌 Descripción

La API permite:

* Registro y autenticación de usuarios
* Gestión de restaurantes (solo administradores)
* Administración de menús
* Creación de reservas
* Realización de pedidos

---

## 🏗️ Arquitectura del Sistema
```
        Cliente (Postman / Swagger)
               ↓
         ┌────────────┐
         │    API     │
         │  Node.js   │
         └─────┬──────┘
               ↓
     ┌──────────────────┐
     │ PostgreSQL (API) │
     │  restaurantdb    │
     └──────────────────┘

     ┌──────────────────┐
     │    Keycloak      │
     │  Auth Server     │
     └─────┬────────────┘
           ↓
     ┌──────────────────┐
     │ PostgreSQL (Auth)│
     │    keycloak      │
     └──────────────────┘
```

---

## 🚀 Tecnologías utilizadas

* **Node.js + Express**
* **PostgreSQL**
* **Keycloak**
* **Docker & Docker Compose**
* **JWT (JSON Web Tokens)**
* **Swagger UI + swagger-jsdoc**
* **Jest + Supertest** — Pruebas unitarias y de integración

---

## ⚙️ Requisitos previos

* Docker
* Docker Compose

---

## 📥 Instalación y ejecución

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPO>
cd <NOMBRE_DEL_PROYECTO>
```

### 2. Crear el archivo `.env` en la raíz
```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=postgres

REALM=restaurant

KEYCLOAK_DB=keycloak
RESTAURANT_DB=restaurantdb

KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin

KEYCLOAK_URL=http://keycloak:8080

KEYCLOAK_CLIENT_ID=api-restaurant
KEYCLOAK_CLIENT_SECRET=api-restaurant-secret

KEYCLOAK_ADMIN_CLIENT_ID=admin-cli

DB_HOST=db_api
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=restaurantdb
```

### 3. Levantar el proyecto
```bash
docker compose up --build
```

> ⚠️ La primera vez puede tardar 1-2 minutos mientras Keycloak inicializa e importa el realm.

### 4. Para detener y limpiar datos
```bash
docker compose down -v
```

> ⚠️ El flag `-v` elimina los volúmenes. Los datos se reinician completamente.

---

## 🌐 Servicios disponibles

| Servicio  | URL                            |
| --------- | ------------------------------ |
| API       | http://localhost:3000          |
| Swagger   | http://localhost:3000/api-docs |
| Keycloak  | http://localhost:8080          |

---

## 🔐 Autenticación

El sistema usa **Keycloak** para autenticación con JWT.

### Usuarios de prueba precargados

| Usuario  | Contraseña | Rol     |
| -------- | ---------- | ------- |
| admin1   | admin123   | admin   |
| cliente1 | cliente123 | cliente |

> ⚠️ Estos usuarios existen en Keycloak pero no en la base de datos de la API. Para usarlos con todos los endpoints, primero regístralos via `POST /auth/register` o créalos directamente con `POST /auth/login` y luego insértalos manualmente en la BD.

### Obtener token directamente desde Keycloak
```
POST http://localhost:8080/realms/restaurant/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

client_id=api-restaurant
client_secret=api-restaurant-secret
grant_type=password
username=admin1
password=admin123
```

### Obtener token desde la API
```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "admin1",
  "password": "admin123"
}
```

---

## 📡 Endpoints de la API

### 🔐 Auth

| Método | Endpoint        | Descripción              | Auth requerida |
| ------ | --------------- | ------------------------ | -------------- |
| POST   | /auth/register  | Registro de usuario      | No (opcional)  |
| POST   | /auth/login     | Obtención de JWT         | No             |

> Para crear un usuario con rol `admin`, se requiere un token de admin en el header.

### 👤 Usuarios

| Método | Endpoint    | Descripción                     | Rol     |
| ------ | ----------- | ------------------------------- | ------- |
| GET    | /users/me   | Obtener usuario autenticado     | Cualquiera |
| PUT    | /users/:id  | Actualizar usuario              | admin   |
| DELETE | /users/:id  | Eliminar usuario                | admin   |

### 🍽️ Restaurantes

| Método | Endpoint      | Descripción         | Rol         |
| ------ | ------------- | ------------------- | ----------- |
| POST   | /restaurants  | Crear restaurante   | admin       |
| GET    | /restaurants  | Listar restaurantes | autenticado |

### 📋 Menús

| Método | Endpoint    | Descripción     | Rol         |
| ------ | ----------- | --------------- | ----------- |
| POST   | /menus      | Crear menú      | admin       |
| GET    | /menus/:id  | Obtener menú    | autenticado |
| PUT    | /menus/:id  | Actualizar menú | admin       |
| DELETE | /menus/:id  | Eliminar menú   | admin       |

### 📅 Reservas

| Método | Endpoint           | Descripción      | Rol         |
| ------ | ------------------ | ---------------- | ----------- |
| POST   | /reservations      | Crear reserva    | autenticado |
| DELETE | /reservations/:id  | Cancelar reserva | autenticado |

### 🧾 Pedidos

| Método | Endpoint     | Descripción    | Rol         |
| ------ | ------------ | -------------- | ----------- |
| POST   | /orders      | Crear pedido   | autenticado |
| GET    | /orders/:id  | Obtener pedido | autenticado |

---

## 📖 Documentación interactiva (Swagger)

Una vez levantado el proyecto, accedé a:
```
http://localhost:3000/api-docs
```

### Cómo autenticarse en Swagger

1. Hacé login en `POST /auth/login`
2. Copiá el `access_token` de la respuesta
3. Hacé click en **Authorize 🔒** (arriba a la derecha)
4. Pegá el token con el formato: `Bearer eyJhbGci...`
5. Hacé click en **Authorize** y luego **Close**
6. Todos los endpoints protegidos usarán ese token automáticamente

---

## 🧪 Pruebas

El proyecto incluye pruebas unitarias y de integración con cobertura mínima del 90%.

### Tipos de prueba

**Pruebas unitarias** — prueban cada controller de forma aislada, mockeando todos los servicios externos (Keycloak, base de datos). No requieren ningún servicio corriendo.

**Pruebas de integración** — prueban el flujo completo de cada endpoint contra la base de datos real. Mockean únicamente Keycloak. Requieren que la base de datos esté corriendo.

### Ejecutar las pruebas

Desde la carpeta `api/`:
```bash
# Todas las pruebas con reporte de cobertura
cd api
npm test

# Solo pruebas unitarias
npm run test:unit

# Solo pruebas de integración
npm run test:integration
```

> ⚠️ Para las pruebas de integración, la base de datos debe estar corriendo:
> ```bash
> docker compose up db_api
> ```

### Cobertura actual

| Tipo         | Cobertura |
| ------------ | --------- |
| Statements   | ≥ 90%     |
| Branches     | ≥ 90%     |
| Functions    | ≥ 90%     |
| Lines        | ≥ 90%     |

El reporte detallado de cobertura se genera en la carpeta `api/coverage/` después de correr los tests. Podés abrirlo en el navegador:
```
api/coverage/lcov-report/index.html
```

---

## 🗄️ Base de datos

* **`restaurantdb`** — base de datos de la aplicación
  * Esquema: `restaurant`
  * Tablas: usuario, restaurante, menu, reservacion, pedido, plato, mesa, entre otras
  * Funciones almacenadas en PL/pgSQL para todas las operaciones principales

* **`keycloak`** — base de datos de autenticación, gestionada automáticamente por Keycloak

---

## 🧱 Buenas prácticas implementadas

* Separación de responsabilidades (API / Auth / DB)
* Bases de datos independientes por servicio
* Autenticación con JWT via Keycloak
* Control de acceso por roles (`admin` / `cliente`)
* Funciones almacenadas en PostgreSQL
* Documentación interactiva con Swagger
* Pruebas unitarias y de integración con 90%+ de cobertura
* Arquitectura contenedorizada con Docker Compose

---

## ⚠️ Notas importantes

* Keycloak corre en modo desarrollo (`start-dev`), no apto para producción
* Los tokens pueden invalidarse al reiniciar los contenedores — en ese caso volvé a hacer login
* Al usar `docker compose down -v` se pierden todos los datos

---

## 📈 Posibles mejoras

* Implementar frontend (React / Angular)
* Paginación en endpoints de listado
* Logs estructurados
* Deploy en la nube
* Modo producción de Keycloak con HTTPS

---

## 👨‍💻 Autores

Proyecto desarrollado para el curso de **Bases de Datos II**.

* Adrián Mora Rivera — 2024800149
* Tamara Robles Camacho — 2024099342