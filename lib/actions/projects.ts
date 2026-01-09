"use server"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { OrderStatus } from "@/lib/generated/prisma/client"

export async function getProjects() {
  const session = await getSession()
  
  if (!session) {
    return []
  }
  
  const projects = await prisma.project.findMany({
    where: { 
      userId: session,
      deletedAt: null
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          orders: { where: { deletedAt: null } },
          botComments: true,
        },
      },
    },
  })
  
  return projects
}

export async function getProject(id: string) {
  const session = await getSession()
  
  if (!session) {
    return null
  }
  
  const project = await prisma.project.findFirst({
    where: { 
      id,
      userId: session,
    },
    include: {
      _count: {
        select: {
          orders: { where: { deletedAt: null } },
          botComments: true,
        },
      },
    },
  })
  
  return project
}

export async function createProject(name: string) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }
  
  if (!name || name.length < 2) {
    return { error: "El nombre debe tener al menos 2 caracteres" }
  }
  
  const nameLower = name.toLowerCase().trim().replace(/\s+/g, "_")
  
  // Check if project with same name exists for this user
  const existing = await prisma.project.findFirst({
    where: {
      userId: session,
      nameLower,
    },
  })
  
  if (existing) {
    return { error: "Ya existe un proyecto con ese nombre" }
  }
  
  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      nameLower,
      userId: session,
    },
  })
  
  revalidatePath("/dashboard/projects")
  
  return { success: true, project }
}

export async function updateProject(id: string, name: string) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }
  
  if (!name || name.length < 2) {
    return { error: "El nombre debe tener al menos 2 caracteres" }
  }
  
  const nameLower = name.toLowerCase().trim().replace(/\s+/g, "_")
  
  // Verify ownership
  const project = await prisma.project.findFirst({
    where: { id, userId: session },
  })
  
  if (!project) {
    return { error: "Proyecto no encontrado" }
  }
  
  // Check if another project with same name exists
  const existing = await prisma.project.findFirst({
    where: {
      userId: session,
      nameLower,
      NOT: { id },
    },
  })
  
  if (existing) {
    return { error: "Ya existe un proyecto con ese nombre" }
  }
  
  await prisma.project.update({
    where: { id },
    data: {
      name: name.trim(),
      nameLower,
    },
  })
  
  revalidatePath("/dashboard/projects")
  
  return { success: true }
}

export async function deleteProject(id: string) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }
  
  // Verify ownership
  const project = await prisma.project.findFirst({
    where: { id, userId: session },
    include: {
      _count: {
        select: { orders: true },
      },
    },
  })
  
  if (!project) {
    return { error: "Proyecto no encontrado" }
  }
  
  // 1. Mark all orders as CANCELLED (instead of deleting them)
  await prisma.generationOrder.updateMany({
    where: { projectId: id },
    data: { status: OrderStatus.CANCELADO },
  })

  // 2. Soft delete the project (set deletedAt)
  await prisma.project.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  
  revalidatePath("/dashboard/projects")
  
  return { success: true }
}
