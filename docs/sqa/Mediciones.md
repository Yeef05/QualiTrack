# Mediciones de calidad

Valores medidos con las herramientas del proyecto. También se capturan en QualiTrack, en el proyecto "QualiTrack".

## Check-in 2 · 18/10/2026

| Métrica | Meta | Valor | Estado | Fuente |
| --- | --- | --- | --- | --- |
| Cobertura de líneas · API | ≥ 70 % | 97.4 % (377/387) | En meta | `npm run test:coverage -w apps/api` |
| Cobertura de líneas · Web (lógica, cliente y componentes) | ≥ 70 % | 99.1 % (116/117) | En meta | `npm run test:coverage -w apps/web` |
| Pruebas automáticas | — | 78 (46 API + 32 web), 0 fallas | — | Vitest |
| Complejidad ciclomática máxima | ≤ 10 | ≤ 10 en todas las funciones | En meta | ESLint `complexity` sin errores |
| Defectos críticos abiertos | 0 | 0 | En meta | [Registro de defectos](RegistroDefectos.md) |
| Defectos abiertos (todas las gravedades) | ≤ 5 | 0 | En meta | Registro de defectos |
| Módulos con prototipo funcional | 100 % al final | 5 de 5 (M5 sin pantalla de usuarios) | En progreso | README |
| Historias terminadas (definición completa, con PR aprobado) | 100 % al final | 0 de 10: falta la revisión cruzada | Fuera de meta | Tablero |

**Nota sobre la cobertura web:** el umbral se aplica a `src/lib`, `src/api` y `src/components`. Las páginas completas se cubrirán con pruebas E2E (Playwright) en la versión Beta; hoy solo la página de inicio de sesión tiene prueba de componente.
