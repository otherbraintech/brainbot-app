# Decisiones arquitectónicas (ADR-lite)

## ADR-001: Autenticación
Estado: Aceptada

Opciones:
- JWT en cookie httpOnly (stateless)
- Sesión en base de datos (stateful)

Criterios:
- Next.js App Router
- Simplicidad inicial
- Escalabilidad y control de invalidación

Propuesta inicial:
- JWT firmado + cookie httpOnly + proxy para proteger /dashboard
- Hash de password con bcrypt
- Roles en DB

Decisión:
- Se usará JWT firmado en cookie httpOnly.

## ADR-002: Nombre del “agrupador lógico”
Estado: Aceptada

Requisito: NO usar la palabra “target”.

Propuesta de naming:
- Entidad: "Project" (proyecto)
- Alternativas: "Campaign" (campaña), "Client" (cliente), "Workspace" (espacio)

Recomendación:
- Usar "Project" (neutro y reusable). Se puede mostrar en UI como “Agrupadores” o “Proyectos”.

Decisión:
- Se usará la entidad "Project".

## ADR-003: Soft delete
Estado: Propuesta

- Órdenes y comentarios no se borran físicamente.
- Campos: deletedAt (y opcional deletedById).

## ADR-004: Auditoría mínima
Estado: Propuesta

- createdAt, updatedAt en todas las entidades
- createdById en entidades creadas por usuario

## ADR-005: Seguridad integración n8n
Estado: Propuesta

- Webhook protegido con secreto compartido (header X-N8N-SECRET)
- Validación de payload con zod
- Registro de errores de integración

## ADR-006: Conteo de comentarios usados por usuario
Estado: Aceptada

Decisión:
- Se guardará en User un contador "commentsUsed".
- Se incrementará al persistir comentarios recibidos desde n8n.

## ADR-007: Planes y monetización (base)
Estado: Aceptada

Decisión:
- Se agregará "plan" (FREE/PRO) en User.
- "commentLimit" existirá en User y podrá derivarse del plan, pero quedará disponible para overrides.

## ADR-008: Idioma
Estado: Aceptada

Decisión:
- Toda la interfaz de usuario y los mensajes de la aplicación deben estar en **Español**.
- El código (nombres de variables, funciones) puede mantenerse en inglés, pero los textos visibles al usuario deben ser en español.
