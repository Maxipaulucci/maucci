# Crear Negocio "Barbería Clásica" en la Base de Datos

## Opción 1: Usar el endpoint del backend (Recomendado)

Puedes crear el negocio usando el endpoint POST `/api/negocios`. Aquí tienes el JSON que debes enviar:

```json
{
  "codigo": "barberia",
  "nombre": "Barbería Clásica",
  "horarios": {
    "inicio": "09:00",
    "fin": "20:00",
    "intervalo": 30
  },
  "diasDisponibles": [1, 2, 3, 4, 5, 6],
  "activo": true
}
```

**Usando curl:**
```bash
curl -X POST http://localhost:5000/api/negocios \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "barberia",
    "nombre": "Barbería Clásica",
    "horarios": {
      "inicio": "09:00",
      "fin": "20:00",
      "intervalo": 30
    },
    "diasDisponibles": [1, 2, 3, 4, 5, 6],
    "activo": true
  }'
```

**O usando Postman/Thunder Client:**
- URL: `POST http://localhost:5000/api/negocios`
- Headers: `Content-Type: application/json`
- Body: El JSON de arriba

## Opción 2: Crear directamente en MongoDB

Si prefieres crear el negocio directamente en MongoDB Compass o usando mongosh:

```javascript
db.negocios.insertOne({
  "codigo": "barberia",
  "nombre": "Barbería Clásica",
  "horarios": {
    "inicio": "09:00",
    "fin": "20:00",
    "intervalo": 30
  },
  "diasDisponibles": [1, 2, 3, 4, 5, 6],
  "activo": true,
  "fechaCreacion": new Date()
})
```

**Nota importante:**
- El `codigo` debe ser exactamente `"barberia"` (en minúsculas) porque el código en `Reviews.js` usa `'barberia'`
- El `nombre` puede ser cualquier cosa, como "Barbería Clásica"
- Los `diasDisponibles` son: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado








