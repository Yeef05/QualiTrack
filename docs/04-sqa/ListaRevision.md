# Lista de revisión de código

La usa quien revisa un pull request antes de aprobarlo. Si un punto no se cumple, se deja comentario en el PR; si es un error, se registra como defecto.

## Funcionalidad
- [ ] El cambio cumple los criterios de aceptación de la historia (HU-xx)
- [ ] Los casos de error devuelven el código HTTP correcto (400 validación, 401 sin sesión, 403 sin permiso, 404 no existe, 409 duplicado)
- [ ] Los mensajes al usuario están en español y dicen cómo corregir el error

## Pruebas
- [ ] Hay pruebas para el caso normal y al menos un caso de error
- [ ] Si corrige un defecto, incluye prueba de regresión con el ID del defecto
- [ ] CI en verde y la cobertura no baja de 70 %

## Seguridad y datos
- [ ] Las consultas SQL usan parámetros (`$1`), nunca concatenan datos del usuario
- [ ] Las rutas nuevas exigen sesión y el rol adecuado
- [ ] No hay contraseñas, tokens ni datos personales reales en el código o en los commits

## Mantenibilidad
- [ ] ESLint sin errores (complejidad ≤ 10 por función)
- [ ] Nombres claros; la lógica de negocio está en funciones puras o repositorios, no en la interfaz
- [ ] Si cambia la arquitectura o una herramienta, hay ADR

## Interfaz y datos (desde el ciclo 4)

Son los tipos de defecto más frecuentes al corte de la Beta: 50 Interfaz y 70 Datos suman el 62.5 % ([Pareto del ciclo 3](../03-planeacion-tsp/PostmortemCiclo3.md)).

- [ ] Revisé la pantalla en modo claro y en oscuro, y en ancho de celular: nada se corta ni se encima
- [ ] Textos, títulos y espacios se leen igual que en las demás pantallas
- [ ] Los datos de ejemplo y los nombres que se muestran son coherentes (sin textos repetidos ni campos libres para algo que debería elegirse de una lista)
