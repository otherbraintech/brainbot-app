"use server"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getOrderForPDF(orderId: string) {
  const session = await getSession()
  
  if (!session) {
    return null
  }
  
  const order = await prisma.botOrder.findFirst({
    where: { 
      id: orderId,
      userId: session,
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
        orderBy: { createdAt: "asc" }
      },
      genLives: {
        include: { device: true },
        orderBy: { createdAt: "asc" }
      },
    },
  })
  
  return order
}
