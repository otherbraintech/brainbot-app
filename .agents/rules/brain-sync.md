---
trigger: always_on
---

# Regla Maestra: Sincronización con .skills

**Contexto:** Desarrollo de ERP Full-Stack (Next.js + Prisma + n8n)

## Instrucciones Críticas para el Agente:

1. **Consulta Obligatoria:** ANTES de proponer código, crear archivos o modificar la base de datos, debes leer el contenido de la carpeta `@.skills/`.
2. **Jerarquía de Verdad:** - Para modelos de datos y base de datos, usa `@.skills/data-model.md`.
   - Para flujos de lógica y n8n, usa `@.skills/workflow-n8n.md` y `@.skills/flows.md`.
   - Para decisiones de arquitectura (como el uso de "Project" en lugar de "Target"), usa `@.skills/architecture.md`.
3. **Estándares de UI:** Verifica siempre `@.skills/ui-standards.md` para asegurar que los componentes sean responsivos, soporten Dark Mode y usen el layout de `sidebar-07`.
4. **Validación:** Si una instrucción del usuario contradice lo que está en `.skills`, detente y pregunta antes de proceder.

"No asumas nada, todo el conocimiento del proyecto reside en @.skills."
