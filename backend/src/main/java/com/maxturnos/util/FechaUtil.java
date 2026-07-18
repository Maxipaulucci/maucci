package com.maxturnos.util;

import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

/**
 * Fechas de turnos como día de calendario en Argentina (sin depender del UTC del servidor).
 */
public final class FechaUtil {

    public static final TimeZone ZONA_NEGOCIO = TimeZone.getTimeZone("America/Argentina/Buenos_Aires");

    private FechaUtil() {}

    /**
     * Parsea "YYYY-MM-DD" a medianoche en zona Argentina.
     */
    public static Date parseFechaDia(String fechaStr) {
        if (fechaStr == null || fechaStr.trim().isEmpty()) {
            throw new IllegalArgumentException("La fecha es requerida");
        }
        String[] partes = fechaStr.trim().split("-");
        if (partes.length != 3) {
            throw new IllegalArgumentException("Formato de fecha inválido. Se espera YYYY-MM-DD");
        }
        try {
            int año = Integer.parseInt(partes[0]);
            int mes = Integer.parseInt(partes[1]) - 1;
            int dia = Integer.parseInt(partes[2]);
            Calendar cal = Calendar.getInstance(ZONA_NEGOCIO);
            cal.clear();
            cal.set(año, mes, dia, 0, 0, 0);
            cal.set(Calendar.MILLISECOND, 0);
            return cal.getTime();
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Formato de fecha inválido. Se espera YYYY-MM-DD");
        }
    }

    public static Calendar calendarEnZonaNegocio() {
        return Calendar.getInstance(ZONA_NEGOCIO);
    }

    public static Calendar calendarEnZonaNegocio(Date date) {
        Calendar cal = Calendar.getInstance(ZONA_NEGOCIO);
        cal.setTime(date);
        return cal;
    }
}
