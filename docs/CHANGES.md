# Cambios relevantes

## 2026-01-08
- Se crea /docs con documentación inicial (roadmap, decisiones, modelo, estructura, flujos).
- Se aceptan decisiones: auth con JWT en cookie httpOnly, agrupador "Project", conteo "commentsUsed" y planes (FREE/PRO).
- Se marca como completada la tarea de decisiones en docs/ROADMAP.md.
- Se implementa prisma/schema.prisma con modelos, enums e índices (User/Project/GenerationOrder/BotComment/IntegrationLog) y se actualiza docs/DATA_MODEL.md.
- Se ajusta schema para Prisma 7 (sin datasource url en schema.prisma) y se agrega LegacyBotComment mapeado a la tabla existente comentarios_bot.
- Se corrige el modelo legacy: "target" es dinámico (projectKey String), no enum fijo.
- Se actualizan estados: GenerationOrder.status (DRAFT/READY/GENERATED/RETRY) y BotComment/LegacyBotComment.status (PENDING/PUBLISHED/CANCELED), eliminando booleanos para estados.
- Se unifica el almacenamiento de comentarios en una sola tabla (comentarios_bot) usando el modelo BotComment y se elimina el modelo LegacyBotComment.
- Se elimina BotComment.url para evitar duplicidad; la URL queda únicamente en GenerationOrder.link.
- Se renombran enums a español (Role/Plan/OrderStatus/CommentStatus/PostType).
- Se elimina el uso de @map en enums para evitar inconsistencias al insertar (valores en DB ahora también quedan en español).
- Se agrega prisma/seed.ts y configuración en package.json para poblar datos ficticios con Prisma.
