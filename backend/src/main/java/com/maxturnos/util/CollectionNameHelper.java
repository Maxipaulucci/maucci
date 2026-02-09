package com.maxturnos.util;

/**
 * Helper class para generar nombres de colecciones dinámicas por negocio.
 * Cada negocio tiene UNA SOLA colección que contiene todos sus datos:
 * - negocio_{codigo} - contiene reservas, reseñas, días cancelados,
 * horarios bloqueados, personal y servicios
 */
public class CollectionNameHelper {

    private static final String PREFIX = "negocio_";

    /**
     * Obtiene el nombre de la colección para un negocio específico.
     * Esta colección contiene todos los datos del negocio.
     * Si el código del negocio ya contiene el formato completo (ej:
     * "barberia_clasica"),
     * se usa directamente sin agregar el prefijo "negocio_".
     */
    public static String getNegocioCollection(String negocioCodigo) {
        // Si el código ya contiene el formato completo de la colección, usarlo
        // directamente
        // Por ejemplo, si es "barberia_clasica", la colección será "barberia_clasica"
        if (negocioCodigo != null && negocioCodigo.contains("_")) {
            return negocioCodigo;
        }
        // Si no, agregar el prefijo estándar
        return PREFIX + negocioCodigo;
    }

    // Métodos legacy mantenidos para compatibilidad durante la migración
    @Deprecated
    public static String getReservasCollection(String negocioCodigo) {
        return getNegocioCollection(negocioCodigo);
    }

    @Deprecated
    public static String getReservasHistoricasCollection(String negocioCodigo) {
        return getNegocioCollection(negocioCodigo);
    }

    @Deprecated
    public static String getResenasCollection(String negocioCodigo) {
        return getNegocioCollection(negocioCodigo);
    }

    @Deprecated
    public static String getDiasCanceladosCollection(String negocioCodigo) {
        return getNegocioCollection(negocioCodigo);
    }

    @Deprecated
    public static String getHorariosBloqueadosCollection(String negocioCodigo) {
        return getNegocioCollection(negocioCodigo);
    }

    @Deprecated
    public static String getPersonalCollection(String negocioCodigo) {
        return getNegocioCollection(negocioCodigo);
    }

    @Deprecated
    public static String getServiciosCollection(String negocioCodigo) {
        return getNegocioCollection(negocioCodigo);
    }
}
