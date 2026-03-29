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
      genComments: { select: { status: true } },
      genLikes: { select: { status: true } },
      genShares: { select: { status: true } },
      genFollows: { select: { status: true } },
      genReports: { select: { status: true } },
      genLives: { select: { status: true } },
      genMarketplaces: { select: { status: true } },
      _count: {
        select: {
          genComments: true,
          genLikes: true,
          genShares: true,
          genFollows: true,
          genReports: true,
          genLives: true,
          genMarketplaces: true,
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
      project: { select: { name: true, id: true } },
      genComments: { select: { status: true } },
      genLikes: { select: { status: true } },
      genShares: { select: { status: true } },
      genFollows: { select: { status: true } },
      genReports: { select: { status: true } },
      genLives: { select: { status: true } },
      genMarketplaces: { select: { status: true } },
      _count: {
        select: {
          genComments: true,
          genLikes: true,
          genShares: true,
          genFollows: true,
          genReports: true,
          genLives: true,
          genMarketplaces: true,
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
      project: {
        include: {
          target: true
        }
      },
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
      genMarketplaces: {
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
  marketplaceData?: {
    title: string
    price: number
    category: string
    condition?: string
    location?: string
    description: string
    images: string[]
  }
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
  
  const isMarketplace = input.type === OrderType.MARKETPLACE
  
  if (!isMarketplace && (!input.link || (input.link as any).length < 10)) {
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
      url: (isMarketplace && !input.link) ? (input.marketplaceData?.images?.[0] || "") : (input.link || ""),
      socialNetwork: input.socialNetwork,
      postType: input.postType,
      orderName: input.orderName,
      intent: isMarketplace && input.marketplaceData 
        ? JSON.stringify(input.marketplaceData) 
        : input.intent,
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
  marketplaceData?: {
    title?: string
    price?: number
    category?: string
    condition?: string
    description?: string
    images?: string[]
  }
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
  
  if (order.status !== "LISTA" && order.status !== "REINTENTAR" && order.status !== "CANCELADA" && order.status !== "COMPLETADA") {
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
      ...(input.marketplaceData && { intent: JSON.stringify(input.marketplaceData) }),
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

export async function getGlobalActiveOrders() {
  const session = await getSession()
  
  if (!session) {
    return []
  }
  
  const orders = await prisma.botOrder.findMany({
    where: { 
      userId: session,
      deletedAt: null,
      status: {
        in: [
          OrderStatus.GENERADA, 
          OrderStatus.GENERANDO, 
          OrderStatus.PAUSADA, 
          OrderStatus.REINTENTAR, 
          OrderStatus.LISTA
        ]
      }
    },
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { name: true, id: true } }
    }
  })
  
  return orders;
}

export async function pauseAllGlobalOrders(excludeOrderId?: string) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }

  const result = await prisma.botOrder.updateMany({
    where: {
      userId: session,
      status: OrderStatus.GENERADA,
      ...(excludeOrderId ? { id: { not: excludeOrderId } } : {}),
    },
    data: {
      status: OrderStatus.PAUSADA
    } as any
  })

  revalidatePath("/dashboard")

  return { success: true, count: result.count }
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
      genMarketplaces: true,
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
  
  if (order.status !== "LISTA" && order.status !== "REINTENTAR" && order.status !== "CANCELADA" && order.status !== "PAUSADA" && order.status !== "COMPLETADA") {
    return { error: "La orden ya fue iniciada" }
  }

  await prisma.botOrder.update({
    where: { id },
    data: { status: OrderStatus.GENERANDO } as any
  })
  
  try {
    const webhookPayload = {
      orderId: order.id,
      projectId: order.projectId,
      userId: order.userId,
      type: order.type,
      url: order.url,
      orderName: (order as any).orderName,
      socialNetwork: order.socialNetwork,
      postType: order.postType,
      quantity: order.quantity,
      intent: order.intent || null,
      status: OrderStatus.GENERANDO,
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
        marketplace: order.type === OrderType.MARKETPLACE ? (order as any).genMarketplaces[0] : null,
      },
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
      await prisma.botOrder.update({
        where: { id },
        data: { status: OrderStatus.REINTENTAR } as any
      })
      return { error: "Error al enviar la orden. El servidor respondió con error." }
    }
  } catch (error) {
    await prisma.botOrder.update({
      where: { id },
      data: { status: OrderStatus.REINTENTAR } as any
    })
    return { error: "Error al enviar la orden. Intenta de nuevo." }
  }
  
  revalidatePath(`/dashboard/projects/${order.projectId}`)
  
  return { success: true }
}

export async function retryOrder(id: string) {
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
      genMarketplaces: true,
    },
  })
  
  if (!order) {
    return { error: "Orden no encontrada" }
  }

  await prisma.botOrder.update({
    where: { id },
    data: { status: OrderStatus.GENERANDO } as any
  })
  
  try {
    const webhookPayload = {
      orderId: order.id,
      projectId: order.projectId,
      userId: order.userId,
      type: order.type,
      url: order.url,
      orderName: (order as any).orderName,
      socialNetwork: order.socialNetwork,
      postType: order.postType,
      quantity: order.quantity,
      intent: order.intent || null,
      status: OrderStatus.GENERANDO,
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
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        marketplace: order.type === OrderType.MARKETPLACE ? (order as any).genMarketplaces[0] : null,
      },
      project: order.project ? {
        id: order.project.id,
        name: order.project.name,
        userId: order.project.userId,
        stance: (order.project as any).stance,
        target: order.project.target ? {
          id: order.project.target.id,
          name: order.project.target.name,
          content: (order.project.target as any).content,
        } : null,
      } : null,
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: (globalThis as any).JSON.stringify([webhookPayload]),
    })
    
    if (!response.ok) {
      await prisma.botOrder.update({
        where: { id },
        data: { status: OrderStatus.REINTENTAR } as any
      })
      return { error: "Error al re-enviar la orden." }
    }
  } catch (error) {
    await prisma.botOrder.update({
      where: { id },
      data: { status: OrderStatus.REINTENTAR } as any
    })
    return { error: "Error de red al re-enviar la orden." }
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
            select: { deviceName: true, label: true }
          }
        },
        orderBy: { createdAt: "desc" },
      },
      genLives: {
        include: {
          device: {
            select: { deviceName: true, label: true }
          }
        },
        orderBy: { createdAt: "desc" },
      },
      project: {
        select: {
          name: true,
          id: true,
          stance: true,
          target: {
            select: { name: true }
          }
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

export async function completeOrder(id: string) {
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

  await prisma.botOrder.update({
    where: { id },
    data: { status: OrderStatus.COMPLETADA } as any,
  })
  
  revalidatePath(`/dashboard/projects/${order.projectId}`)
  
  return { success: true }
}

export async function cancelOrder(id: string) {
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

  await prisma.botOrder.update({
    where: { id },
    data: { status: OrderStatus.CANCELADA } as any,
  })
  
  revalidatePath(`/dashboard/projects/${order.projectId}`)
  
  return { success: true }
}

export async function updateGenComment(id: number, text: string) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }
  
  const comment = await prisma.genComment.findFirst({
    where: { id, userId: session },
  })
  
  if (!comment) {
    return { error: "Comentario no encontrado" }
  }
  
  await prisma.genComment.update({
    where: { id },
    data: { text } as any,
  })
  
  revalidatePath(`/dashboard/orders/${comment.orderId}/comments`)
  
  return { success: true }
}

export async function reopenOrder(id: string) {
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
  
  await prisma.botOrder.update({
    where: { id },
    data: { status: OrderStatus.LISTA } as any,
  })
  
  revalidatePath(`/dashboard/projects/${order.projectId}`)
  
  return { success: true }
}

export async function deleteGenComment(id: number) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }
  
  const comment = await prisma.genComment.findFirst({
    where: { id, userId: session },
  })
  
  if (!comment) {
    return { error: "Comentario no encontrado" }
  }
  
  await prisma.genComment.delete({
    where: { id },
  })
  
  revalidatePath(`/dashboard/orders/${comment.orderId}/comments`)
  
  return { success: true }
}

export async function updateInteractionStatus(id: number, type: OrderType, status: CommentStatus) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }

  let orderId: string | null = null

  if (type === OrderType.COMENTARIO) {
    const item = await prisma.genComment.findFirst({ where: { id, userId: session } })
    if (!item) return { error: "Registro no encontrado" }
    orderId = item.orderId
    await prisma.genComment.update({ where: { id }, data: { status } as any })
  } else if (type === OrderType.MEGUSTA) {
    const item = await prisma.genLike.findFirst({ where: { id, userId: session } })
    if (!item) return { error: "Registro no encontrado" }
    orderId = item.orderId
    await prisma.genLike.update({ where: { id }, data: { status } as any })
  } else if (type === OrderType.COMPARTIR) {
    const item = await prisma.genShare.findFirst({ where: { id, userId: session } })
    if (!item) return { error: "Registro no encontrado" }
    orderId = item.orderId
    await prisma.genShare.update({ where: { id }, data: { status } as any })
  } else if (type === OrderType.SEGUIMIENTO) {
    const item = await prisma.genFollow.findFirst({ where: { id, userId: session } })
    if (!item) return { error: "Registro no encontrado" }
    orderId = item.orderId
    await prisma.genFollow.update({ where: { id }, data: { status } as any })
  } else if (type === OrderType.REPORTE) {
    const item = await prisma.genReport.findFirst({ where: { id, userId: session } })
    if (!item) return { error: "Registro no encontrado" }
    orderId = item.orderId
    await prisma.genReport.update({ where: { id }, data: { status } as any })
  } else if (type === OrderType.GENLIVE) {
    const item = await prisma.genLive.findFirst({ where: { id, userId: session } })
    if (!item) return { error: "Registro no encontrado" }
    orderId = item.orderId
    await prisma.genLive.update({ where: { id }, data: { status } as any })
  } else if (type === OrderType.MARKETPLACE) {
    const item = await prisma.genMarketplace.findFirst({ where: { id, userId: session } })
    if (!item) return { error: "Registro no encontrado" }
    orderId = item.orderId
    await prisma.genMarketplace.update({ where: { id }, data: { status } as any })
  }

  if (orderId) {
    revalidatePath(`/dashboard/orders/${orderId}/executions`)
    revalidatePath(`/dashboard/orders/${orderId}/comments`)
  }

  return { success: true }
}
