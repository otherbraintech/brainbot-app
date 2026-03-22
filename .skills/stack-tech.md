---
description: Stack tecnológico y librerías clave utilizadas en OB Bot App.
---

# 💻 Stack Tecnológico

El proyecto se basa en las siguientes tecnologías principales. Al generar nuevo código o proponer soluciones, debes adherirte estrictamente a este stack:

## Core Framework
- **Next.js 16.1.1**: Usando **App Router** exclusivamente.
- **React 19.2.3**
- **TypeScript**: Estricto tipado en todo el código. No usar `any`.

## Base de Datos & Backend
- **Prisma ORM (7.2.0)**: Manejo de base de datos.
- **PostgreSQL**: Base de datos principal configurada a través de la variable de entorno `DATABASE_URL` (usando `@prisma/adapter-pg`).
- **Autenticación**: Implementación custom basada en JWT firmado en cookie `httpOnly` (ver ADR-001) y hashing de passwords con `bcryptjs`.

## UI & Estilos
- **Tailwind CSS 4**: Motor principal de estilos (con `tailwindcss-animate`).
- **shadcn/ui**: Librería de componentes base construida sobre Radix UI y Tailwind.

## Patrones Específicos de UI requeridos
El proyecto implementa bloques específicos para ciertas vistas:
- **Dashboard**: Se utiliza la variante `sidebar-07` para el layout y la navegación lateral de la aplicación autenticada.
- **Autenticación**:
  - Para el registro se utiliza el patrón `signup-01`.
  - Para el inicio de sesión se utiliza el patrón `login-01`.
