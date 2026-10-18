# ADR-003 · Fijar TypeScript 6.0 mientras typescript-eslint no soporte la 7

- **Estado:** aceptada
- **Fecha:** 18 de octubre de 2026

## Contexto

Al instalar dependencias, npm resolvió TypeScript 7.0. `typescript-eslint` 8.71 declara compatibilidad con TypeScript `>=4.8.4 <6.1.0`, por lo que la instalación falló con un conflicto de dependencias (DEF-001 en el registro de defectos).

## Decisión

Fijar `typescript@~6.0.3` en la raíz y en ambos workspaces. No usar `--force` ni `--legacy-peer-deps`, porque ocultarían la incompatibilidad y el análisis estático podría fallar en silencio.

## Consecuencias

- El análisis estático (ESLint con reglas de TypeScript y de complejidad) funciona en todos los entornos.
- Revisar en cada check-in si `typescript-eslint` ya soporta TypeScript 7 y, en ese caso, actualizar con un PR propio.
