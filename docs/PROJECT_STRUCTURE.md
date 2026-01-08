# Estructura general del proyecto (propuesta)

## App Router
- app/(auth)/login
- app/(auth)/register
- app/(dashboard)/dashboard
- app/(dashboard)/dashboard/projects
- app/(dashboard)/dashboard/projects/[projectId]
- app/(dashboard)/dashboard/orders
- app/api/auth/*
- app/api/projects/*
- app/api/orders/*
- app/api/n8n/webhook

## Capas
- lib/
  - prisma.ts (cliente prisma singleton)
  - auth/* (JWT, cookies, password hashing)
  - validation/* (zod schemas)
  - rate-limit/*
- components/
  - ui/* (shadcn)
  - dashboard/*

## Principios
- Separación clara por layouts (auth vs dashboard)
- Endpoints API con validaciones y permisos
- Prisma como fuente de verdad del modelo
