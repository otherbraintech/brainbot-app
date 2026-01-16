# Contexto del Proyecto: Brain Bot App

Este documento proporciona una visión general técnica y funcional del proyecto **Brain Bot App**. Sirve como punto de referencia para entender la arquitectura, el modelo de datos y los flujos principales.

## 1. Visión General
**Brain Bot App** es una plataforma diseñada para gestionar y automatizar interacciones en redes sociales (Instagram, TikTok, Facebook, YouTube) mediante "Bots" o agentes. Permite a usuarios (influencers, empresas, marcas personales) definir "Objetivos" (Targets) detallados y generar órdenes de interacción (likes, comentarios, shares) alineadas con esos perfiles.

## 2. Stack Tecnológico

### Core
- **Framework**: Next.js 16.1.1 (App Router)
- **UI Library**: React 19.2.3
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4 (con `tailwindcss-animate`), Shadcn UI (basado adjunto a Radix UI).

### Base de Datos & Backend
- **ORM**: Prisma 7.2.0
- **Base de Datos**: PostgreSQL (`@prisma/adapter-pg`)
- **Autenticación**: Custom implementation (bcryptjs sessión).

### Integraciones Externas
- **n8n**: Webhooks para procesamiento de "Targets" y ejecución de órdenes.
- **API Routes**: Server Actions y API Endpoints para comunicación interna.

## 3. Modelo de Datos (Prisma)

El esquema gira en torno a usuarios gestionando proyectos, que a su vez contienen órdenes de bots.

### Entidades Principales
- **User**: Usuarios del sistema con roles (ADMIN, USUARIO) y planes (GRATIS, PRO).
- **Project**: Contenedor principal.
    - `target`: Relación con el modelo `Target` -> `content` (JSON).
    - Relación 1:N con `BotOrder`.
- **BotOrder**: Una solicitud de acción (COMENTARIO, MEGUSTA, etc.).
    - Estados: LISTA, GENERANDO, GENERADA, COMPLETADA, CANCELADA.
    - Red Social: INSTAGRAM, TIKTOK, FACEBOOK, YOUTUBE.
- **GenComment / GenLike / etc.**: Resultados específicos generados por las órdenes.
- **Device**: Dispositivos físicos/virtuales que ejecutan las acciones (gestión de granjas de dispositivos).

### Enums Clave
- **SocialNetwork**: Plataformas soportadas.
- **OrderType**: Tipos de interacción.
- **DeviceStatus**: Estado de los dispositivos (LIBRE, OCUPADO).

## 4. Módulos Clave

### A. Definición de Objetivos (Targets)
Formulario complejo (`CreateTargetButton`) que recopila información profunda sobre la identidad:
- **Identidad Básica**: Nombre, rol, ubicación.
- **Identidad Contextual**: Fase del proyecto, competencia, audiencia.
- **Pistas Discursivas**: Tono de voz, temas tabú.
- **Señales Conductuales**: Estilo público.
- **Identidad Visual**: Apariencia, imágenes de referencia (Base64).

**Flujo**:
1. Usuario llena formulario multi-paso.
2. JSON se envía a Webhook de n8n (`creation_target`).
3. Se guarda en el registro `Target` vinculado al Project.

3. **Target (Objetivo)**:
   - Nuevo modelo `Target` vinculado a Project.
   - Tabla independiente que almacena el JSON del objetivo en `content`.
   - Se vincula al `Project` mediante `targetId` (Relación 1:1).

### B. Gestión de Órdenes (Bot Orders)
Los usuarios crean órdenes para generar tráfico o interacción.
- Las órdenes se asocian a un Proyecto.
- El sistema rastrea el estado de la generación (`OrderStatus`).

### C. Panel de Administración
Gestión de usuarios, dispositivos y monitoreo de integraciones (`IntegrationLog`).

## 5. Estructura de Directorios (Resumen)
- `/app`: Rutas de Next.js (Dashboard, API, Panel Admin).
- `/components`: Componentes UI reutilizables (Shadcn) y específicos de negocio.
- `/lib`: Utilidades, configuración de Prisma, Auth, Server Actions.
- `/prisma`: Esquema de base de datos y migraciones.
- `/docs`: Documentación del proyecto.

## 6. Estado Actual (Roadmap)
- [x] Autenticación básica.
- [x] CRUD de Proyectos.
- [x] Definición de Targets (Formulario + Webhook).
- [ ] Refinamiento de Dashboard de Métricas.
- [ ] Optimización de asignación de dispositivos.
