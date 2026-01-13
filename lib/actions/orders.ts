"use server"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { OrderStatus, SocialNetwork, PostType, InteractionStatus, OrderType } from "@prisma/client"

export async function getOrders(projectId: string) {
  const session = await getSession()
  
  if (!session) {
    return []
  }
  
  const orders = await prisma.botOrder.findMany({
    where: { 
      projectId,
      userId: session,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          genComments: true,
          genLikes: true,
          genShares: true,
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
  
  const order = await prisma.botOrder.findFirst({
    where: { 
      id,
      userId: session,
      deletedAt: null,
    },
    include: {
      project: true,
      genComments: {
        include: {
          device: true
        },
        orderBy: { createdAt: "desc" }
      },
      genLikes: true,
      genShares: true,
    },
  })
  
  return order
}

type CreateOrderInput = {
  projectId: string
  link: string
  socialNetwork: SocialNetwork
  postType: PostType
  orderName: string
  type: OrderType
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
  
  if (input.quantity < 1 || input.quantity > 500) {
    return { error: "La cantidad debe ser entre 1 y 500" }
  }
  
  const order = await prisma.botOrder.create({
    data: {
      userId: session,
      projectId: input.projectId,
      type: input.type,
      url: input.link,
      socialNetwork: input.socialNetwork,
      postType: input.postType,
      orderName: input.orderName,
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
  quantity?: number
  intent?: string
  postType?: PostType
  socialNetwork?: SocialNetwork
  link?: string
  orderName?: string
  type?: OrderType
}

export async function updateOrder(input: UpdateOrderInput) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }
  
  const order = await prisma.botOrder.findFirst({
    where: { id: input.id, userId: session, deletedAt: null },
  })
  
  if (!order) {
    return { error: "Orden no encontrada" }
  }
  
  if (order.status !== "LISTA") {
    return { error: "No se puede editar una orden que ya fue iniciada" }
  }
  
  await prisma.botOrder.update({
    where: { id: input.id },
    data: {
      ...(input.link && { url: input.link }),
      ...(input.socialNetwork && { socialNetwork: input.socialNetwork }),
      ...(input.postType && { postType: input.postType }),
      ...(input.intent && { intent: input.intent }),
      ...(input.quantity && { quantity: input.quantity }),
      ...(input.orderName && { orderName: input.orderName }),
      ...(input.type && { type: input.type }),
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
  
  const order = await prisma.botOrder.findFirst({
    where: { id, userId: session },
  })
  
  if (!order) {
    return { error: "Orden no encontrada" }
  }
  
  // Soft delete
  await prisma.botOrder.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
  
  revalidatePath(`/dashboard/projects/${order.projectId}`)
  
  return { success: true }
}

const N8N_WEBHOOK_URL_COMMENTS = "https://intelexia-labs-n8n.af9gwe.easypanel.host/webhook/run-orders-gen-comment"
const N8N_WEBHOOK_URL_LIKES = "https://intelexia-labs-n8n.af9gwe.easypanel.host/webhook/run-orders-gen-likes"
const N8N_WEBHOOK_URL_SHARES = "https://intelexia-labs-n8n.af9gwe.easypanel.host/webhook/run-orders-gen-shares"

export async function startOrder(id: string) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }
  
  const order = await prisma.botOrder.findFirst({
    where: { id, userId: session },
  })
  
  if (!order) {
    return { error: "Orden no encontrada" }
  }
  
  if (order.status !== "LISTA" && order.status !== "REINTENTAR" && order.status !== "CANCELADA") {
    return { error: "La orden ya fue iniciada o completada" }
  }

  // Si es Like o Share, creamos el registro hijo antes de disparar el webhook
  if (order.type === OrderType.MEGUSTA) {
    await prisma.genLike.create({
      data: {
        orderId: id,
        userId: session,
        status: InteractionStatus.PENDIENTE
      }
    })
  } else if (order.type === OrderType.COMPARTIR) {
    await prisma.genShare.create({
      data: {
        orderId: id,
        userId: session,
        status: InteractionStatus.PENDIENTE
      }
    })
  }
  
  // Actualizamos el estado a GENERANDO antes de disparar el webhook
  await prisma.botOrder.update({
    where: { id },
    data: { status: OrderStatus.GENERANDO }
  })
  
  try {
    let webhookUrl = N8N_WEBHOOK_URL_COMMENTS;
    if (order.type === OrderType.MEGUSTA) webhookUrl = N8N_WEBHOOK_URL_LIKES;
    if (order.type === OrderType.COMPARTIR) webhookUrl = N8N_WEBHOOK_URL_SHARES;

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
      }),
    })
    
    if (!response.ok) {
      // Si falla el webhook, volvemos a ponerlo en REINTENTAR para que el usuario sepa
      await prisma.botOrder.update({
        where: { id },
        data: { status: OrderStatus.REINTENTAR }
      })
      return { error: "Error al enviar la orden. El servidor respondió con error." }
    }
  } catch (error) {
    // Si hay error de red, volvemos a ponerlo en REINTENTAR
    await prisma.botOrder.update({
      where: { id },
      data: { status: OrderStatus.REINTENTAR }
    })
    return { error: "Error al enviar la orden. Intenta de nuevo." }
  }
  
  revalidatePath(`/dashboard/projects/${order.projectId}`)
  
  return { success: true }
}

export async function getOrderWithComments(orderId: string) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autorizado" }
  }
  
  const order = await prisma.botOrder.findUnique({
    where: { 
      id: orderId,
      userId: session,
      deletedAt: null,
    },
    include: {
      genComments: {
        include: {
          device: {
            select: { deviceName: true }
          }
        },
        orderBy: { createdAt: "desc" },
      },
      project: {
        select: {
            name: true,
            id: true
        }
      }
    },
  })
  
  return { order }
}

export async function getNextOrderName(projectId: string) {
  const session = await getSession()
  
  if (!session) return "Orden #1"
  
  const count = await prisma.botOrder.count({
    where: { projectId }
  })
  
  return `Orden #${count + 1}`
}
