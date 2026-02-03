"use server"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const session = await getSession()
  
  if (!session) {
    return null
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      plan: true,
    },
  })
  
  return user
}
