package com.maxturnos.util;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Utilidades para normalizar texto (ej. primera letra en mayúscula en personal).
 */
public final class TextUtils {

    private TextUtils() {}

    /**
     * Primera letra en mayúscula, resto en minúscula (ej: "coloracion" -> "Coloracion").
     */
    public static String capitalizeFirst(String str) {
        if (str == null || str.isEmpty()) return str;
        String s = str.trim();
        if (s.isEmpty()) return str;
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }

    /**
     * Primera letra de cada palabra en mayúscula (ej: "rogrigo gonzales" -> "Rogrigo Gonzales").
     */
    public static String capitalizeWords(String str) {
        if (str == null || str.isEmpty()) return str;
        String trimmed = str.trim();
        if (trimmed.isEmpty()) return str;
        String[] words = trimmed.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            if (i > 0) sb.append(' ');
            sb.append(capitalizeFirst(words[i]));
        }
        return sb.toString();
    }

    /**
     * Aplica capitalizeFirst a cada elemento de la lista (ej. atributos/cualidades).
     */
    public static List<String> capitalizeEach(List<String> list) {
        if (list == null) return null;
        return list.stream()
                .map(TextUtils::capitalizeFirst)
                .collect(Collectors.toList());
    }
}
