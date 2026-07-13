# Etapa 1: compilar el JAR con Maven (imagen Debian: mejor compatibilidad SMTP/TLS que Alpine)
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

COPY pom.xml .
RUN apt-get update \
    && apt-get install -y --no-install-recommends maven \
    && rm -rf /var/lib/apt/lists/* \
    && mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# Etapa 2: imagen final solo con el JAR
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/turnos-backend-1.0.0.jar app.jar

EXPOSE 5000

ENTRYPOINT ["java", "-jar", "-Xms256m", "-Xmx512m", "app.jar"]
