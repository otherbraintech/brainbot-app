# Cambios relevantes

## 2026-01-08
- Se crea /docs con documentación inicial (roadmap, decisiones, modelo, estructura, flujos).
- Se aceptan decisiones: auth con JWT en cookie httpOnly, agrupador "Project", conteo "commentsUsed" y planes (FREE/PRO).
- Se marca como completada la tarea de decisiones en docs/ROADMAP.md.
- Se implementa prisma/schema.prisma con modelos, enums e índices (User/Project/GenerationOrder/BotComment/IntegrationLog) y se actualiza docs/DATA_MODEL.md.
- Se ajusta schema para Prisma 7 (sin datasource url en schema.prisma) y se agrega LegacyBotComment mapeado a la tabla existente comentarios_bot.
- Se corrige el modelo legacy: "target" es dinámico (projectKey String), no enum fijo.
