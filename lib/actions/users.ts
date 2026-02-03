"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      plan: true,
      commentLimit: true,
      commentsUsed: true,
      createdAt: true,
    },
  })
  
  return users
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      plan: true,
      commentLimit: true,
      commentsUsed: true,
      createdAt: true,
    },
  })
  
  return user
}

type CreateUserInput = {
  name: string
  username: string
  password: string
  role?: "ADMIN" | "USUARIO"
  plan?: "GRATIS" | "PRO"
  commentLimit?: number
}

export async function createUser(input: CreateUserInput) {
  // Check if username exists
  const existing = await prisma.user.findUnique({
    where: { usernameLower: input.username.toLowerCase() },
  })
  
  if (existing) {
    return { error: "El nombre de usuario ya existe" }
  }
  
  const passwordHash = await bcrypt.hash(input.password, 10)
  
  const user = await prisma.user.create({
    data: {
      name: input.name,
      username: input.username,
      usernameLower: input.username.toLowerCase(),
      passwordHash,
      role: input.role || "USUARIO",
      plan: input.plan || "GRATIS",
      commentLimit: input.commentLimit || 500,
    },
  })
  
  revalidatePath("/dashboard/users")
  return { success: true, user: { id: user.id, name: user.name } }
}

type UpdateUserInput = {
  id: string
  name?: string
  username?: string
  password?: string
  role?: "ADMIN" | "USUARIO"
  plan?: "GRATIS" | "PRO"
  commentLimit?: number
}

export async function updateUser(input: UpdateUserInput) {
  // Check if new username exists (if changing username)
  if (input.username) {
    const existing = await prisma.user.findFirst({
      where: {
        usernameLower: input.username.toLowerCase(),
        NOT: { id: input.id },
      },
    })
    
    if (existing) {
      return { error: "El nombre de usuario ya existe" }
    }
  }
  
  const updateData: Record<string, unknown> = {}
  
  if (input.name) updateData.name = input.name
  if (input.username) {
    updateData.username = input.username
    updateData.usernameLower = input.username.toLowerCase()
  }
  if (input.password) {
    updateData.passwordHash = await bcrypt.hash(input.password, 10)
  }
  if (input.role) updateData.role = input.role
  if (input.plan) updateData.plan = input.plan
  if (input.commentLimit !== undefined) updateData.commentLimit = input.commentLimit
  
  const user = await prisma.user.update({
    where: { id: input.id },
    data: updateData,
  })
  
  revalidatePath("/dashboard/users")
  return { success: true, user: { id: user.id, name: user.name } }
}

export async function deleteUser(id: string) {
  // Prevent deleting yourself? For now, just delete
  await prisma.user.delete({
    where: { id },
  })
  
  revalidatePath("/dashboard/users")
  return { success: true }
}
