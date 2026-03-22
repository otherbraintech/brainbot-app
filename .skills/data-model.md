---
description: Entidades fundamentales, esquema de la base de datos y modelo de dominio de la aplicación.
---

# 🗄️ Modelo de Datos

La aplicación funciona en torno a un modelo de Base de Datos relacional manejado por Prisma y PostgreSQL. Los usuarios gestionan "Proyectos" (Projects) que actúan como contenedores organizativos de "Órdenes de Generación" (Generation Orders), enfocadas al control de interacciones gestionadas de redes sociales. 

Estas son las piezas estructurales clave y su arquitectura a consultar.

## 1. Reglas Globales (Auditoría y Soft-Delete)

Impulsado por ADR-003 y ADR-004:
- **Soft Delete**: Entidades clave (como Órdenes y Comentarios) nunca se eliminan físicamente. Deben apoyarse obligatoriamente de la columna anulable `deletedAt`. Filtrar siempre las queries con `{ deletedAt: null }`. 
- **Auditoría**: Componentes portan marcas de tiempo de `createdAt` y `updatedAt`. Atribución al creador mediante campos como referenciadores al id del Owner/Usuario.

## 2. Entidades Principales

### `User`
Representa al usuario registrado o administrador. Controla autenticación y capacidades asociadas a cuota y subscripción.
- `id` (PK)
- `username` (Único)
- `usernameLower` (Único, normalizado a minúsculas para comparaciones case-insensitive)
- `passwordHash`
- `name`
- `role` (ADMIN, USUARIO)
- `plan` (GRATIS, PRO)
- `commentLimit` (Tope máximo de consumos permisibles por el User)
- `commentsUsed` (Contador actual de consumos devengados). Regla: *Impedir nueva orden si commentsUsed >= commentLimit*.
- *Relación*: 1..N con `Project`.

### `Project`
Contenedor lógico superior asignado a un Usuario. Agrupa la gestión funcional en representación de una campaña, empresa o figura de identidad. (Ver ADR-002: no llamar a esta entidad primaria "Target").
- `id` (PK)
- `name`
- `nameLower`
- `userId` (Propietario).
- *Índice Compuesto Único*: `(userId, nameLower)`
- *Relaciones*: 1:1 estricto con `Target`, 1..N con `BotOrder` (Órdenes asignadas).

### `Target`
La definición íntima y compleja del arquetipo de la figura, audiencia, contexto y discursos de una campaña asociada a un `Project`. Aquí se concentra la metainformación pesada y el modelo mental usado por el backoffice y los webhooks.
- `id` (PK)
- `projectId` (FK del modelo lógico Project)
- `name`
- `content` (JSON con la definición extensa multi-paso de su fase, competencias, pistas y conducta).
- `imageBase64` (Apariencia).

### `GenerationOrder` (En Prisma: `BotOrder`)
Representación atómica de una intención de interacción masiva despachada a las redes.
- `id` (PK)
- `projectId`, `userId`
- `link` (URL donde actuar)
- `socialNetwork` (INSTAGRAM, TIKTOK, FACEBOOK, YOUTUBE)
- `postType` (VIDEO, IMAGE, TEXT, LIVE, PUBLICACION, PAGINA, OTRO)
- `type` (Enum indicando acción requerida. Ej. COMENTARIO, MEGUSTA)
- `intent` (Texto libre con lineamiento de la instrucción)
- `quantity` (Int)
- `status` (BORRADOR, LISTA, GENERANDO, GENERADA, REINTENTAR, COMPLETADA, CANCELADA, PAUSADA)
- `sentAt`, `generatedAt`, `deletedAt`
- *Relaciones*: 1..N dependiendo de su tipo con las microentidades de resultados: `BotComment`, `GenLike`, `GenShare`, `GenFollow`, `GenLive`, `GenReport`, `GenMarketplace`.

### `BotComment` (Tabla: `comentarios_bot`)
Un item transaccional particular devuelto a la plataforma producto de la ejecución de una `GenerationOrder`.
- `id` (PK)
- `orderId`, `projectId`, `userId`
- `text`
- `deviceId` (Opcional, qué dispositivo físico se le imputa para la entrega de cara a una granja)
- `publishAt` (Opcional, timestamp de publicación de cola)
- `status` (PENDIENTE, PUBLICADO, CANCELADO, BORRADOR)
- `deletedAt`

### `IntegrationLog`
Almacena transacciones del sistema con respecto a agentes externos, webhooks y fallos de servicio.
- `id` (PK)
- `source` (N8N)
- `eventType` (WEBHOOK_RECEIVED, WEBHOOK_REJECTED, COMMENTS_PERSISTED)
- `userId`, `projectId`, `orderId` (Opcionales para enlace contextual).
- `payload` (JSON transaccional de entrada)
- `error` (String traza del fallo si lo hubiera).
