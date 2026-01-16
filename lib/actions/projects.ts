"use server"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { OrderStatus, ProjectStance } from "@prisma/client"

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
      target: true,
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
    select: {
      id: true,
      name: true,
      nameLower: true,
      userId: true,
      targetId: true,
      target: true,
      stance: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
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

export async function getTargetUsage(targetId: string) {
  const session = await getSession()
  if (!session) return { error: "No autenticado" }

  const projects = await prisma.project.findMany({
    where: {
      userId: session,
      targetId: targetId
    },
    select: {
      id: true,
      name: true,
      stance: true
    }
  })

  return { projects }
}

export async function createProject(name: string, targetId?: string, stance: ProjectStance = "FAVOR") {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }
  
  if (!name || name.length < 2) {
    return { error: "El nombre debe tener al menos 2 caracteres" }
  }
  
  const nameLower = name.toLowerCase().trim().replace(/\s+/g, "_")

  // If targetId provided, verify it belongs to user and check stance exclusivity
  if (targetId) {
      const target = await prisma.target.findFirst({ where: { id: targetId, userId: session } })
      if (!target) return { error: "Objetivo no válido" }

      // Check if this target is already used with the same stance
      const existingWithSameStance = await prisma.project.findFirst({
        where: {
          userId: session,
          targetId: targetId,
          stance: stance
        }
      })

      if (existingWithSameStance) {
        const stanceText = stance === "FAVOR" ? "A Favor" : "En Contra"
        return { error: `Ya existe un proyecto "${existingWithSameStance.name}" con este objetivo y postura "${stanceText}". Usa la postura opuesta.` }
      }
  }
  
  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      nameLower,
      userId: session,
      targetId: targetId || null,
      stance: stance
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
    const webhookBody = [{
      ...payload.target_input,
      user_id: session
    }]
    
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookBody),
    })

    const responseData = await response.json()

    if (!responseData.estado && responseData.code !== 200) {
      return { error: responseData.Message || "Error en el servidor de n8n" }
    }

    // 2. Update local DB (Create Target and Link)
    const targetData = payload.target_input.target?.[0] || payload.target_input
    const identityName = targetData.basic_identity?.name || "Nuevo Objetivo"
    const role = targetData.basic_identity?.role || ""
    const displayName = role ? `${identityName} - ${role}` : identityName

    const newTarget = await prisma.target.create({
      data: {
        content: payload.target_input,
        userId: session, // Required field
        name: displayName
      }
    })

    await prisma.project.update({
      where: { id: payload.project_id },
      data: {
        targetId: newTarget.id
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
    // Legacy support or specific use case wrapper
    // Now we prefer updating the target directly via targets.ts
    // But if called for a project's linked target:
  const session = await getSession()
  if (!session) return { error: "No autorizado" }

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    
    if (project?.targetId) {
      await prisma.target.update({
        where: { id: project.targetId },
        data: { content: targetData }
      })
    }
    // If no target, we can't update.
    
    revalidatePath("/dashboard/projects")
    return { success: true }
  } catch (error) {
    console.error("Error in updateTargetAction:", error)
    return { error: "Error al actualizar el objetivo" }
  }
}

export async function assignTargetToProject(projectId: string, targetId: string, stance: ProjectStance) {
  const session = await getSession()
  if (!session) return { error: "No autorizado" }

  try {
     // Verify ownership of both project and target
     const project = await prisma.project.findFirst({ where: { id: projectId, userId: session } })
     if (!project) return { error: "Proyecto no encontrado" }
     
     const target = await prisma.target.findFirst({ where: { id: targetId, userId: session } })
     if (!target) return { error: "Objetivo no encontrado" }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        targetId: targetId,
        stance: stance
      }
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath("/dashboard/projects")
    return { success: true }
  } catch (error) {
    console.error("Error in assignTargetToProject:", error)
    return { error: "Error al asignar el objetivo" }
  }
}
