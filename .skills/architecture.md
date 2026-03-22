---
description: Arquitectura de frontend y decisiones arquitectónicas (ADRs).
---

# 🏛️ Arquitectura y ADRs

La arquitectura estructural y organizativa del proyecto se describe a continuación, complementada con el histórico de decisiones arquitectónicas fundamentales (ADRs).

## Estructura de Rutas de App Router (Next.js)

La carpeta `/app` se organiza haciendo un uso intensivo de **Route Groups** (`(nombreGrupo)`) para optimizar el enrutamiento sin afectar la URL y para compartir layouts:

- **`(auth)` Route Group**:
  - Contiene las rutas públicas relacionadas a inicio y fin de sesión (como `/login` y `/register`).
  - Implementa los bloques arquitectónicos `login-01` y `signup-01`.
  - Dispone de su propio Layout específico minimalista.

- **`(dashboard)` Route Group**:
  - Agrupa todas las rutas privadas de la aplicación web una vez logueado.
  - Implementa el componente `sidebar-07` que inyecta la barra de navegación lateral y el header superior en el Layout (`layout.tsx`).
  - Todas las rutas anidadas requieren que el usuario esté autenticado.

---

## Decisiones Arquitectónicas Históricas (ADRs)

Deben ser respetadas durante todas las fases de desarrollo.

### ADR-001: Autenticación
- **Decisión**: Autenticación stateless custom implementada mediante un JWT firmado alojado en una cookie `httpOnly`, operando como un proxy para proteger de forma segura las rutas privadas (ej. `/dashboard`). Hash de password manejado con `bcryptjs`. Roles almacenados en DB.

### ADR-002: Nombre del “agrupador lógico”
- **Decisión**: Para el agrupador primario de campañas, evitar rotundamente el término "target". Se debe nombrar como entidad `Project` en el código, visible al usuario como "Proyecto" o "Agrupador".

### ADR-003: Soft delete
- **Decisión**: Las órdenes y los comentarios implementan *soft delete* en la base de datos. Ninguno de estos registros se borra físicamente. Se apoyan en el campo `deletedAt` y opcionalmente en `deletedById`.

### ADR-004: Auditoría mínima
- **Decisión**: Cada entidad fundamental expone obligatoriamente campos `createdAt` y `updatedAt`. Adicionalmente se utilizará `createdById` para referenciar la traza del autor en las entidades generadas por un usuario determinado.

### ADR-005: Seguridad integración n8n
- **Decisión**: Intercomunicación de webhook rigurosamente validada a través de comprobación de payload con `zod`, respaldada con la capa de seguridad de un secreto compartido interceptado mediante el header customizado `X-N8N-SECRET`. Todos los fallos transaccionales originan un `IntegrationLog`.

### ADR-006: Conteo de comentarios usados por usuario
- **Decisión**: Monitoreo directo en forma de un contador interno llamado `commentsUsed` embebido dentro de la entidad `User`. Se incrementa transaccionalmente cada vez que un comentario entrante de N8N se persiste en la base de datos local.

### ADR-007: Planes y monetización (base)
- **Decisión**: El modelo `User` registra el `plan` (GRATIS/PRO) actual de la cuenta, operando directamente con en el limitador primario `commentLimit`.

### ADR-008: Idioma
- **Decisión**: Toda la presentación orientada a UI debe ser siempre expresada en español explícitamente, reteniendo sin embargo convenciones y programaciones abstractas subyacentes en inglés.
