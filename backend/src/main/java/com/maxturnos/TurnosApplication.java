package com.maxturnos;

import com.maxturnos.util.FechaUtil;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class TurnosApplication {
    public static void main(String[] args) {
        // Zona fija Argentina: en Render el default es UTC y corría el día de las reservas
        TimeZone.setDefault(FechaUtil.ZONA_NEGOCIO);

        // Cargar .env si existe (para mvn spring-boot:run y ejecución local)
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(e -> System.setProperty(e.getKey(), e.getValue()));
        SpringApplication.run(TurnosApplication.class, args);
    }
}
