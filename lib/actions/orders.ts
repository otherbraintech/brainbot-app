"use server"
// Triggering reload for new enums

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { OrderStatus, SocialNetwork, PostType, CommentStatus, OrderType } from "@prisma/client"

type ExtendedPostType = PostType | "PAGINA" | "PUBLICACION"

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
          genFollows: true,
          genReports: true,
          genLives: true,
        },
      },
    },
  })
  
  return orders
}

export async function getAllOrders() {
  const session = await getSession()
  
  if (!session) {
    return []
  }
  
  const orders = await prisma.botOrder.findMany({
    where: { 
      userId: session,
    },
    orderBy: { createdAt: "desc" },
    include: {
      project: {
        select: {
          name: true,
          id: true
        }
      },
      _count: {
        select: {
          genComments: true,
          genLikes: true,
          genShares: true,
          genFollows: true,
          genReports: true,
          genLives: true,
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
      genLikes: {
        include: { device: true },
        orderBy: { createdAt: "desc" }
      },
      genShares: {
        include: { device: true },
        orderBy: { createdAt: "desc" }
      },
      genFollows: {
        include: { device: true },
        orderBy: { createdAt: "desc" }
      },
      genReports: {
        include: { device: true },
        orderBy: { createdAt: "desc" }
      },
      genLives: {
        include: { device: true },
        orderBy: { createdAt: "desc" }
      },
    },
  })
  
  return order
}

type CreateOrderInput = {
  projectId: string
  link: string
  socialNetwork: SocialNetwork
  postType: ExtendedPostType
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
  
  if (!input.link || (input.link as any).length < 10) {
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
    } as any,
  })
  
  revalidatePath(`/dashboard/projects/${input.projectId}`)
  
  return { success: true, order }
}

type UpdateOrderInput = {
  id: string
  quantity?: number
  intent?: string
  postType?: ExtendedPostType
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
    } as any,
  })
  
  revalidatePath(`/dashboard/projects/${order.projectId}`)
  
  return { success: true }
}

export async function pauseAllOrders(projectId: string) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }

  // Update all orders in GENERADA status for this project and user
  const result = await prisma.botOrder.updateMany({
    where: {
      projectId,
      userId: session,
      status: OrderStatus.GENERADA
    },
    data: {
      status: OrderStatus.PAUSADA
    } as any
  })

  revalidatePath(`/dashboard/projects/${projectId}`)

  return { success: true, count: result.count }
}

export async function resumeAllOrders(projectId: string) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }

  // Update all orders in PAUSADA status for this project and user
  const result = await prisma.botOrder.updateMany({
    where: {
      projectId,
      userId: session,
      status: OrderStatus.PAUSADA
    },
    data: {
      status: OrderStatus.GENERADA
    } as any
  })

  revalidatePath(`/dashboard/projects/${projectId}`)

  return { success: true, count: result.count }
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
  
  // Soft delete and mark as CANCELADA
  await prisma.botOrder.update({
    where: { id },
    data: { 
      deletedAt: new (globalThis as any).Date(),
      status: OrderStatus.CANCELADA 
    } as any,
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
  
  const order = await prisma.botOrder.findFirst({
    where: { id, userId: session },
    include: {
      project: {
        include: {
          target: true,
        },
      },
    },
  })
  
  if (!order) {
    return { error: "Orden no encontrada" }
  }

  if (order.type === OrderType.COMENTARIO) {
    if (!order.project?.target) {
      return {
        error: "Se necesita crear un objetivo para enviar órdenes de comentarios.",
        code: "PROJECT_TARGET_REQUIRED",
        projectId: order.projectId,
      }
    }
  }
  
  if (order.status !== "LISTA" && order.status !== "REINTENTAR" && order.status !== "CANCELADA" && order.status !== "PAUSADA") {
    return { error: "La orden ya fue iniciada o completada" }
  }

  // Actualizamos el estado a GENERANDO antes de disparar el webhook
  await prisma.botOrder.update({
    where: { id },
    data: { status: OrderStatus.GENERANDO } as any
  })
  
  try {
    const webhookPayload = {
      // Backwards-compatible identifier
      orderId: order.id,
      // Legacy top-level fields some n8n flows might rely on
      projectId: order.projectId,
      userId: order.userId,
      type: order.type,
      url: order.url,
      orderName: (order as any).orderName,
      socialNetwork: order.socialNetwork,
      postType: order.postType,
      quantity: order.quantity,
      intent: order.intent || null, // Explicitly include even if null
      status: OrderStatus.GENERANDO,
      // Full order snapshot
      order: {
        id: order.id,
        projectId: order.projectId,
        userId: order.userId,
        type: order.type,
        url: order.url,
        orderName: (order as any).orderName,
        socialNetwork: order.socialNetwork,
        postType: order.postType,
        intent: order.intent || null,
        quantity: order.quantity,
        status: OrderStatus.GENERANDO,
        sentAt: order.sentAt,
        generatedAt: order.generatedAt,
        deletedAt: (order as any).deletedAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      // Project snapshot
      project: order.project
        ? {
            id: order.project.id,
            name: order.project.name,
            nameLower: (order.project as any).nameLower,
            userId: order.project.userId,
            targetId: (order.project as any).targetId,
            stance: (order.project as any).stance,
            createdAt: order.project.createdAt,
            updatedAt: order.project.updatedAt,
            deletedAt: (order.project as any).deletedAt,
            target: order.project.target
              ? {
                  id: order.project.target.id,
                  name: order.project.target.name,
                  content: (order.project.target as any).content,
                  imageBase64: (order.project.target as any).imageBase64,
                }
              : null,
          }
        : null,
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: (globalThis as any).JSON.stringify([webhookPayload]),
    })
    
    if (!response.ok) {
      // Si falla el webhook, volvemos a ponerlo en REINTENTAR para que el usuario sepa
      await prisma.botOrder.update({
        where: { id },
        data: { status: OrderStatus.REINTENTAR } as any
      })
      return { error: "Error al enviar la orden. El servidor respondió con error." }
    }
  } catch (error) {
    // Si hay error de red, volvemos a ponerlo en REINTENTAR
    await prisma.botOrder.update({
      where: { id },
      data: { status: OrderStatus.REINTENTAR } as any
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
      genLives: {
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
    where: {
      projectId,
      userId: session,
      deletedAt: null,
      status: { not: OrderStatus.COMPLETADA },
    },
  })
  
  const nextCount = (globalThis as any).Number(count) + 1
  return `Orden #${nextCount}`
}

export async function getBreadcrumbData(orderId: string) {
  const session = await getSession()
  
  if (!session) return null
  
  const order = await prisma.botOrder.findUnique({
    where: { 
      id: orderId,
      userId: session 
    },
    select: {
      orderName: true,
      projectId: true,
      type: true,
      project: {
        select: {
          name: true
        }
      }
    }
  })
  
  if (!order) return null
  
  return {
    orderName: order.orderName || `Orden ${order.type}`,
    projectName: order.project.name,
    projectId: order.projectId
  }
}

export async function pauseOrder(id: string) {
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

  if (order.status !== OrderStatus.GENERADA) {
    return { error: "Solo se pueden pausar órdenes que están en cola (GENERADA)" }
  }
  
  await prisma.botOrder.update({
    where: { id },
    data: { status: OrderStatus.PAUSADA } as any,
  })
  
  revalidatePath(`/dashboard/projects/${order.projectId}`)
  
  return { success: true }
}

export async function resumeOrder(id: string) {
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

  if (order.status !== OrderStatus.PAUSADA) {
    return { error: "Solo se pueden reanudar órdenes que están pausadas" }
  }
  
  await prisma.botOrder.update({
    where: { id },
    data: { status: OrderStatus.GENERADA } as any,
  })
  
  revalidatePath(`/dashboard/projects/${order.projectId}`)
  
  return { success: true }
}

export async function duplicateOrder(id: string) {
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
  
  await prisma.botOrder.create({
    data: {
      userId: session,
      projectId: order.projectId,
      type: order.type,
      url: order.url,
      socialNetwork: order.socialNetwork,
      postType: order.postType,
      orderName: `${order.orderName} (Copia)`,
      intent: order.intent,
      quantity: order.quantity,
      status: OrderStatus.LISTA,
    } as any,
  })
  
  revalidatePath(`/dashboard/projects/${order.projectId}`)
  
  return { success: true }
}
