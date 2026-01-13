"use server"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { OrderStatus } from "@prisma/client"

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
          botOrders: { where: { deletedAt: null } },
          genComments: true,
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
          botOrders: { where: { deletedAt: null } },
          genComments: true,
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
        select: { botOrders: true },
      },
    },
  })
  
  if (!project) {
    return { error: "Proyecto no encontrado" }
  }
  
  // 1. Mark all orders as CANCELLED (instead of deleting them)
  await prisma.botOrder.updateMany({
    where: { projectId: id },
    data: { status: OrderStatus.CANCELADA },
  })

  // 2. Soft delete the project (set deletedAt)
  await prisma.project.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  
  revalidatePath("/dashboard/projects")
  
  return { success: true }
}

export async function createTargetAction(payload: any) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }

  const WEBHOOK_URL = "https://intelexia-labs-n8n.af9gwe.easypanel.host/webhook/creation_target"

  try {
    // 1. Send to Webhook
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const responseData = await response.json()

    if (!responseData.estado && responseData.code !== 200) {
      return { error: responseData.Message || "Error en el servidor de n8n" }
    }

    // 2. Update local DB
    await prisma.project.update({
      where: { id: payload.project_id },
      data: {
        target: payload.target_input
      }
    })

    revalidatePath("/dashboard/projects")
    return { success: true, message: responseData.Message }
  } catch (error) {
    console.error("Error in createTargetAction:", error)
    return { error: "Error al enviar el objetivo al servidor externo" }
  }
}

export async function updateTargetAction(projectId: string, targetData: any) {
  const session = await getSession()
  if (!session) return { error: "No autorizado" }

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        target: targetData
      }
    })

    revalidatePath("/dashboard/projects")
    return { success: true }
  } catch (error) {
    console.error("Error in updateTargetAction:", error)
    return { error: "Error al actualizar el objetivo" }
  }
}
