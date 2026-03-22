---
description: Flujos del sistema, integración con n8n y seguridad de webhooks.
---

# 🔄 Flujos del Sistema e Integración n8n

El proyecto se integra fuertemente con n8n para delegar la generación de respuestas e interacciones mediante agentes. A continuación se define el marco de operación y seguridad para esta integración.

## Integración con Webhooks (n8n)

### Flujo de Órdenes y Resultados

1. **Despacho**: Un usuario autenticado crea una orden (estado inicial `BORRADOR` o en el mejor de los casos `LISTA` para enviar). Se valida el límite antes de la aceptación (commentsUsed vs commentLimit).
2. **Webhook Outbound**: Si la orden se inicia con éxito, se envía una solicitud a la URL del webhook de n8n, actualizando localmente el estado de la orden (por ejemplo a `GENERANDO`).
3. **Webhook Inbound (n8n -> Next.js)**: n8n procesa la generación a través del LLM o modelo definido. Al terminar, llama al Webhook expuesto de nuestra aplicación de Next.js para entregar el batch de resultados generados (ej. los text pools listos a comentar).
4. **Validación Inbound**:
   - Nuestra API Route (`/api/webhooks/bot-comentarios` u homólogos) intercepta el request POST entrante.
   - Procede a instanciar una confirmación de seguridad de header (ver abajo).
   - Valida robustamente la firma y tipo del body entrante a través de un esquema estructurado usando **Zod**.
5. **Persistencia e Impacto**: 
   - Se insertan los registros transaccionales validados (`BotComment`, `GenLike`, etc.).
   - Se actualiza el estado matriz de la `GenerationOrder` a `GENERADA`.
   - Se incrementa paralelamente el conteo sumatorio `commentsUsed` del Usuario.

### Patrón de Seguridad (ADR-005)

Por decisión arquitectónica (ADR-005), la comunicación entre la aplicación Next.js y los pipelines de n8n requiere ser securizada sin incurrir en mTLS complejo.

- **Firma Compartida (Secreto)**: Todos los requests entrantes originados desde n8n al Webhook Next.js deben estar rigurosamente protegidos en la cabecera por un API Key provado. El sistema en Next.js busca y compara un header HTTP custom bautizado estrictamente como `X-N8N-SECRET`.
- **Validación Estructural**: Además de la validación del Header pre-autorizado, **zod** se encarga de forzar el Parse o lanzar excepción del Payload (comprobación de tipos `string`, `int`, subobjetos, etc.).
- **Trazabilidad Lógica**: Independientemente de si la solicitud pasara el filtro Zod o la capa de seguridad `X-N8N-SECRET`, todo fallo debe atraparse en el nivel mas externo e instanciar un log persistente en la tabla relacional `IntegrationLog` bajo el tag de error para facilitar debugging retrospectivo.

### Rate Limiting

La protección antispam se gestiona globalmente. Las órdenes salientes y las respuestas transaccionales del webhook se rigen por cuota (Límite por usuario documentado). Existen validaciones para mitigar peticiones en bucle.
