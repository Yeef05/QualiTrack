# ADR-001 · Arquitectura web de tres capas en un monorepo

- **Estado:** aceptada
- **Fecha:** 6 de octubre de 2026 (Entregable 1)

## Contexto

El enunciado pide un centro de control de SQA (registro de proyectos, métricas, técnicas y reportes) y evidencia de prácticas de calidad durante su construcción.

## Decisión

- Aplicación web de tres capas: SPA en React + TypeScript, API REST en Node.js + Express + TypeScript y base de datos PostgreSQL.
- Un solo repositorio (monorepo con workspaces de npm: `apps/api` y `apps/web`) para que un pull request incluya API, interfaz y pruebas del mismo cambio.
- La rama `main` se protege: solo entra código con CI en verde y revisión aprobada.

## Consecuencias

- Separar interfaz, lógica y datos facilita probar cada capa por separado (la lógica de semáforo, índice de salud y cumplimiento son funciones puras con pruebas unitarias).
- En producción la API sirve también el frontend compilado: un solo servicio que desplegar.
