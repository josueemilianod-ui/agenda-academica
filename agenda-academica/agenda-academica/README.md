# Agenda académica

Aplicación web para organizar tareas, exámenes, proyectos y exposiciones por materia. Funciona completamente en el navegador (sin servidor) y conserva la información entre sesiones con `localStorage`.

Actividad 3 · Laboratorio de Programación Web · Unidad temática 3: JavaScript

**Autor:** Josue Emiliano Diaz Garcia · Matrícula 2226766 · UANL FIME

## Objetivo

Desarrollar una aplicación web del lado del cliente con JavaScript ES6+, manipulación del DOM, eventos, validación de datos y persistencia local.

## Funcionalidades

- **Inicio:** saludo, barra de progreso, contadores (total, pendientes, vencidas, completadas) y próximas entregas.
- **Actividades:** agregar, editar y eliminar desde un formulario emergente, con prioridad (alta, media, baja), tipo y notas.
- **Materias:** tarjetas de color por materia con avance y siguiente entrega.
- **Validación** antes de guardar, con mensajes claros junto a cada campo.
- **Persistencia** con `localStorage` (actividades y tema).
- **Funciones adicionales:** búsqueda en tiempo real, filtros por estado, tipo y materia, ordenamiento, contador automático y modo oscuro.
- **PWA:** se puede instalar en celular o PC y funciona sin conexión (`manifest.json` y `sw.js`).

## Tecnologías

HTML5, CSS3, JavaScript ES6+, DevTools y Git/GitHub. Se usan `let`/`const`, template literals, arrow functions, desestructuración, spread, métodos de arreglos, delegación de eventos y `try/catch`.

## Estructura

```
agenda-academica/
├── index.html · styles.css · app.js
├── manifest.json · sw.js · icon.svg   (PWA)
└── README.md
```

## Cómo ejecutarla

1. Clona el repositorio: `git clone https://github.com/TU_USUARIO/agenda-academica.git`
2. Ábrela con Live Server (VS Code) o publícala en GitHub Pages. La instalación como app requiere `http://localhost` o `https://`, no funciona con doble clic al archivo.
3. En Chrome o Edge usa "Instalar app"; en Android, "Agregar a pantalla de inicio".

## Modelo de datos

Cada actividad es un objeto guardado en un arreglo:

```js
{
  id: "1731200000000",
  titulo: "Entregar PIA",
  materia: "Programación Web",
  tipo: "Proyecto",
  prioridad: 1,
  fecha: "2026-11-20",
  notas: "Incluir README",
  hecha: false
}
```

El arreglo completo se guarda como JSON bajo la clave `agendaAcademica.actividades`. Para borrar todo desde DevTools: `localStorage.removeItem('agendaAcademica.actividades')`.

## Demostración

Guion sugerido de 3 minutos: mostrar el inicio, agregar dos o tres actividades, mostrar un error de validación, editar una, marcarla como completada, buscar por materia, eliminar una y recargar la página para comprobar que los datos se conservan.
