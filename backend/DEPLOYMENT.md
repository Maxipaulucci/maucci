# Cómo mantener el backend en ejecución en producción

El backend es una aplicación **Spring Boot 3.2** (Java 17) que corre en el puerto **5000** y usa **MongoDB**. Para que esté siempre en ejecución en producción puedes usar cualquiera de estas opciones.

---

## 1. **systemd (Linux VPS o servidor propio)** — Recomendado para “siempre encendido”

En un servidor Linux (Ubuntu, Debian, etc.) puedes registrar la app como servicio para que:

- Se inicie al arrancar el servidor
- Se reinicie si se cae
- Se pueda gestionar con `systemctl start/stop/restart turnos-backend`

### Pasos

**1. Compilar el JAR**

```bash
cd backend
./mvnw clean package -DskipTests
```

El JAR quedará en `target/turnos-backend-1.0.0.jar`.

**2. Crear usuario y directorio (opcional pero recomendado)**

```bash
sudo useradd -r -s /bin/false turnos
sudo mkdir -p /opt/turnos
sudo cp target/turnos-backend-1.0.0.jar /opt/turnos/
sudo chown -R turnos:turnos /opt/turnos
```

**3. Archivo de variables de entorno**

```bash
sudo nano /opt/turnos/env
```

Contenido (ajusta valores):

```properties
MONGODB_URI=mongodb://tu-servidor:27017/macci
SPRING_MAIL_USERNAME=tu-email@gmail.com
SPRING_MAIL_PASSWORD=tu-app-password
CORS_ALLOWED_ORIGINS=https://tu-frontend.netlify.app
```

**4. Unidad de systemd**

```bash
sudo nano /etc/systemd/system/turnos-backend.service
```

Contenido:

```ini
[Unit]
Description=Turnos Backend API
After=network.target

[Service]
Type=simple
User=turnos
WorkingDirectory=/opt/turnos
EnvironmentFile=/opt/turnos/env
ExecStart=/usr/bin/java -jar -Xms256m -Xmx512m /opt/turnos/turnos-backend-1.0.0.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**5. Activar y arrancar**

```bash
sudo systemctl daemon-reload
sudo systemctl enable turnos-backend
sudo systemctl start turnos-backend
sudo systemctl status turnos-backend
```

A partir de ahí el backend quedará **siempre en ejecución**: se inicia con el servidor y se reinicia si falla.

---

## 2. **Docker** — Para desplegar en cualquier sitio que soporte contenedores

Puedes usar el `Dockerfile` incluido en este proyecto (si lo creas) o el siguiente.

**Ejemplo de Dockerfile** (crear en la raíz de `backend/`):

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/turnos-backend-1.0.0.jar app.jar
EXPOSE 5000
ENTRYPOINT ["java", "-jar", "-Xms256m", "-Xmx512m", "app.jar"]
```

Construir y ejecutar:

```bash
cd backend
./mvnw clean package -DskipTests
docker build -t turnos-backend .
docker run -d --name turnos-api -p 5000:5000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/macci \
  -e SPRING_MAIL_USERNAME=... \
  -e SPRING_MAIL_PASSWORD=... \
  --restart unless-stopped \
  turnos-backend
```

`--restart unless-stopped` hace que el contenedor se reinicie siempre que se caiga o reinicie la máquina (equivalente a “siempre en ejecución”).

---

## 3. **PaaS (Railway, Render, Fly.io, etc.)**

En estas plataformas el proceso se mantiene en ejecución por ellas: solo subes el código (o el JAR) y configuras variables de entorno.

- **Railway**: conectar repo, indicar que es un proyecto Maven/Java, build con `mvn clean package` y comando `java -jar target/turnos-backend-1.0.0.jar`. Definir `MONGODB_URI`, `SPRING_MAIL_*`, `CORS_ALLOWED_ORIGINS`, etc.
- **Render**: “Web Service”, build command Maven y start command con `java -jar target/...`. Mismo criterio de variables de entorno.
- **Fly.io**: desplegar con Docker o con `fly launch` y un Dockerfile; configurar env vars en el dashboard.

En todos los casos, **no guardes contraseñas en el código**: solo en variables de entorno del servicio.

---

## Resumen: qué hace que “esté siempre en ejecución”

| Opción    | Cómo se mantiene en ejecución                          |
|----------|--------------------------------------------------------|
| **systemd** | Servicio del sistema: reinicio automático y arranque con el servidor |
| **Docker**  | `--restart unless-stopped` (o política similar en Kubernetes/cloud) |
| **PaaS**    | La plataforma reinicia tu proceso si se cae            |

---

## Variables de entorno recomendadas en producción

- `MONGODB_URI` — URI de MongoDB (ej. Atlas o servidor propio)
- `SPRING_MAIL_USERNAME` — Email para envío
- `SPRING_MAIL_PASSWORD` — Contraseña de aplicación del email
- `CORS_ALLOWED_ORIGINS` — Orígenes permitidos (ej. `https://tu-app.netlify.app`)

En `application.properties` ya se usan por defecto; en producción **no pongas contraseñas**: solo variables de entorno.
