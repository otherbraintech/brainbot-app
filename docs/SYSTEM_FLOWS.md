# Flujos clave

## Registro
1) Usuario crea cuenta con username/password/name
2) Se guarda passwordHash
3) Se inicia sesión (cookie)

## Login
1) Usuario envía username/password
2) Se valida passwordHash
3) Se emite cookie (JWT o sesión)

## Crear orden
1) Usuario autenticado crea orden (DRAFT o SENT)
2) Validación de límite (commentsUsed vs commentLimit)
3) Si se envía a n8n: status -> SENT y se registra requestId

## Recepción de comentarios (n8n)
1) n8n llama webhook con secret
2) Se valida payload
3) Se insertan BotComments
4) Se actualiza status de la orden (GENERATED)
5) Se incrementa conteo de commentsUsed
