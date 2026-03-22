---
description: Estándares de diseño de UI, estilo, e idioma para el proyecto.
---

# 🎨 Estándares de UI y Componentes

Para garantizar la mantenibilidad, rendimiento y consistencia visual de la aplicación, todo el desarrollo Frontend debe seguir estas directrices:

# Estándares de UI

## Estándares de Diseño

- **Responsivo**: El diseño debe adaptarse a móviles, tablets y desktops.
- **Modo Oscuro**: Soporte nativo para Dark Mode usando variables de shadcn/ui.
- **Tipografía**: Priorizar `font-black` para títulos y métricas clave, y `uppercase tracking-widest` para etiquetas secundarias o metadatos.
- **Componentes**: Usar exclusivamente shadcn/ui.

## Patrones de Layout

### 1. Panel de Métricas y Cabecera (Active Dashboard)
Para todas las vistas principales de dashboard que muestran métricas de progreso:
- **Título**: `text-2xl` a `text-3xl`, `font-black`.
- **Subtítulo/Metadatos**: Debajo del título, `text-[10px]` o `text-xs`, `font-black`, `uppercase`, `tracking-widest`, color `muted-foreground`.
- **Bloques de Métricas**:
  - Etiqueta pequeña arriba (`text-[9px]`, `font-black`, `muted`).
  - Valor grande abajo (`text-lg` a `text-xl`, `font-black`).
- **Barra de Progreso**:
  - Usar barras de progreso con colores dinámicos:
    - `0-30%`: Ámbar.
    - `30-70%`: Azul/Índigo.
    - `100%`: Esmeralda con glow.
  - Alto: `h-1.5` o `h-2`.
- **Contenedores**: Fondos suaves (`bg-muted/10` o `bg-indigo-50/5`) con bordes sutiles.

### 2. Tablas de Datos
- **Headers**: `font-black`, `text-[10px]`, `uppercase`, `tracking-wider`.
- **Filas**: `hover:bg-muted/30`, transiciones suaves.
- **Acciones**: Botones de icono `size="icon"` con variantes `ghost` o `outline`.

## React Server Components y Client Components
- **Priorizar Server Components (RSC)**: Por defecto, todos los componentes deben ser Server Components. Utilízalos para el fetching de datos, acceso seguro a la base de datos o secretos, y para renderizar UI que no requiera interactividad inmediata.
- **Client Components (`"use client"`)**: Solo deben utilizarse cuando sea estrictamente necesario (ej. para uso de hooks de estado como `useState`, `useEffect`, manejadores de eventos como `onClick`, o interactividad profunda en el navegador). Aisla el código `"use client"` a los componentes más pequeños y específicos posibles (hojas en el árbol de componentes).

## Estilos y Accesibilidad
- **Tailwind CSS Exclusivamente**: Todos los estilos deben aplicarse utilizando clases de Tailwind.
- **Responsividad**: Todos los componentes e interfaces deben ser construidos aplicando una estrategia Mobile-First, garantizando fluidez y correcta visualización desde dispositivos móviles hasta pantallas de gran formato de escritorio.
- **Soporte Dark/Light Mode**: Toda la interfaz debe ser 100% compatible con temas oscuros y claros, utilizando las directivas de tailwind adecuadas (ej. `dark:bg-slate-900`) y las variables de CSS configuradas a través de shadcn/ui.

## Librería de Componentes (shadcn/ui)
- Utiliza **exclusivamente** componentes prefabricados de `shadcn/ui` cuando uno que sirva el mismo propósito exista (Buttons, Inputs, Dialogs, Cards, Badges, etc.).
- Si se solicita un nuevo componente custom que no exista en shadcn/ui, este debe ser modelado imitando fielmente la estética, la estructura de utilidades y la filosofía (usando Radix UI headless primitives si aplica) de shadcn/ui.

## Idioma
- **Español (ES)**: Toda la interfaz de usuario, los mensajes de error mostrados al cliente, notificaciones (toasts), y textos en vistas deben estar en español (referencia ADR-008). 
- El código subyacente (nombres de variables, funciones, props) y los comentarios técnicos deben mantenerse en inglés.
