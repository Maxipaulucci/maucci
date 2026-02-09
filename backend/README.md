# Backend Spring Boot - Sistema de Turnos Maxturnos

Backend desarrollado con Spring Boot 3.2.0 para el sistema de gestión de turnos.

## Requisitos

- Java 17 o superior
- Maven 3.6+
- MongoDB 4.4+

## Configuración

1. **Configurar variables de entorno** (obligatorio para email; en producción no guardar en código):

```properties
MONGODB_URI=mongodb://localhost:27017/macci
SPRING_MAIL_USERNAME=tu-email@gmail.com
SPRING_MAIL_PASSWORD=tu-app-password
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Para producción y cómo mantener el backend siempre en ejecución, ver **[DEPLOYMENT.md](DEPLOYMENT.md)**.

2. **O editar `src/main/resources/application.properties`** directamente.

## Instalación y Ejecución

### Opción 1: Maven Wrapper (recomendado)

```bash
cd backend-springboot
./mvnw spring-boot:run
```

### Opción 2: Maven instalado

```bash
cd backend-springboot
mvn clean install
mvn spring-boot:run
```

### Opción 3: Ejecutar JAR

```bash
cd backend-springboot
mvn clean package
java -jar target/turnos-backend-1.0.0.jar
```

## Estructura del Proyecto

```
backend-springboot/
├── src/
│   ├── main/
│   │   ├── java/com/maxturnos/
│   │   │   ├── config/          # Configuraciones (CORS, Security)
│   │   │   ├── controller/      # Controladores REST
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── model/            # Entidades MongoDB
│   │   │   ├── repository/      # Repositorios Spring Data
│   │   │   ├── service/          # Lógica de negocio
│   │   │   └── TurnosApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
└── pom.xml
```

## Endpoints Disponibles

### Autenticación (`/api/auth`)

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/verify-email` - Verificar email con código
- `POST /api/auth/resend-code` - Reenviar código de verificación

### Reservas (`/api/reservas`)

- `POST /api/reservas` - Crear nueva reserva
- `GET /api/reservas` - Obtener reservas (con filtros)
- `GET /api/reservas/horarios-disponibles` - Obtener horarios disponibles

### Establecimientos (`/api/establecimientos`)

- `GET /api/establecimientos` - Listar todos los establecimientos activos
- `GET /api/establecimientos/{codigo}` - Obtener establecimiento por código
- `POST /api/establecimientos` - Crear nuevo establecimiento

## Inicializar Establecimientos

Para crear el establecimiento "barberia" por defecto, puedes usar MongoDB directamente o crear un script de inicialización.

Ejemplo de documento para MongoDB:

```json
{
  "codigo": "barberia",
  "nombre": "Barbería Clásica",
  "horarios": {
    "inicio": "09:00",
    "fin": "20:00",
    "intervalo": 30
  },
  "diasDisponibles": [2, 3, 4, 5, 6],
  "activo": true
}
```

## Características

- ✅ Spring Boot 3.2.0
- ✅ Spring Data MongoDB
- ✅ Validación con Jakarta Validation
- ✅ CORS configurado
- ✅ Seguridad básica (Spring Security)
- ✅ Encriptación de contraseñas (BCrypt)
- ✅ Envío de emails (Spring Mail)
- ✅ Manejo de errores
- ✅ Sistema genérico multi-establecimiento

## Desarrollo

El servidor se ejecuta en `http://localhost:5000` por defecto.

Para desarrollo con recarga automática, usa Spring Boot DevTools (incluido en las dependencias).

