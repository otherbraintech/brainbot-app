# ROADMAP

## Objetivo
Dashboard para crear órdenes de generación de comentarios, enviarlas a n8n y recibir comentarios generados, con control de roles y límites por usuario.

## TASKS

- [x] Definir decisiones (auth, naming, soft delete/auditoría, rate limiting, seguridad webhook n8n)
- [ ] Prisma schema completo + migraciones PostgreSQL
- [ ] Autenticación: /login y /register (sin email) + protección de rutas
- [ ] Layout dashboard + sidebar-07 + navegación por módulos
- [ ] Módulo de agrupadores (crear/listar/ver detalle)
- [ ] Módulo de órdenes (crear/listar/ver detalle, estados)
- [ ] Webhook n8n para persistir comentarios generados (validaciones + seguridad)
- [ ] Límite por usuario: impedir nuevas órdenes si excede, dashboard con “usados/permitidos”
- [ ] Roles ADMIN/USER + vistas admin (usuarios y métricas básicas)
- [ ] Soft delete (órdenes y comentarios) + auditoría mínima
- [ ] Rate limiting básico (órdenes y webhook)
- [ ] Testing básico (smoke tests de endpoints) + validaciones

## Entregables por fase
- Fase 0: docs + decisiones
- Fase 1: data model + backend base
- Fase 2: frontend base + módulos
- Fase 3: seguridad/límites/roles + hardening
