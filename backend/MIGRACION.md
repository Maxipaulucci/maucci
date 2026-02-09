# Guía de Migración: Node.js/Express → Spring Boot

## Cambios Principales

### Estructura de Proyecto

**Antes (Node.js):**
```
backend/
├── models/
├── routes/
├── services/
└── server.js
```

**Ahora (Spring Boot):**
```
backend-springboot/
├── src/main/java/com/maxturnos/
│   ├── config/
│   ├── controller/
│   ├── dto/
│   ├── model/
│   ├── repository/
│   └── service/
└── pom.xml
```

#### Endpoints (Mismos, Compatibles)

Todos los endpoints mantienen la misma estructura y respuestas para compatibilidad con el frontend:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-code`
- `POST /api/reservas`
- `GET /api/reservas`
- `GET /api/reservas/horarios-disponibles`
- `GET /api/establecimientos`
- `GET /api/establecimientos/{codigo}`
- `POST /api/establecimientos`

##### Configuración

**Variables de entorno:**
- `MONGODB_URI` - URI de conexión a MongoDB
- `EMAIL_USERNAME` - Email para envío de códigos
- `EMAIL_PASSWORD` - Contraseña de aplicación de Gmail

O editar `src/main/resources/application.properties`

###### Ejecución

**Antes:**
```bash
cd backend
npm install
npm start
```

**Ahora:**
```bash
cd backend-springboot
./mvnw spring-boot:run
# o
mvn spring-boot:run
```

### Ventajas de Spring Boot

1. **Type Safety**: Java con tipado fuerte
2. **Spring Data MongoDB**: Repositorios automáticos
3. **Validación Integrada**: Jakarta Validation
4. **Manejo de Errores**: GlobalExceptionHandler
5. **Seguridad**: Spring Security integrado
6. **Testing**: Framework de testing robusto
7. **Performance**: JVM optimizada
8. **Ecosistema**: Amplio ecosistema empresarial

### Notas de Migración

- El puerto sigue siendo 5000
- Las respuestas JSON mantienen el mismo formato
- La base de datos MongoDB es la misma
- No se requieren cambios en el frontend

