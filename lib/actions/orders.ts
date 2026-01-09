"use server"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { OrderStatus } from "@/lib/generated/prisma/client"

export async function getOrders(projectId: string) {
  const session = await getSession()
  
  if (!session) {
    return []
  }
  
  const orders = await prisma.generationOrder.findMany({
    where: { 
      projectId,
      userId: session,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  })
  
  return orders
}

export async function getOrder(id: string) {
  const session = await getSession()
  
  if (!session) {
    return null
  }
  
  const order = await prisma.generationOrder.findFirst({
    where: { 
      id,
      userId: session,
      deletedAt: null,
    },
    include: {
      project: true,
      comments: true,
    },
  })
  
  return order
}

type CreateOrderInput = {
  projectId: string
  link: string
  socialNetwork: "INSTAGRAM" | "FACEBOOK" | "TIKTOK"
  postType: "IMAGEN" | "VIDEO" | "TEXTO"
  intent?: string
  quantity: number
}

export async function createOrder(input: CreateOrderInput) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }
  
  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: input.projectId, userId: session },
  })
  
  if (!project) {
    return { error: "Proyecto no encontrado" }
  }
  
  if (!input.link || input.link.length < 10) {
    return { error: "Ingresa un enlace válido" }
  }
  
  if (input.quantity < 1 || input.quantity > 100) {
    return { error: "La cantidad debe ser entre 1 y 100" }
  }
  
  const order = await prisma.generationOrder.create({
    data: {
      userId: session,
      projectId: input.projectId,
      link: input.link,
      socialNetwork: input.socialNetwork,
      postType: input.postType,
      intent: input.intent,
      quantity: input.quantity,
      status: OrderStatus.LISTA,
    },
  })
  
  revalidatePath(`/dashboard/projects/${input.projectId}`)
  
  return { success: true, order }
}

type UpdateOrderInput = {
  id: string
  link?: string
  socialNetwork?: "INSTAGRAM" | "FACEBOOK" | "TIKTOK"
  postType?: "IMAGEN" | "VIDEO" | "TEXTO"
  intent?: string
  quantity?: number
}

export async function updateOrder(input: UpdateOrderInput) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }
  
  const order = await prisma.generationOrder.findFirst({
    where: { id: input.id, userId: session, deletedAt: null },
  })
  
  if (!order) {
    return { error: "Orden no encontrada" }
  }
  
  if (order.status !== "LISTA") {
    return { error: "No se puede editar una orden que ya fue iniciada" }
  }
  
  await prisma.generationOrder.update({
    where: { id: input.id },
    data: {
      ...(input.link && { link: input.link }),
      ...(input.socialNetwork && { socialNetwork: input.socialNetwork }),
      ...(input.postType && { postType: input.postType }),
      intent: input.intent,
      ...(input.quantity && { quantity: input.quantity }),
    },
  })
  
  revalidatePath(`/dashboard/projects/${order.projectId}`)
  
  return { success: true }
}

export async function deleteOrder(id: string) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }
  
  const order = await prisma.generationOrder.findFirst({
    where: { id, userId: session },
  })
  
  if (!order) {
    return { error: "Orden no encontrada" }
  }
  
  // Soft delete
  await prisma.generationOrder.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
  
  revalidatePath(`/dashboard/projects/${order.projectId}`)
  
  return { success: true }
}

const N8N_WEBHOOK_URL = "https://intelexia-labs-n8n.af9gwe.easypanel.host/webhook/run-orders-gen-comment"

export async function startOrder(id: string) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }
  
  const order = await prisma.generationOrder.findFirst({
    where: { id, userId: session },
    include: {
      project: true,
    },
  })
  
  if (!order) {
    return { error: "Orden no encontrada" }
  }
  
  if (order.status !== "LISTA") {
    return { error: "La orden ya fue iniciada" }
  }
  
  // Send to n8n webhook - n8n will update status directly in PostgreSQL
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        projectId: order.projectId,
        projectName: order.project.name,
        userId: order.userId,
        link: order.link,
        socialNetwork: order.socialNetwork,
        postType: order.postType,
        intent: order.intent,
        quantity: order.quantity,
      }),
    })
    
    if (!response.ok) {
      console.error("Webhook returned error:", response.status)
      return { error: "Error al enviar la orden. El servidor respondió con error." }
    }
  } catch (error) {
    console.error("Error sending to n8n:", error)
    return { error: "Error al enviar la orden. Intenta de nuevo." }
  }
  
  revalidatePath(`/dashboard/projects/${order.projectId}`)
  
  return { success: true }
}
