# Modelo de datos (borrador)

## Entidades
- User
  - username (único)
  - usernameLower (único, normalizado para case-insensitive)
  - passwordHash
  - name
  - role (ADMIN/USUARIO)
  - plan (GRATIS/PRO)
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
  - status (BORRADOR/LISTA/GENERADA/REINTENTAR)
  - sentAt, generatedAt
  - deletedAt (soft delete)

- BotComment (tabla: comentarios_bot)
  - orderId
  - projectId
  - userId
  - text
  - dispositivo (opcional, a qué dispositivo va a ir el comentario)
  - publishAt (opcional, hora y minuto a publicar)
  - status (PENDIENTE/PUBLICADO/CANCELADO)
  - deletedAt

- IntegrationLog
  - source (N8N)
  - eventType (WEBHOOK_RECEIVED/WEBHOOK_REJECTED/COMMENTS_PERSISTED)
  - userId/projectId/orderId (opcionales)
  - payload (JSON)
  - error (string)

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
