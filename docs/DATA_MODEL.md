# Modelo de datos (borrador)

## Entidades
- User
  - username (único)
  - usernameLower (único, normalizado para case-insensitive)
  - passwordHash
  - name
  - role (ADMIN/USER)
  - plan (FREE/PRO)
  - commentLimit (máximo permitido)
  - commentsUsed (contador)

- Project (agrupador lógico)
  - name
  - nameLower (normalizado)
  - userId (owner)

- GenerationOrder
  - projectId
  - userId
  - link
  - socialNetwork (INSTAGRAM/TIKTOK/FACEBOOK/YOUTUBE)
  - postType (VIDEO/IMAGE/TEXT)
  - intent (texto libre)
  - quantity (int)
  - status (DRAFT/SENT/GENERATED/DELETED)
  - sentAt, generatedAt
  - deletedAt (soft delete)

- BotComment (comentarios_bots)
  - orderId
  - projectId
  - userId
  - text
  - externalId (opcional, id de n8n)
  - deletedAt

- IntegrationLog
  - source (N8N)
  - eventType (WEBHOOK_RECEIVED/WEBHOOK_REJECTED/COMMENTS_PERSISTED)
  - userId/projectId/orderId (opcionales)
  - payload (JSON)
  - error (string)

- LegacyBotComment (tabla existente: comentarios_bot)
  - Nota: se mantiene por compatibilidad con el esquema anterior.
  - Campos principales: url, comentario, target, red_social, is_published, created_at, published_at
  - En Prisma:
    - commentText -> columna comentario
    - projectKey -> columna target (NO se usa la palabra "target" en el código). Es dinámico/creable en la app.
    - socialNetworkRaw -> columna red_social (set fijo)
  - Índice/constraint: comentario unique

## Relaciones
- User 1..n Project
- Project 1..n GenerationOrder
- GenerationOrder 1..n BotComment

## Índices (propuesta)
- User.username unique
- User.usernameLower unique
- Project(userId, nameLower) unique
- GenerationOrder(projectId, createdAt)
- GenerationOrder(userId, createdAt)
- GenerationOrder(status, createdAt)
- BotComment(orderId, createdAt)
- BotComment(projectId, createdAt)
- BotComment(userId, createdAt)
- IntegrationLog(source, createdAt)
- IntegrationLog(eventType, createdAt)
- IntegrationLog(orderId, createdAt)

## Límites por usuario
- Regla: bloquear creación de órdenes si commentsUsed >= commentLimit
- commentsUsed se incrementa al recibir comentarios de n8n
