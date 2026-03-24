# TareaCorta1-BasesII
Tarea corta #1 de Bases de Datos 2

# 🍽️ API de Gestión de Restaurantes

Este proyecto consiste en una API REST para la gestión de restaurantes, menús, reservas y pedidos, utilizando autenticación y autorización mediante Keycloak.

---

## 📌 Descripción

La API permite:

* Registro y autenticación de usuarios
* Gestión de restaurantes (solo administradores)
* Administración de menús
* Creación de reservas
* Realización de pedidos

El sistema está diseñado siguiendo buenas prácticas de arquitectura moderna, separando los servicios de autenticación y base de datos.

---

## 🏗️ Arquitectura del Sistema

El sistema está compuesto por los siguientes servicios:

* **API Backend (Node.js + Express)**
* **Base de datos de la aplicación (PostgreSQL)**
* **Servidor de autenticación (Keycloak)**
* **Base de datos de Keycloak (PostgreSQL independiente)**

```
Cliente (Postman)
        ↓
     API (Node.js)
        ↓
  PostgreSQL (restaurantdb)

Keycloak (Auth Server)
        ↓
PostgreSQL (keycloak)
```

---

## 🚀 Tecnologías utilizadas

* Node.js
* Express
* PostgreSQL
* Keycloak
* Docker & Docker Compose
* JWT (JSON Web Tokens)

---

## ⚙️ Configuración del entorno

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd <NOMBRE_DEL_PROYECTO>
```

---

### 2. Variables de entorno

Crear un archivo `.env` en la raíz con el siguiente contenido:

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin

RESTAURANT_DB=restaurantdb
KEYCLOAK_DB=keycloak

KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin

KEYCLOAK_URL=http://keycloak:8080

DB_HOST=db_api
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=restaurantdb
```

---

### 3. Levantar el proyecto

```bash
docker compose up --build
```

---

## 🌐 Servicios disponibles

* API: http://localhost:3000
* Keycloak: http://localhost:8080

---

## 🔐 Autenticación

La autenticación se maneja mediante Keycloak usando JWT.

### Usuarios de prueba

| Usuario  | Contraseña | Rol     |
| -------- | ---------- | ------- |
| admin1   | admin123   | admin   |
| cliente1 | cliente123 | cliente |

---

### Obtener token

**POST**

```
http://localhost:8080/realms/restaurant/protocol/openid-connect/token
```

Body (x-www-form-urlencoded):

```
client_id=api-restaurant
client_secret=api-restaurant-secret
grant_type=password
username=admin1
password=admin123
```

---

## 📡 Endpoints de la API

### 🔐 Auth

* `POST /auth/register` → Registro de usuario *(opcional si se usa Keycloak directamente)*
* `POST /auth/login` → Obtención de JWT

---

### 👤 Usuarios

* `GET /users/me` → Obtener usuario autenticado
* `PUT /users/:id` → Actualizar usuario
* `DELETE /users/:id` → Eliminar usuario

---

### 🍽️ Restaurantes

* `POST /restaurants` → Crear restaurante *(admin)*
* `GET /restaurants` → Listar restaurantes

---

### 📋 Menús

* `POST /menus` → Crear menú *(admin)*
* `GET /menus/:id` → Obtener menú
* `PUT /menus/:id` → Actualizar menú *(admin)*
* `DELETE /menus/:id` → Eliminar menú *(admin)*

---

### 📅 Reservas

* `POST /reservations` → Crear reserva
* `DELETE /reservations/:id` → Cancelar reserva

---

### 🧾 Pedidos

* `POST /orders` → Crear pedido
* `GET /orders/:id` → Obtener pedido

---

## 🧪 Pruebas

Se recomienda usar **Postman** para probar la API.

### Ejemplo: Crear restaurante

**POST** `http://localhost:3000/restaurants`

Headers:

```
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Pizza Planet",
  "direccion": "San José",
  "telefono": "2222-2222"
}
```

---

## 🗄️ Base de datos

* La base de datos de la aplicación (`restaurantdb`) contiene:

  * Esquema `restaurant`
  * Tablas: restaurantes, menús, etc.
  * Funciones almacenadas (PL/pgSQL)

* La base de datos de Keycloak es independiente y gestionada automáticamente.

---

## 🧱 Buenas prácticas implementadas

* Separación de responsabilidades (API, Auth, DB)
* Uso de contenedores independientes
* Autenticación con JWT
* Uso de roles (`admin`, `cliente`)
* Uso de funciones almacenadas en PostgreSQL
* Arquitectura escalable

---

## ⚠️ Notas importantes

* El sistema usa Keycloak en modo desarrollo
* No está optimizado para producción
* Los datos se reinician al usar `docker compose down -v`

---

## 👨‍💻 Autor

Proyecto desarrollado como parte del curso de Bases de Datos II.
Tamara Robles (2024099342)
Adrián Mora Rivera (2024800149)
---





-----------


----------



# 🍽️ Restaurant Management API

![Node.js](https://img.shields.io/badge/Node.js-20-green)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Keycloak](https://img.shields.io/badge/Auth-Keycloak-orange)
![Status](https://img.shields.io/badge/status-active-success)

---

## 📌 Descripción

API REST para la gestión de restaurantes que permite administrar:

* Restaurantes
* Menús
* Reservas
* Pedidos
* Usuarios autenticados

El sistema implementa autenticación y autorización basada en **JWT** mediante Keycloak, siguiendo una arquitectura desacoplada y escalable.

---

## 🏗️ Arquitectura

El sistema está compuesto por múltiples servicios independientes:

```
        Cliente (Postman)
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

---

## ⚙️ Configuración del proyecto

### 🔧 Requisitos

* Docker
* Docker Compose

---

### 📥 Instalación

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_PROYECTO>
```

---

### 🔑 Variables de entorno

Crear archivo `.env`:

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin

RESTAURANT_DB=restaurantdb
KEYCLOAK_DB=keycloak

KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin

KEYCLOAK_URL=http://keycloak:8080

DB_HOST=db_api
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=restaurantdb
```

---

### ▶️ Ejecución

```bash
docker compose up --build
```

---

## 🌐 Servicios

| Servicio | URL                   |
| -------- | --------------------- |
| API      | http://localhost:3000 |
| Keycloak | http://localhost:8080 |

---

## 🔐 Autenticación

El sistema utiliza **Keycloak** para manejar autenticación.

### 👤 Usuarios de prueba

| Usuario  | Contraseña | Rol     |
| -------- | ---------- | ------- |
| admin1   | admin123   | admin   |
| cliente1 | cliente123 | cliente |

---

### 🔑 Obtener Token

**POST**

```
http://localhost:8080/realms/restaurant/protocol/openid-connect/token
```

Body:

```
client_id=api-restaurant
client_secret=api-restaurant-secret
grant_type=password
username=admin1
password=admin123
```

---

## 📡 Endpoints

### 🍽️ Restaurantes

| Método | Endpoint     | Descripción         | Rol     |
| ------ | ------------ | ------------------- | ------- |
| POST   | /restaurants | Crear restaurante   | admin   |
| GET    | /restaurants | Listar restaurantes | público |

---

### 📋 Menús

| Método | Endpoint   | Descripción     | Rol         |
| ------ | ---------- | --------------- | ----------- |
| POST   | /menus     | Crear menú      | admin       |
| GET    | /menus/:id | Obtener menú    | autenticado |
| PUT    | /menus/:id | Actualizar menú | admin       |
| DELETE | /menus/:id | Eliminar menú   | admin       |

---

### 📅 Reservas

| Método | Endpoint          | Descripción      |
| ------ | ----------------- | ---------------- |
| POST   | /reservations     | Crear reserva    |
| DELETE | /reservations/:id | Cancelar reserva |

---

### 🧾 Pedidos

| Método | Endpoint    | Descripción    |
| ------ | ----------- | -------------- |
| POST   | /orders     | Crear pedido   |
| GET    | /orders/:id | Obtener pedido |

---

### 👤 Usuarios

| Método | Endpoint   |
| ------ | ---------- |
| GET    | /users/me  |
| PUT    | /users/:id |
| DELETE | /users/:id |

---

## 🧪 Pruebas con Postman

### Crear restaurante

```
POST http://localhost:3000/restaurants
```

Headers:

```
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Pizza Planet",
  "direccion": "San José",
  "telefono": "2222-2222"
}
```

---

## 🗄️ Base de Datos

### 📦 API Database

* Base: `restaurantdb`
* Esquema: `restaurant`
* Contiene:

  * Tablas
  * Funciones PL/pgSQL

### 🔐 Keycloak Database

* Base: `keycloak`
* Gestionada automáticamente por Keycloak

---

## 🧱 Buenas prácticas implementadas

* Separación de servicios (API / Auth / DB)
* Bases de datos independientes
* Uso de Docker
* Autenticación con JWT
* Control de roles (admin / cliente)
* Uso de funciones almacenadas
* Arquitectura escalable

---

## ⚠️ Problemas conocidos

* Tokens pueden invalidarse al reiniciar contenedores
* Keycloak corre en modo desarrollo
* No hay frontend (API probada con Postman)

---

## 📈 Posibles mejoras

* Implementar frontend (React / Angular)
* Paginación en endpoints
* Logs estructurados
* Tests automatizados
* Deploy en la nube

---

## 👨‍💻 Autor

Proyecto desarrollado para el curso de **Bases de Datos II**.

---
