# Etapa 1: compilar el JAR con Maven
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copiar solo el POM para aprovechar caché de dependencias
COPY pom.xml .
# Descargar dependencias (se reutiliza si pom.xml no cambia)
RUN apk add --no-cache maven && mvn dependency:go-offline -B

# Copiar código y compilar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Etapa 2: imagen final solo con el JAR
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/turnos-backend-1.0.0.jar app.jar

# Render inyecta PORT; Spring Boot lo lee con server.port=${PORT:5000}
EXPOSE 5000

ENTRYPOINT ["java", "-jar", "-Xms256m", "-Xmx512m", "app.jar"]
